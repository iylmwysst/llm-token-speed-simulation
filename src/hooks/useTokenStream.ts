import { useCallback, useEffect, useRef, type MutableRefObject } from 'react';

type Options = {
  speedRef: MutableRefObject<number>;
  onAdvance: (tokensToAdd: number, elapsedMs: number) => void;
  onFrame?: (elapsedMs: number) => void;
};

export function useTokenStream({ speedRef, onAdvance, onFrame }: Options) {
  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const elapsedRef = useRef(0);
  const bufferedTokensRef = useRef(0);
  const runningRef = useRef(false);

  const tick = useCallback((now: number) => {
    if (!runningRef.current) return;

    const dt = now - lastFrameRef.current;
    lastFrameRef.current = now;
    elapsedRef.current += dt;

    bufferedTokensRef.current += (dt * speedRef.current) / 1000;
    const add = Math.floor(bufferedTokensRef.current);

    if (add > 0) {
      bufferedTokensRef.current -= add;
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
    bufferedTokensRef.current = 0;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, pause, resume, stop };
}
