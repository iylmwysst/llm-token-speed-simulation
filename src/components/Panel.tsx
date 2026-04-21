import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { PanelConfig } from '../types';
import { usePanel } from '../hooks/usePanel';
import { PanelSidebar } from './PanelSidebar';
import { PanelText } from './PanelText';
import { PanelStats } from './PanelStats';

type Props = {
  id: string;
  initialConfig: PanelConfig;
  onClose: () => void;
};

export function Panel({ id, initialConfig, onClose }: Props) {
  const { state, actions } = usePanel({ id, config: initialConfig });
  const { start, pause, resume, restart, newText, updateConfig } = actions;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const active = document.activeElement as HTMLElement | null;
      if (!active || !active.closest(`[data-panel-id="${id}"]`)) return;
      const tag = active.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      e.preventDefault();
      if (state.status === 'idle' || state.status === 'done' || state.status === 'error') {
        void start();
      } else if (state.status === 'running') {
        pause();
      } else if (state.status === 'paused') {
        resume();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [id, pause, resume, start, state.status]);

  return (
    <motion.section
      role="region"
      aria-label={`Panel ${id}`}
      data-panel-id={id}
      tabIndex={-1}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-xl border border-border bg-surface"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-border"
      >
        ✕
      </button>
      <div className="flex flex-col md:flex-row">
        <PanelSidebar
          config={state.config}
          status={state.status}
          onConfigChange={updateConfig}
          onStart={start}
          onPause={pause}
          onResume={resume}
          onRestart={restart}
          onNewText={newText}
        />
        <PanelText
          tokens={state.tokens}
          articles={state.articles}
          status={state.status}
          error={state.error}
          onRetry={start}
        />
      </div>
      <PanelStats
        samples={state.tokPerSecSamples}
        tokenCount={state.tokenCount}
        maxTokens={state.config.maxTokens}
        elapsedMs={state.elapsedMs}
      />
    </motion.section>
  );
}
