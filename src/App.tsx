import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Panel } from './components/Panel';
import { THEME_STORAGE_KEY, applyTheme, getInitialTheme, type Theme } from './lib/theme';
import type { PanelConfig } from './types';

const DEFAULT_CONFIG: PanelConfig = { lang: 'en', speed: 40, maxTokens: 500 };
const MAX_PANELS = 5;

type PanelEntry = { id: string; initialConfig: PanelConfig };
type Props = {
  embedded?: boolean;
};

let idCounter = 0;
const makeId = () => `p${++idCounter}`;

export default function App({ embedded = false }: Props) {
  const [panels, setPanels] = useState<PanelEntry[]>([{ id: makeId(), initialConfig: DEFAULT_CONFIG }]);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const addPanel = () => {
    setPanels((prev) => {
      if (prev.length >= MAX_PANELS) return prev;
      return [...prev, { id: makeId(), initialConfig: DEFAULT_CONFIG }];
    });
  };

  const closePanel = (id: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const reachedMaxPanels = panels.length >= MAX_PANELS;

  return (
    <div className={embedded ? 'bg-bg text-text' : 'min-h-screen bg-bg text-text'}>
      {!embedded && <Header theme={theme} onToggleTheme={toggleTheme} />}
      <main
        className={`mx-auto flex flex-col gap-6 ${
          embedded ? 'max-w-none px-0 pb-8 pt-0' : 'max-w-4xl px-6 py-8'
        }`}
      >
        <AnimatePresence initial={false}>
          {panels.map((panel) => (
            <Panel
              key={panel.id}
              id={panel.id}
              initialConfig={panel.initialConfig}
              onClose={() => closePanel(panel.id)}
            />
          ))}
        </AnimatePresence>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addPanel}
            disabled={reachedMaxPanels}
            className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            {reachedMaxPanels ? `Max ${MAX_PANELS} Panels` : '+ Add Panel'}
          </button>
        </div>
      </main>
    </div>
  );
}
