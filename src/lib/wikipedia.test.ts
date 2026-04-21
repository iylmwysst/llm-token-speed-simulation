import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchRandomSummary } from './wikipedia';

describe('fetchRandomSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns { title, extract } on success', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'Hello', extract: 'World of text.' }),
    });

    const p = fetchRandomSummary('en');
    await vi.runAllTimersAsync();
    const result = await p;

    expect(result).toEqual({ title: 'Hello', extract: 'World of text.' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://en.wikipedia.org/api/rest_v1/page/random/summary',
      expect.any(Object),
    );
  });

  it('retries on failure and eventually succeeds', async () => {
    (globalThis.fetch as any)
      .mockRejectedValueOnce(new Error('net'))
      .mockRejectedValueOnce(new Error('net'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ title: 'T', extract: 'E' }),
      });

    const p = fetchRandomSummary('th');
    await vi.runAllTimersAsync();
    const result = await p;

    expect(result.title).toBe('T');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws after 3 failed attempts', async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error('net'));

    const p = fetchRandomSummary('en').catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await p;

    expect(err).toBeInstanceOf(Error);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws when response is not ok', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });

    const p = fetchRandomSummary('en').catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await p;

    expect(err).toBeInstanceOf(Error);
  });
});
