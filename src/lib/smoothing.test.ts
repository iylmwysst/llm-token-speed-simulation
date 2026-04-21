import { describe, expect, it } from 'vitest';
import { movingAverage } from './smoothing';

describe('movingAverage', () => {
  it('returns 0 for empty input', () => {
    expect(movingAverage([])).toBe(0);
  });

  it('returns the single value when there is one sample', () => {
    expect(movingAverage([42])).toBe(42);
  });

  it('averages all samples when no window is provided', () => {
    expect(movingAverage([10, 20, 30])).toBe(20);
  });

  it('averages only the last N samples when window is provided', () => {
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it('returns 0 when window is 0', () => {
    expect(movingAverage([1, 2, 3], 0)).toBe(0);
  });
});
