import { memo } from 'react';
import { movingAverage } from '../lib/smoothing';
import { Sparkline } from './Sparkline';

type Props = {
  samples: number[];
  tokenCount: number;
  maxTokens: number;
  elapsedMs: number;
};

export const PanelStats = memo(function PanelStats({ samples, tokenCount, maxTokens, elapsedMs }: Props) {
  const smooth = movingAverage(samples, 3);
  const remaining = Math.max(0, maxTokens - tokenCount);
  const etaSec = smooth > 0 ? remaining / smooth : 0;
  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-border px-4 py-2 font-mono text-xs text-text-muted">
      <span>{smooth.toFixed(1)} tok/s</span>
      <Sparkline samples={samples} />
      <span aria-hidden>│</span>
      <span>
        {tokenCount} / {maxTokens}
      </span>
      <span aria-hidden>│</span>
      <span>{elapsedSec}s</span>
      {smooth > 0 && (
        <>
          <span aria-hidden>│</span>
          <span>ETA {etaSec.toFixed(1)}s</span>
        </>
      )}
    </div>
  );
});
