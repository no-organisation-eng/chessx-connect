import { useRef, useCallback } from 'react';

export function useChessSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  const playTone = useCallback((freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not available
    }
  }, [getCtx]);

  const playMove = useCallback(() => playTone(600, 0.08, 'sine', 0.12), [playTone]);
  const playCapture = useCallback(() => {
    playTone(300, 0.15, 'square', 0.1);
    setTimeout(() => playTone(200, 0.1, 'square', 0.08), 50);
  }, [playTone]);
  const playCheck = useCallback(() => {
    playTone(800, 0.12, 'sine', 0.15);
    setTimeout(() => playTone(1000, 0.15, 'sine', 0.12), 100);
  }, [playTone]);
  const playCheckmate = useCallback(() => {
    playTone(523, 0.2, 'sine', 0.15);
    setTimeout(() => playTone(659, 0.2, 'sine', 0.15), 200);
    setTimeout(() => playTone(784, 0.3, 'sine', 0.15), 400);
  }, [playTone]);
  const playCastle = useCallback(() => {
    playTone(500, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(600, 0.08, 'sine', 0.1), 80);
  }, [playTone]);
  const playPromotion = useCallback(() => {
    playTone(400, 0.15, 'triangle', 0.12);
    setTimeout(() => playTone(600, 0.15, 'triangle', 0.12), 120);
    setTimeout(() => playTone(800, 0.2, 'triangle', 0.15), 240);
  }, [playTone]);
  const playGameOver = useCallback(() => {
    playTone(400, 0.3, 'sine', 0.12);
    setTimeout(() => playTone(300, 0.3, 'sine', 0.12), 300);
    setTimeout(() => playTone(200, 0.5, 'sine', 0.1), 600);
  }, [playTone]);
  const playFlag = useCallback(() => playTone(200, 0.5, 'sawtooth', 0.08), [playTone]);

  return { playMove, playCapture, playCheck, playCheckmate, playCastle, playPromotion, playGameOver, playFlag };
}
