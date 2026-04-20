import React, { useState } from 'react';
import { Wallet, ShieldCheck, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { linkBaseWallet } from '@/lib/base';

interface Props {
  walletAddress: string | null;
  walletVerifiedAt: string | null;
}

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

const WalletLinkCard: React.FC<Props> = ({ walletAddress, walletVerifiedAt }) => {
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();

  const handleLink = async () => {
    setBusy(true);
    try {
      const { address } = await linkBaseWallet();
      toast.success(`Wallet linked: ${short(address)}`);
      qc.invalidateQueries({ queryKey: ['profile'] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not link wallet');
    } finally {
      setBusy(false);
    }
  };

  const verified = !!walletAddress && !!walletVerifiedAt;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="font-display text-sm font-semibold tracking-wider text-foreground mb-3 flex items-center gap-2">
        <Wallet size={16} /> BASE WALLET
      </h3>

      {verified && walletAddress ? (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-muted-foreground">{short(walletAddress)}</span>
            <a
              href={`https://basescan.org/address/${walletAddress}`}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground hover:text-primary"
              aria-label="View on BaseScan"
            >
              <ExternalLink size={11} />
            </a>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-display tracking-widest uppercase text-primary bg-primary/10 border border-primary/30 px-2 py-1 rounded">
            <ShieldCheck size={11} /> Verified
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            Link your Base wallet to deposit and withdraw USDC stakes.
          </p>
          <button
            onClick={handleLink}
            disabled={busy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-xs font-display tracking-widest uppercase"
          >
            {busy ? <Loader2 size={12} className="animate-spin" /> : <Wallet size={12} />}
            {busy ? 'Linking…' : 'Link Wallet'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletLinkCard;
