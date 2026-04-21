import { describe, expect, it } from 'vitest';
import { getEncoder } from './tokenizer';

describe('tokenizer', () => {
  it('encodes and decodes round-trip', async () => {
    const enc = await getEncoder();
    const ids = enc.encode('hello world');
    expect(ids.length).toBeGreaterThan(0);
    const decoded = enc.decode(ids);
    expect(decoded).toBe('hello world');
  });

  it('decodeOne returns a string for a single token id', async () => {
    const enc = await getEncoder();
    const ids = enc.encode('abc');
    const piece = enc.decodeOne(ids[0]);
    expect(typeof piece).toBe('string');
    expect(piece.length).toBeGreaterThan(0);
  });

  it('caches encoder instance on repeated calls', async () => {
    const a = await getEncoder();
    const b = await getEncoder();
    expect(a).toBe(b);
  });
});
