import type { ReactNode } from 'react';
import type { PanelConfig, PanelStatus } from '../types';
import { LanguagePicker } from './LanguagePicker';

type Props = {
  config: PanelConfig;
  status: PanelStatus;
  onConfigChange: (patch: Partial<PanelConfig>) => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onRestart: () => void;
  onNewText: () => void;
};

const isLockedForConfig = (status: PanelStatus) =>
  status === 'running' || status === 'paused' || status === 'fetching';

export function PanelSidebar({
  config,
  status,
  onConfigChange,
  onStart,
  onPause,
  onResume,
  onRestart,
  onNewText,
}: Props) {
  const locked = isLockedForConfig(status);
  const playing = status === 'running';

  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 border-r border-border p-4">
      <Field label="Language">
        <LanguagePicker
          value={config.lang}
          onChange={(lang) => onConfigChange({ lang })}
          disabled={locked}
        />
      </Field>

      <Field label={`Speed — ${config.speed} tok/s`}>
        <input
          type="range"
          min={1}
          max={500}
          value={config.speed}
          onChange={(e) => onConfigChange({ speed: Number(e.target.value) })}
          className="w-full accent-text"
          aria-label="Speed (tokens per second)"
        />
      </Field>

      <Field label="Max output">
        <input
          type="number"
          min={20}
          max={5000}
          value={config.maxTokens}
          onChange={(e) =>
            onConfigChange({
              maxTokens: Math.max(20, Math.min(5000, Number(e.target.value) || 20)),
            })
          }
          disabled={locked}
          className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm disabled:opacity-50"
          aria-label="Maximum output tokens"
        />
      </Field>

      <div className="mt-auto flex items-center gap-1">
        {status === 'idle' || status === 'done' || status === 'error' ? (
          <IconBtn onClick={onStart} label="Start">
            ▶
          </IconBtn>
        ) : playing ? (
          <IconBtn onClick={onPause} label="Pause">
            ⏸
          </IconBtn>
        ) : (
          <IconBtn onClick={onResume} label="Resume">
            ▶
          </IconBtn>
        )}
        <IconBtn onClick={onRestart} label="Restart">
          ↻
        </IconBtn>
        <IconBtn onClick={onNewText} label="New text">
          🎲
        </IconBtn>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[11px] uppercase tracking-wider text-text-muted">{label}</span>
      {children}
    </label>
  );
}

function IconBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-border"
    >
      {children}
    </button>
  );
}
