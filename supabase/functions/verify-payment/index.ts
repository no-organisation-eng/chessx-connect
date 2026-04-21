// Verify an on-chain USDC stake payment for a game.
// MVP: validates that the configured TREASURY address is set, then looks up
// the tx via the Base RPC for the configured network, checks recipient/amount.
//
// NOTE: This is a Phase-1 placeholder. Until BASE_TREASURY_ADDRESS is set to a
// real wallet, every verify call returns failed (per user's instruction).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// USDC contract addresses on Base
const USDC = {
  'base-mainnet': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  'base-sepolia': '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
} as const;

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

interface Body {
  tx_id: string;
  game_id: string;
  network?: 'base-sepolia' | 'base-mainnet';
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

    const { data: userData } = await userClient.auth.getUser(token);
    if (!userData?.user?.id) return json({ error: 'Invalid session' }, 401);
    const userId = userData.user.id;

    const body = (await req.json()) as Body;
    if (!body.tx_id || !body.game_id) return json({ error: 'tx_id and game_id required' }, 400);

    const network = (body.network ?? Deno.env.get('BASE_NETWORK') ?? 'base-sepolia') as
      'base-sepolia' | 'base-mainnet';
    const treasury = (Deno.env.get('BASE_TREASURY_ADDRESS') ?? '').toLowerCase();
    if (!treasury || treasury === '0x0000000000000000000000000000000000000000') {
      return json({
        error: 'Treasury wallet not configured yet. Set BASE_TREASURY_ADDRESS to enable stakes.',
        configured: false,
      }, 503);
    }

    const rpcUrl = network === 'base-mainnet'
      ? Deno.env.get('BASE_MAINNET_RPC_URL')
      : Deno.env.get('BASE_SEPOLIA_RPC_URL');
    if (!rpcUrl) return json({ error: `RPC URL not set for ${network}` }, 500);

    // Replay protection
    const { data: existing } = await admin
      .from('payments')
      .select('id, status, game_id, user_id')
      .eq('tx_id', body.tx_id)
      .maybeSingle();
    if (existing) {
      return json({ error: 'Transaction already processed', payment: existing }, 409);
    }

    // Look up the game
    const { data: game } = await admin
      .from('games')
      .select('id, white_id, black_id, stake_usdc, white_funded, black_funded')
      .eq('id', body.game_id)
      .maybeSingle();
    if (!game) return json({ error: 'Game not found' }, 404);
    if (game.white_id !== userId && game.black_id !== userId) {
      return json({ error: 'Not a player in this game' }, 403);
    }

    // Look up payer's wallet
    const { data: profile } = await admin
      .from('profiles')
      .select('wallet_address, wallet_verified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (!profile?.wallet_address || !profile.wallet_verified_at) {
      return json({ error: 'No verified wallet on profile' }, 400);
    }
    const payerWallet = profile.wallet_address.toLowerCase();

    // Fetch tx receipt from Base RPC
    const receipt = await rpc(rpcUrl, 'eth_getTransactionReceipt', [body.tx_id]);
    if (!receipt) return json({ error: 'Transaction not found on chain yet' }, 404);
    if (receipt.status !== '0x1') return json({ error: 'Transaction failed on chain' }, 400);

    const usdcAddr = USDC[network].toLowerCase();
    const stake = Number(game.stake_usdc);
    const expectedUnits = BigInt(Math.round(stake * 1_000_000)); // USDC has 6 decimals

    let matched = false;
    let amountSent = 0n;
    for (const log of (receipt.logs ?? [])) {
      if ((log.address ?? '').toLowerCase() !== usdcAddr) continue;
      if ((log.topics?.[0] ?? '').toLowerCase() !== TRANSFER_TOPIC) continue;
      const from = '0x' + (log.topics[1] as string).slice(26).toLowerCase();
      const to = '0x' + (log.topics[2] as string).slice(26).toLowerCase();
      const value = BigInt(log.data);
      if (from === payerWallet && to === treasury && value >= expectedUnits) {
        matched = true;
        amountSent = value;
        break;
      }
    }
    if (!matched) {
      return json({
        error: 'No matching USDC Transfer in this tx (sender, recipient, or amount mismatch)',
      }, 400);
    }

    // Insert payment + flip the funded flag
    const { error: payErr } = await admin.from('payments').insert({
      tx_id: body.tx_id,
      user_id: userId,
      game_id: game.id,
      amount_usdc: Number(amountSent) / 1_000_000,
      from_address: payerWallet,
      to_address: treasury,
      network,
      status: 'verified',
      verified_at: new Date().toISOString(),
      raw_payload: receipt,
    });
    if (payErr) return json({ error: payErr.message }, 500);

    const fundedField = game.white_id === userId ? 'white_funded' : 'black_funded';
    const otherFunded = game.white_id === userId ? game.black_funded : game.white_funded;
    const newStatus = otherFunded ? 'active' : 'waiting';
    await admin
      .from('games')
      .update({ [fundedField]: true, status: newStatus })
      .eq('id', game.id);

    return json({ ok: true, status: newStatus });
  } catch (e) {
    console.error('verify-payment error', e);
    return json({ error: e instanceof Error ? e.message : 'unknown' }, 500);
  }
});

async function rpc(url: string, method: string, params: unknown[]) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`RPC ${method}: ${j.error.message}`);
  return j.result;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
