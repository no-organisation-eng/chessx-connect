import React from 'react';
import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import type { RealtimeStatus } from '@/hooks/useRealtimeGame';

const ConnectionStatus: React.FC<{ status: RealtimeStatus }> = ({ status }) => {
  if (status === 'connected') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-display tracking-widest uppercase text-primary">
        <Wifi size={11} /> LIVE
      </span>
    );
  }
  if (status === 'connecting') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-display tracking-widest uppercase text-muted-foreground">
        <Loader2 size={11} className="animate-spin" /> CONNECTING
      </span>
    );
  }
  if (status === 'reconnecting') {
    return (
      <span className="flex items-center gap-1 text-[10px] font-display tracking-widest uppercase text-accent">
        <Loader2 size={11} className="animate-spin" /> RECONNECTING
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-[10px] font-display tracking-widest uppercase text-destructive">
      <WifiOff size={11} /> OFFLINE
    </span>
  );
};

export default ConnectionStatus;
