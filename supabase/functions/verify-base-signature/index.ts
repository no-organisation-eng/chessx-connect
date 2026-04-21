// Verify a Base Account "Sign in with Ethereum"-style signature.
// Two modes:
//   1) link  → user is already authed; we link the wallet to their profile
//   2) login → no auth; create or sign in a shadow user keyed by wallet
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';
import { verifyMessage } from 'https://esm.sh/viem@2.21.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface Body {
  address: string;
  message: string;
  signature: `0x${string}`;
  mode: 'link' | 'login';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const { address, message, signature, mode } = body;

    if (!address || !message || !signature || !mode) {
      return json({ error: 'address, message, signature, mode required' }, 400);
    }

    // 1. Verify signature cryptographically
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature,
    });
    if (!valid) return json({ error: 'Invalid signature' }, 401);

    // 2. Sanity check the message includes a recent timestamp (replay protection)
    const tsMatch = message.match(/Issued At: ([\d-T:.Z]+)/);
    if (tsMatch) {
      const issuedAt = new Date(tsMatch[1]).getTime();
      if (isNaN(issuedAt) || Math.abs(Date.now() - issuedAt) > 5 * 60 * 1000) {
        return json({ error: 'Signature expired or invalid timestamp' }, 401);
      }
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const normalized = address.toLowerCase();

    if (mode === 'link') {
      // Require an authed user
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) return json({ error: 'Not authenticated' }, 401);
      const token = authHeader.slice(7);
      const { data: userData, error: cErr } = await admin.auth.getUser(token);
      if (cErr || !userData?.user?.id) return json({ error: 'Invalid session' }, 401);
      const userId = userData.user.id;

      // Ensure no other user has this wallet
      const { data: existing } = await admin
        .from('profiles')
        .select('user_id')
        .eq('wallet_address', normalized)
        .maybeSingle();
      if (existing && existing.user_id !== userId) {
        return json({ error: 'Wallet already linked to another account' }, 409);
      }

      const { error: upErr } = await admin
        .from('profiles')
        .update({ wallet_address: normalized, wallet_verified_at: new Date().toISOString() })
        .eq('user_id', userId);
      if (upErr) return json({ error: upErr.message }, 500);

      return json({ ok: true, mode: 'link', wallet: normalized });
    }

    // mode === 'login'
    // Find existing profile for this wallet
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('user_id')
      .eq('wallet_address', normalized)
      .maybeSingle();

    let userId: string;
    if (existingProfile?.user_id) {
      userId = existingProfile.user_id;
    } else {
      // Create a shadow auth user keyed to the wallet
      const shadowEmail = `wallet_${normalized}@chessx.local`;
      const password = crypto.randomUUID() + crypto.randomUUID();
      const { data: created, error: cErr } = await admin.auth.admin.createUser({
        email: shadowEmail,
        password,
        email_confirm: true,
        user_metadata: { wallet_address: normalized, auth_type: 'base_account' },
      });
      if (cErr || !created.user) return json({ error: cErr?.message ?? 'Could not create user' }, 500);
      userId = created.user.id;

      // Profile may have been auto-created by trigger; upsert wallet info
      await admin.from('profiles').upsert(
        {
          user_id: userId,
          wallet_address: normalized,
          wallet_verified_at: new Date().toISOString(),
          username: `chess_${normalized.slice(2, 8)}`,
        },
        { onConflict: 'user_id' },
      );
    }

    // Issue a magic link the client can use to sign in
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: `wallet_${normalized}@chessx.local`,
    });
    if (linkErr || !linkData) return json({ error: linkErr?.message ?? 'Could not issue session' }, 500);

    return json({
      ok: true,
      mode: 'login',
      wallet: normalized,
      user_id: userId,
      action_link: linkData.properties?.action_link,
      hashed_token: linkData.properties?.hashed_token,
      email_otp: linkData.properties?.email_otp,
    });
  } catch (e) {
    console.error('verify-base-signature error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
