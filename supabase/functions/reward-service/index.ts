import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WIN_REWARD = 10;
const LOSS_REWARD = 2;
const DAILY_CAP = 100;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { match_id } = await req.json();

    // 1. Fetch match info
    const { data: match, error: matchErr } = await supabaseClient
      .from('matches')
      .select('*, white_user:white_user_id(username), black_user:black_user_id(username)')
      .eq('id', match_id)
      .single();

    if (matchErr || !match) throw new Error('Match not found');
    if (match.status !== 'completed') throw new Error('Match not yet completed');

    // 2. Check if already distributed
    const { data: existing } = await supabaseClient
      .from('rewards')
      .select('id')
      .eq('match_id', match_id)
      .maybeSingle();

    if (existing) return new Response(JSON.stringify({ ok: true, msg: 'Already distributed' }), { headers: corsHeaders });

    const winnerId = match.result === 'white' ? match.white_user_id : (match.result === 'black' ? match.black_user_id : null);
    const users = [match.white_user_id, match.black_user_id];
    
    const results = [];

    for (const userId of users) {
      if (!userId) continue;
      
      const isWinner = userId === winnerId;
      const amount = isWinner ? WIN_REWARD : LOSS_REWARD;

      // 3. Check Daily Cap
      const today = new Date().toISOString().split('T')[0];
      const { data: dailySum } = await supabaseClient
        .from('rewards')
        .select('chx_amount')
        .eq('user_id', userId)
        .eq('daily_cap_date', today);

      const totalToday = (dailySum || []).reduce((acc, curr) => acc + Number(curr.chx_amount), 0);
      
      if (totalToday >= DAILY_CAP) {
        results.push({ userId, status: 'capped' });
        continue;
      }

      const finalAmount = Math.min(amount, DAILY_CAP - totalToday);

      // 4. Distribute
      const { error: insErr } = await supabaseClient
        .from('rewards')
        .insert({
          user_id: userId,
          match_id: match_id,
          source: 'match_win', // simplify for now
          chx_amount: finalAmount,
          daily_cap_date: today,
          status: 'distributed',
          distributed_at: new Date().toISOString()
        });

      if (!insErr) {
        await supabaseClient.rpc('increment_chx_balance', { 
          target_user_id: userId, 
          amount: finalAmount 
        });
      }
      
      results.push({ userId, amount: finalAmount, status: 'distributed' });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
