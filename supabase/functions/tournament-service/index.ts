import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, tournament_id, user_id } = await req.json();

    switch (action) {
      case 'join': {
        // 1. Fetch tournament info
        const { data: tourney, error: tErr } = await supabaseClient
          .from('tournaments')
          .select('*')
          .eq('id', tournament_id)
          .single();

        if (tErr || !tourney) throw new Error('Tournament not found');
        if (tourney.status !== 'registration') throw new Error('Registration is closed');

        // 2. Check if already joined
        const { data: existing } = await supabaseClient
          .from('tournament_participants')
          .select('id')
          .eq('tournament_id', tournament_id)
          .eq('user_id', user_id)
          .maybeSingle();
        
        if (existing) throw new Error('Already registered for this tournament');

        // 3. Process Entry Fee (Virtual USDC)
        const fee = Number(tourney.entry_fee_usdc);
        if (fee > 0) {
          const { data: profile } = await supabaseClient.from('users').select('usdc_balance').eq('id', user_id).single();
          if (!profile || Number(profile.usdc_balance) < fee) {
            throw new Error('Insufficient USDC balance for entry fee');
          }

          // Deduct
          await supabaseClient
            .from('users')
            .update({ usdc_balance: Number(profile.usdc_balance) - fee })
            .eq('id', user_id);
            
          // Log transaction
          await supabaseClient.from('transactions').insert({
            user_id,
            amount: fee,
            type: 'tournament_entry',
            direction: 'out',
            notes: `Entry fee for tournament: ${tourney.name}`
          });
        }

        // 4. Register Participant
        const { error: insErr } = await supabaseClient
          .from('tournament_participants')
          .insert({
            tournament_id,
            user_id,
            score: 0
          });

        if (insErr) throw insErr;

        return new Response(JSON.stringify({ ok: true, message: 'Successfully joined' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'start-round': {
        // 1. Fetch tournament and ensure it is in registration or active state
        const { data: tourney, error: tErr } = await supabaseClient
          .from('tournaments')
          .select('*, tournament_participants(user_id, username)')
          .eq('id', tournament_id)
          .single();

        if (tErr || !tourney) throw new Error('Tournament not found');
        
        const participants = tourney.tournament_participants;
        if (!participants || participants.length < 2) throw new Error('Not enough participants to start');

        // 2. Simple Random Pairing logic
        // Shuffle participants
        const shuffled = [...participants].sort(() => Math.random() - 0.5);
        const pairingMatches = [];

        for (let i = 0; i < shuffled.length; i += 2) {
          if (shuffled[i + 1]) {
            pairingMatches.push({
              tournament_id,
              white_user_id: shuffled[i].user_id,
              black_user_id: shuffled[i + 1].user_id,
              status: 'active',
              time_control: tourney.time_control || '10+5',
            });
          }
        }

        // 3. Insert Matches
        const { error: matchErr } = await supabaseClient
          .from('matches')
          .insert(pairingMatches);

        if (matchErr) throw matchErr;

        // 4. Update Tournament Status
        await supabaseClient
          .from('tournaments')
          .update({ status: 'active' })
          .eq('id', tournament_id);

        return new Response(JSON.stringify({ ok: true, matches_created: pairingMatches.length }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
