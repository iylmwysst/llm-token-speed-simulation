import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { Panel } from './components/Panel';
import type { PanelConfig } from './types';

const DEFAULT_CONFIG: PanelConfig = { lang: 'en', speed: 40, maxTokens: 500 };

type PanelEntry = { id: string; initialConfig: PanelConfig };

let idCounter = 0;
const makeId = () => `p${++idCounter}`;

export default function App() {
  const [panels, setPanels] = useState<PanelEntry[]>([{ id: makeId(), initialConfig: DEFAULT_CONFIG }]);

  const addPanel = () => {
    setPanels((prev) => [...prev, { id: makeId(), initialConfig: DEFAULT_CONFIG }]);
  };

  const closePanel = (id: string) => {
    setPanels((prev) => prev.filter((panel) => panel.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
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
            className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
          >
            + Add Panel
          </button>
        </div>
      </main>
    </div>
  );
}
