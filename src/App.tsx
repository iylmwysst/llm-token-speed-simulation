import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Panel } from './components/Panel';
import type { PanelConfig } from './types';

const DEFAULT_CONFIG: PanelConfig = { lang: 'en', speed: 40, maxTokens: 500 };
const THEME_STORAGE_KEY = 'token-simulation-theme';
const MAX_PANELS = 5;

type PanelEntry = { id: string; initialConfig: PanelConfig };
type Theme = 'light' | 'dark';

let idCounter = 0;
const makeId = () => `p${++idCounter}`;

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function App() {
  const [panels, setPanels] = useState<PanelEntry[]>([{ id: makeId(), initialConfig: DEFAULT_CONFIG }]);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
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
    <div className="min-h-screen bg-bg text-text">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
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
