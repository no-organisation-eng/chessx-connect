import React, { useState } from 'react';
import { Coins, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { payStakeUsdc } from '@/lib/base';

interface Props {
  gameId: string;
  stakeUsdc: number;
  alreadyFunded: boolean;
}

const PayStakeButton: React.FC<Props> = ({ gameId, stakeUsdc, alreadyFunded }) => {
  const [busy, setBusy] = useState(false);

  if (stakeUsdc <= 0) return null;

  if (alreadyFunded) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-display tracking-widest uppercase">
        <CheckCircle2 size={14} /> Stake Paid · ${stakeUsdc}
      </div>
    );
  }

  const handlePay = async () => {
    setBusy(true);
    try {
      // 1. Get treasury address + network from backend
      const { data: cfg, error: cfgErr } = await supabase.functions.invoke('get-stake-config', { body: {} });
      if (cfgErr || !cfg?.configured) {
        toast.error(cfg?.configured === false ? 'Treasury wallet not configured yet' : (cfgErr?.message ?? 'Could not load stake config'));
        return;
      }

      // 2. Send USDC transfer via Base wallet
      toast.info('Approve the USDC transfer in your wallet…');
      const { txHash } = await payStakeUsdc({
        to: cfg.treasury,
        amountUsdc: stakeUsdc,
        network: cfg.network,
      });
      toast.success('Transaction sent — verifying on-chain…');

      // 3. Verify on backend
      const { data: ver, error: verErr } = await supabase.functions.invoke('verify-payment', {
        body: { tx_id: txHash, game_id: gameId, network: cfg.network },
      });
      if (verErr || ver?.error) {
        toast.error(ver?.error ?? verErr?.message ?? 'Verification failed');
        return;
      }
      toast.success('Stake verified ✓');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Stake payment failed';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={busy}
      className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-display tracking-widest uppercase"
    >
      {busy ? <Loader2 size={14} className="animate-spin" /> : <Coins size={14} />}
      {busy ? 'Processing…' : `Pay $${stakeUsdc} Stake`}
    </button>
  );
};

export default PayStakeButton;
