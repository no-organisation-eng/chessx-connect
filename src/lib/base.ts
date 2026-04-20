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
