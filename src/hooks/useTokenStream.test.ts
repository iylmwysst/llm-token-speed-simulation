import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useTokenStream } from './useTokenStream';

describe('useTokenStream', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    rafCallbacks = [];
    now = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('performance', { now: () => now });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function drainFrames(steps: number, stepMs: number) {
    for (let i = 0; i < steps; i++) {
      now += stepMs;
      const callbacks = rafCallbacks.slice();
      rafCallbacks.length = 0;
      callbacks.forEach((cb) => cb(now));
    }
  }

  it('emits tokens proportional to elapsed * speed', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({
        speed: 40,
        onAdvance: (n) => emitted.push(n),
      }),
    );

    act(() => result.current.start());
    act(() => drainFrames(10, 16));

    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(5);
    expect(total).toBeLessThanOrEqual(7);
  });

  it('pause stops advancing', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );

    act(() => result.current.start());
    act(() => drainFrames(5, 16));
    const before = emitted.reduce((a, b) => a + b, 0);

    act(() => result.current.pause());
    act(() => drainFrames(20, 16));
    const after = emitted.reduce((a, b) => a + b, 0);

    expect(after).toBe(before);
  });

  it('resume continues from where paused (no catch-up)', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );

    act(() => result.current.start());
    act(() => drainFrames(10, 16));
    act(() => result.current.pause());
    act(() => drainFrames(60, 16));
    act(() => result.current.resume());
    act(() => drainFrames(5, 16));

    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(22);
    expect(total).toBeLessThanOrEqual(26);
  });

  it('stop resets elapsed and token budget', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );

    act(() => result.current.start());
    act(() => drainFrames(10, 16));
    act(() => result.current.stop());
    emitted.length = 0;
    act(() => result.current.start());
    act(() => drainFrames(5, 16));

    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(7);
    expect(total).toBeLessThanOrEqual(9);
  });
});
