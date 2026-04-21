import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";
import { Chess } from "https://esm.sh/chess.js@1.0.0-beta.7";

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

    const { match_id, user_id, move_uci, time_spent_ms, fen_before } = await req.json();

    const flags = [];

    // 1. Humanity Check (Speed)
    // Most humans cannot react and move in under 200ms consistently.
    if (time_spent_ms < 200) {
      flags.push({
        type: 'accuracy_spike',
        severity: 'medium',
        details: { reason: 'Inhuman move speed', ms: time_spent_ms }
      });
    }

    // 2. Engine Correlation Check (Accuracy)
    const { data: moveData } = await supabaseClient
      .from('moves')
      .select('stockfish_eval, is_best_move')
      .eq('match_id', match_id)
      .order('ply', { ascending: false })
      .limit(10);

    if (moveData && moveData.length >= 5) {
      const bestMoveCount = moveData.filter(m => m.is_best_move).length;
      const bestMovePct = (bestMoveCount / moveData.length) * 100;

      // If last 10 moves were 100% best engine moves, flag as engine use.
      if (bestMovePct > 95) {
        flags.push({
          type: 'engine_use',
          severity: 'critical',
          details: { reason: 'Suspiciously high engine correlation', accuracy: bestMovePct }
        });
      }
    }

    // 3. Legality Check
    const chess = new Chess(fen_before);
    try {
      const move = chess.move(move_uci);
      if (!move) throw new Error('Illegal move');
    } catch (e) {
      flags.push({
        type: 'engine_use',
        severity: 'critical',
        details: { reason: 'Illegal move attempted', move: move_uci, fen: fen_before }
      });
    }

    // 3. Log Flags if any
    for (const flag of flags) {
      await supabaseClient
        .from('anticheat_flags')
        .insert({
          match_id,
          user_id,
          flag_type: flag.type,
          severity: flag.severity,
          details: flag.details
        });
        
      // Optionally update user risk level
      if (flag.severity === 'critical') {
        await supabaseClient
          .from('users')
          .update({ risk_level: 'high' })
          .eq('id', user_id);
      }
    }

    return new Response(JSON.stringify({ ok: true, flags: flags.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
