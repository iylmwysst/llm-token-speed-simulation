import { memo, useEffect, useState, type ReactNode } from 'react';
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
  status === 'running' || status === 'fetching';

const clampMaxTokens = (value: number) => Math.max(20, Math.min(5000, value));

export const PanelSidebar = memo(function PanelSidebar({
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
  const [speedDraft, setSpeedDraft] = useState(config.speed);
  const [maxTokensDraft, setMaxTokensDraft] = useState(String(config.maxTokens));

  useEffect(() => {
    setSpeedDraft(config.speed);
  }, [config.speed]);

  useEffect(() => {
    setMaxTokensDraft(String(config.maxTokens));
  }, [config.maxTokens]);

  const commitMaxTokens = () => {
    const parsed = Number(maxTokensDraft);
    const nextValue = Number.isFinite(parsed) && parsed > 0 ? clampMaxTokens(parsed) : config.maxTokens;
    setMaxTokensDraft(String(nextValue));
    if (nextValue !== config.maxTokens) {
      onConfigChange({ maxTokens: nextValue });
    }
  };

  return (
    <div className="flex w-56 shrink-0 flex-col gap-4 border-r border-border p-4">
      <Field label="Language">
        <LanguagePicker
          value={config.lang}
          onChange={(lang) => onConfigChange({ lang })}
          disabled={locked}
        />
      </Field>

      <Field label={`Speed — ${speedDraft} tok/s`}>
        <input
          type="range"
          min={1}
          max={500}
          value={speedDraft}
          onChange={(e) => {
            const nextSpeed = Number(e.target.value);
            setSpeedDraft(nextSpeed);
            onConfigChange({ speed: nextSpeed });
          }}
          className="w-full accent-text"
          aria-label="Speed (tokens per second)"
        />
      </Field>

      <Field label="Max output">
        <input
          type="text"
          inputMode="numeric"
          value={maxTokensDraft}
          onChange={(e) => {
            const nextValue = e.target.value;
            if (/^\d*$/.test(nextValue)) {
              setMaxTokensDraft(nextValue);
            }
          }}
          onBlur={commitMaxTokens}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitMaxTokens();
              e.currentTarget.blur();
            }
            if (e.key === 'Escape') {
              setMaxTokensDraft(String(config.maxTokens));
              e.currentTarget.blur();
            }
          }}
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
          <RandomizeIcon />
        </IconBtn>
      </div>
    </div>
  );
});

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

function RandomizeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="9.5" y="9.5" width="7" height="7" rx="1.5" />
      <circle cx="7" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13" cy="13" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="16" cy="16" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}
