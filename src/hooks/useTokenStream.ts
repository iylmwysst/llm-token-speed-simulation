import { useCallback, useEffect, useRef } from 'react';

type Options = {
  speed: number;
  onAdvance: (tokensToAdd: number, elapsedMs: number) => void;
  onFrame?: (elapsedMs: number) => void;
};

export function useTokenStream({ speed, onAdvance, onFrame }: Options) {
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const emittedRef = useRef(0);
  const runningRef = useRef(false);

  const tick = useCallback((now: number) => {
    if (!runningRef.current) return;

    const dt = now - lastFrameRef.current;
    lastFrameRef.current = now;
    elapsedRef.current += dt;

    const expected = Math.floor((elapsedRef.current * speedRef.current) / 1000);
    const add = expected - emittedRef.current;

    if (add > 0) {
      emittedRef.current = expected;
      onAdvanceRef.current(add, elapsedRef.current);
    }

    onFrameRef.current?.(elapsedRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    elapsedRef.current = 0;
    emittedRef.current = 0;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, pause, resume, stop };
}
