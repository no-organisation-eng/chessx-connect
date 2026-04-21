// Create a match invite: returns a code that another player can open
// at /play/:code to join the same realtime game row.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface Body {
  time_control: string;
  time_seconds: number;
  increment_seconds: number;
  stake_usdc?: number;
  creator_color?: 'w' | 'b' | 'random';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Not authenticated' }, 401);
    }
    const token = authHeader.slice(7);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: userData, error: cErr } = await userClient.auth.getUser(token);
    if (cErr || !userData?.user?.id) return json({ error: 'Invalid session' }, 401);
    const userId = userData.user.id;

    const body = (await req.json()) as Body;
    if (!body.time_control || !body.time_seconds) {
      return json({ error: 'time_control and time_seconds required' }, 400);
    }

    const code = generateCode(8);
    const { data: invite, error: invErr } = await admin
      .from('match_invites')
      .insert({
        code,
        creator_id: userId,
        time_control: body.time_control,
        time_seconds: body.time_seconds,
        increment_seconds: body.increment_seconds ?? 0,
        stake_usdc: body.stake_usdc ?? 0,
        creator_color: body.creator_color ?? 'random',
        status: 'open',
      })
      .select('*')
      .single();
    if (invErr) return json({ error: invErr.message }, 500);

    return json({ ok: true, invite });
  } catch (e) {
    console.error('create-match-invite error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function generateCode(len: number) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  for (const b of buf) s += alphabet[b % alphabet.length];
  return s;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
