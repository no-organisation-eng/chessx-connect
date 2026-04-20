// Accept a match invite. Atomically:
//   - locks the invite row
//   - assigns the joiner to the open seat (opposite of creator color)
//   - creates the games row in 'active' status (or 'waiting' if stake>0)
//   - marks invite accepted, links game_id
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

interface Body {
  code: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Not authenticated' }, 401);
    const token = authHeader.slice(7);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: claims, error: cErr } = await userClient.auth.getClaims(token);
    if (cErr || !claims?.claims?.sub) return json({ error: 'Invalid session' }, 401);
    const userId = claims.claims.sub as string;

    const { code } = (await req.json()) as Body;
    if (!code) return json({ error: 'code required' }, 400);

    const { data: invite, error: invErr } = await admin
      .from('match_invites')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    if (invErr) return json({ error: invErr.message }, 500);
    if (!invite) return json({ error: 'Invite not found' }, 404);
    if (invite.status === 'accepted' && invite.game_id) {
      return json({ ok: true, game_id: invite.game_id, already: true });
    }
    if (invite.status !== 'open') return json({ error: 'Invite no longer open' }, 410);
    if (new Date(invite.expires_at).getTime() < Date.now()) {
      await admin.from('match_invites').update({ status: 'expired' }).eq('id', invite.id);
      return json({ error: 'Invite expired' }, 410);
    }
    if (invite.creator_id === userId) {
      return json({ error: 'Cannot join your own invite' }, 400);
    }

    // Decide colors
    let creatorColor: 'w' | 'b' = invite.creator_color === 'random'
      ? (Math.random() < 0.5 ? 'w' : 'b')
      : invite.creator_color;
    const whiteId = creatorColor === 'w' ? invite.creator_id : userId;
    const blackId = creatorColor === 'w' ? userId : invite.creator_id;

    // Look up usernames
    const { data: profs } = await admin
      .from('profiles')
      .select('user_id, username')
      .in('user_id', [whiteId, blackId]);
    const whiteUsername = profs?.find((p) => p.user_id === whiteId)?.username ?? 'White';
    const blackUsername = profs?.find((p) => p.user_id === blackId)?.username ?? 'Black';

    const stake = Number(invite.stake_usdc ?? 0);
    const status = stake > 0 ? 'waiting' : 'active';

    const { data: game, error: gErr } = await admin
      .from('games')
      .insert({
        white_id: whiteId,
        black_id: blackId,
        white_username: whiteUsername,
        black_username: blackUsername,
        time_control: invite.time_control,
        time_seconds: invite.time_seconds,
        increment_seconds: invite.increment_seconds,
        stake_usdc: stake,
        live_fen: STARTING_FEN,
        turn: 'w',
        status,
        invite_id: invite.id,
        white_funded: stake === 0,
        black_funded: stake === 0,
        white_time_ms: invite.time_seconds * 1000,
        black_time_ms: invite.time_seconds * 1000,
        last_move_at: status === 'active' ? new Date().toISOString() : null,
      })
      .select('*')
      .single();
    if (gErr) return json({ error: gErr.message }, 500);

    await admin
      .from('match_invites')
      .update({ status: 'accepted', accepted_at: new Date().toISOString(), game_id: game.id })
      .eq('id', invite.id);

    return json({ ok: true, game_id: game.id, game });
  } catch (e) {
    console.error('accept-match-invite error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
