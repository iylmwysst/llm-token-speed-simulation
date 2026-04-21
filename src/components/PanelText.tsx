import { memo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { ArticleMarker, PanelStatus } from '../types';

type Props = {
  tokens: string[];
  articles: ArticleMarker[];
  status: PanelStatus;
  error?: string;
  onRetry: () => void;
};

export const PanelText = memo(function PanelText({ tokens, articles, status, error, onRetry }: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [articles.length, status, tokens.length]);

  if (status === 'fetching' && tokens.length === 0) {
    return (
      <div className="flex h-[22rem] flex-1 items-center justify-center overflow-auto p-6 font-mono text-sm text-text-subtle md:h-[24rem]">
        Fetching article…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex h-[22rem] flex-1 flex-col items-center justify-center gap-3 overflow-auto p-6 font-mono text-sm text-text-muted md:h-[24rem]">
        <div>⚠ Could not reach Wikipedia.</div>
        {error && <div className="text-xs text-text-subtle">{error}</div>}
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-border px-3 py-1 hover:bg-border"
        >
          Retry
        </button>
      </div>
    );
  }

  const articleBoundaries = new Map(articles.slice(1).map((article, index) => [article.startTokenIndex, index + 2]));

  return (
    <div
      ref={scrollRef}
      className="h-[22rem] flex-1 overflow-auto p-6 text-[15px] leading-relaxed md:h-[24rem]"
    >
      {tokens.map((token, index) => (
        <span key={index}>
          {articleBoundaries.has(index) && (
            <div className="my-6 flex items-center justify-center font-mono text-xs text-text-subtle">
              ─── Article {articleBoundaries.get(index)} ───
            </div>
          )}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08, ease: 'linear' }}
          >
            {token}
          </motion.span>
        </span>
      ))}
      {status === 'running' && <span className="cursor-blink">▌</span>}
    </div>
  );
});
