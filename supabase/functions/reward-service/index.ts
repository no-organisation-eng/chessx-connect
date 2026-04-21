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
    
    // 3. Elo Calculation
    const { data: wProfile } = await supabaseClient.from('users').select('platform_rating').eq('id', match.white_user_id).single();
    const { data: bProfile } = await supabaseClient.from('users').select('platform_rating').eq('id', match.black_user_id).single();
    
    const rW = Number(wProfile?.platform_rating ?? 1200);
    const rB = Number(bProfile?.platform_rating ?? 1200);
    
    const getExpected = (rA: number, rB: number) => 1 / (1 + Math.pow(10, (rB - rA) / 400));
    const expW = getExpected(rW, rB);
    const expB = getExpected(rB, rW);
    
    const K = 32;
    const scoreW = match.result === 'white' ? 1 : (match.result === 'black' ? 0 : 0.5);
    const scoreB = 1 - scoreW;
    
    const newW = Math.round(rW + K * (scoreW - expW));
    const newB = Math.round(rB + K * (scoreB - expB));
    
    const getTier = (r: number) => {
      if (r < 1200) return 'Beginner';
      if (r < 1600) return 'Intermediate';
      if (r < 2000) return 'Advanced';
      return 'Pro';
    };

    // 4. Update Match Ratings
    await supabaseClient.from('matches').update({
      white_rating_before: rW,
      white_rating_after: newW,
      black_rating_before: rB,
      black_rating_after: newB
    }).eq('id', match_id);

    // 5. Update User Profiles
    await supabaseClient.from('users').update({ platform_rating: newW, skill_tier: getTier(newW) }).eq('id', match.white_user_id);
    await supabaseClient.from('users').update({ platform_rating: newB, skill_tier: getTier(newB) }).eq('id', match.black_user_id);

    // 6. Record Ratings History
    await supabaseClient.from('ratings').insert([
      { user_id: match.white_user_id, match_id: match_id, time_control: match.time_control, rating_before: rW, rating_after: newW, delta: newW - rW },
      { user_id: match.black_user_id, match_id: match_id, time_control: match.time_control, rating_before: rB, rating_after: newB, delta: newB - rB }
    ]);

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

        // 5. Notify User
        const ratingDelta = userId === match.white_user_id ? (newW - rW) : (newB - rB);
        const ratingSymbol = ratingDelta >= 0 ? '+' : '';
        
        await supabaseClient.functions.invoke('notifications-service', {
          body: {
            user_id: userId,
            type: 'reward_received',
            title: isWinner ? 'Victory!' : 'Match Completed',
            body: `You earned ${finalAmount} CHX. Rating: ${newW} (${ratingSymbol}${ratingDelta})`,
            payload: { match_id, amount: finalAmount, rating: newW }
          }
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
