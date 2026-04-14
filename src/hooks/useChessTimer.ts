import { useState, useRef, useCallback, useEffect } from 'react';

export interface TimerConfig {
  initialTime: number;
  increment: number;
}

export const TIME_CONTROLS: Record<string, TimerConfig> = {
  'Bullet 1+0': { initialTime: 60, increment: 0 },
  'Bullet 2+1': { initialTime: 120, increment: 1 },
  'Blitz 3+0': { initialTime: 180, increment: 0 },
  'Blitz 5+3': { initialTime: 300, increment: 3 },
  'Rapid 10+5': { initialTime: 600, increment: 5 },
  'Classical 15+10': { initialTime: 900, increment: 10 },
  'Unlimited': { initialTime: Infinity, increment: 0 },
};

export function useChessTimer(config: TimerConfig) {
  const [whiteTime, setWhiteTime] = useState(config.initialTime);
  const [blackTime, setBlackTime] = useState(config.initialTime);
  const [activeClock, setActiveClock] = useState<'w' | 'b' | null>(null);
  const [flagged, setFlagged] = useState<'w' | 'b' | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef<number>(0);

  const isUnlimited = config.initialTime === Infinity;

  const stopClock = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setActiveClock(null);
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    setActiveClock((current) => {
      if (!current) return current;
      const setter = current === 'w' ? setWhiteTime : setBlackTime;
      setter((prev) => {
        const next = Math.max(0, prev - elapsed);
        if (next <= 0) {
          setFlagged(current);
          stopClock();
          return 0;
        }
        return next;
      });
      return current;
    });
  }, [stopClock]);

  const startClock = useCallback((color: 'w' | 'b') => {
    if (isUnlimited) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    lastTickRef.current = Date.now();
    setActiveClock(color);
    intervalRef.current = setInterval(tick, 100);
  }, [tick, isUnlimited]);

  const switchClock = useCallback((toColor: 'w' | 'b') => {
    if (isUnlimited) return;
    const justMoved = toColor === 'w' ? 'b' : 'w';
    if (config.increment > 0) {
      const setter = justMoved === 'w' ? setWhiteTime : setBlackTime;
      setter((prev) => prev + config.increment);
    }
    startClock(toColor);
  }, [config.increment, startClock, isUnlimited]);

  const resetTimer = useCallback(() => {
    stopClock();
    setWhiteTime(config.initialTime);
    setBlackTime(config.initialTime);
    setFlagged(null);
  }, [config.initialTime, stopClock]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    resetTimer();
  }, [config.initialTime, config.increment]);

  const formatTime = (seconds: number): string => {
    if (seconds === Infinity) return '∞';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    if (seconds < 10) return `${m}:${s.toString().padStart(2, '0')}.${tenths}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return {
    whiteTime,
    blackTime,
    activeClock,
    flagged,
    isUnlimited,
    startClock,
    switchClock,
    stopClock,
    resetTimer,
    formatTime,
  };
}
