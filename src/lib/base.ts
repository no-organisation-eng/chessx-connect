import { createBaseAccountSDK } from '@base-org/account';
import { supabase } from '@/integrations/supabase/client';

let _sdk: ReturnType<typeof createBaseAccountSDK> | null = null;

function getSdk() {
  if (!_sdk) {
    _sdk = createBaseAccountSDK({
      appName: 'ChessX',
      appLogoUrl: typeof window !== 'undefined' ? `${window.location.origin}/favicon.ico` : undefined,
    });
  }
  return _sdk;
}

function buildSignInMessage(address: string) {
  const issuedAt = new Date().toISOString();
  const domain = typeof window !== 'undefined' ? window.location.host : 'chessx';
  const nonce = crypto.getRandomValues(new Uint32Array(2)).join('');
  return [
    `${domain} wants you to sign in with your Base account:`,
    address,
    '',
    'Sign in to ChessX',
    '',
    `URI: ${typeof window !== 'undefined' ? window.location.origin : ''}`,
    `Version: 1`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join('\n');
}

export async function connectBaseWallet(): Promise<{ address: string; message: string; signature: `0x${string}` }> {
  const provider = getSdk().getProvider();
  // 1. Connect wallet
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  const address = accounts?.[0];
  if (!address) throw new Error('No wallet account returned');

  // 2. Sign a SIWE-style message
  const message = buildSignInMessage(address);
  const signature = (await provider.request({
    method: 'personal_sign',
    params: [message, address],
  })) as `0x${string}`;

  return { address, message, signature };
}

/** Sign in (or sign up) via Base wallet — creates/finds a user keyed to the wallet. */
export async function signInWithBase() {
  const { address, message, signature } = await connectBaseWallet();
  const { data, error } = await supabase.functions.invoke('verify-base-signature', {
    body: { address, message, signature, mode: 'login' },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? 'Base sign-in failed');

  // Use the returned magic-link token to establish a session
  if (data.email_otp) {
    const { error: otpErr } = await supabase.auth.verifyOtp({
      email: `wallet_${address.toLowerCase()}@chessx.local`,
      token: data.email_otp,
      type: 'magiclink',
    });
    if (otpErr) throw otpErr;
  }
  return { address: data.wallet as string, userId: data.user_id as string };
}

// USDC contract addresses on Base
const USDC_ADDRESS = {
  'base-mainnet': '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
  'base-sepolia': '0x036cbd53842c5426634e7929541ec2318f3dcf7e',
} as const;
const CHAIN_ID_HEX = {
  'base-mainnet': '0x2105', // 8453
  'base-sepolia': '0x14a34', // 84532
} as const;

type BaseNetwork = 'base-mainnet' | 'base-sepolia';

/** ERC-20 transfer(address,uint256) selector + encoded args. */
function encodeTransfer(to: string, amount: bigint): string {
  const cleanTo = to.toLowerCase().replace(/^0x/, '').padStart(64, '0');
  const amountHex = amount.toString(16).padStart(64, '0');
  return `0xa9059cbb${cleanTo}${amountHex}`;
}

/**
 * Pay a USDC stake to the configured treasury via the user's Base wallet.
 * Returns the on-chain transaction hash.
 */
export async function payStakeUsdc(opts: {
  to: string;
  amountUsdc: number;
  network: BaseNetwork;
}): Promise<{ txHash: `0x${string}`; from: string }> {
  const provider = getSdk().getProvider();
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
  const from = accounts?.[0];
  if (!from) throw new Error('No wallet account');

  // Try to switch to the right chain (silent if already on it).
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: CHAIN_ID_HEX[opts.network] }],
    });
  } catch { /* user may decline; tx will likely still go via the requested network in Base Account */ }

  const usdc = USDC_ADDRESS[opts.network];
  const units = BigInt(Math.round(opts.amountUsdc * 1_000_000)); // USDC has 6 decimals
  const data = encodeTransfer(opts.to, units);

  const txHash = (await provider.request({
    method: 'eth_sendTransaction',
    params: [{ from, to: usdc, data, value: '0x0' }],
  })) as `0x${string}`;

  return { txHash, from };
}

/** Link a Base wallet to the currently signed-in user. */
export async function linkBaseWallet() {
  const { address, message, signature } = await connectBaseWallet();
  const { data, error } = await supabase.functions.invoke('verify-base-signature', {
    body: { address, message, signature, mode: 'link' },
  });
  if (error) throw new Error(error.message);
  if (!data?.ok) throw new Error(data?.error ?? 'Wallet link failed');
  return { address: data.wallet as string };
}
