export function movingAverage(samples: number[], window?: number): number {
  if (samples.length === 0) return 0;
  if (window === 0) return 0;
  const slice = window && window > 0 ? samples.slice(-window) : samples;
  if (slice.length === 0) return 0;
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}
