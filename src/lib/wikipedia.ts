import type { WikipediaSummary } from '../types';

const BACKOFF_MS = [1000, 2000, 4000];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchRandomSummary(lang: string): Promise<WikipediaSummary> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
  let lastErr: unknown;

  for (let i = 0; i < BACKOFF_MS.length; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { title: data.title ?? '', extract: data.extract ?? '' };
    } catch (err) {
      lastErr = err;
      if (i < BACKOFF_MS.length - 1) {
        await sleep(BACKOFF_MS[i]);
      }
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}
