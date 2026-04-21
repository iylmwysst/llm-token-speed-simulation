import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePanel } from './usePanel';
import { fetchRandomSummary } from '../lib/wikipedia';
import { getEncoder } from '../lib/tokenizer';

vi.mock('../lib/wikipedia', () => ({
  fetchRandomSummary: vi.fn(),
}));

vi.mock('../lib/tokenizer', () => ({
  getEncoder: vi.fn(),
}));

describe('usePanel', () => {
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

    const decodeMap: Record<number, string> = {
      1: 'En',
      2: 'gl',
      3: 'ish',
      4: 'ไท',
      5: 'ย',
    };

    vi.mocked(getEncoder).mockResolvedValue({
      encode: (text: string) => {
        if (text === 'English text') return [1, 2, 3];
        if (text === 'Thai text') return [4, 5];
        return [];
      },
      decode: (ids: number[]) => ids.map((id) => decodeMap[id]).join(''),
      decodeOne: (id: number) => decodeMap[id],
    });

    vi.mocked(fetchRandomSummary).mockImplementation(async (lang: string) => {
      if (lang === 'th') {
        return { title: 'Thai', extract: 'Thai text' };
      }

      return { title: 'English', extract: 'English text' };
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  function drainFrames(steps: number, stepMs: number) {
    for (let i = 0; i < steps; i++) {
      now += stepMs;
      const callbacks = rafCallbacks.slice();
      rafCallbacks.length = 0;
      callbacks.forEach((cb) => cb(now));
    }
  }

  it('clears current output and restarts with the new language after a paused language change', async () => {
    const { result } = renderHook(() =>
      usePanel({
        id: 'panel-1',
        config: { lang: 'en', speed: 10, maxTokens: 4 },
      }),
    );

    await act(async () => {
      await result.current.actions.start();
    });
    act(() => drainFrames(7, 16));

    expect(result.current.state.tokens.length).toBeGreaterThan(0);
    expect(result.current.state.status).toBe('running');

    act(() => {
      result.current.actions.pause();
    });

    expect(result.current.state.status).toBe('paused');

    act(() => {
      result.current.actions.updateConfig({ lang: 'th' });
    });

    expect(result.current.state.config.lang).toBe('th');
    expect(result.current.state.status).toBe('idle');
    expect(result.current.state.tokens).toEqual([]);
    expect(result.current.state.articles).toEqual([]);

    await act(async () => {
      await result.current.actions.start();
    });
    act(() => drainFrames(7, 16));

    expect(fetchRandomSummary).toHaveBeenCalledTimes(2);
    expect(fetchRandomSummary).toHaveBeenNthCalledWith(1, 'en');
    expect(fetchRandomSummary).toHaveBeenNthCalledWith(2, 'th');
    expect(result.current.state.tokens).toEqual(['ไท']);
  });
});
