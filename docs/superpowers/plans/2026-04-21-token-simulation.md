# Token Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side web app that streams tokenized Wikipedia text at a user-controlled rate to visualize LLM token-per-second generation speeds.

**Architecture:** Vite + React + TypeScript single-page app with a Tailwind CSS monochrome theme that adapts to `prefers-color-scheme`. Each simulation panel is an independent state machine driven by a `requestAnimationFrame` streaming loop, reading from the Wikipedia REST API and tokenizing via `js-tiktoken` (`o200k_base`). Panels stack vertically and can be added/removed at runtime. Deployed to GitHub Pages via Actions.

**Tech Stack:** Vite 5, React 18, TypeScript, Tailwind CSS 3, Framer Motion, js-tiktoken, cmdk (combobox), Vitest + React Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-04-21-token-simulation-design.md`

---

## Task 1: Project bootstrap (Vite + React + TS + deps + git)

**Files:**
- Create: `package.json`, `tsconfig.json`, `tsconfig.node.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `.gitignore`, `.nvmrc`

- [ ] **Step 1: Scaffold with Vite React-TS template**

```bash
cd /Users/Lab/Desktop/token-simulation
npm create vite@latest . -- --template react-ts
# Accept overwrites of any existing files; note .claude/ and docs/ already exist and must be preserved
```

Answer `y` (ignore non-empty directory) when prompted.

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install framer-motion js-tiktoken cmdk
npm install -D tailwindcss@3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @types/node
```

- [ ] **Step 3: Initialize git**

```bash
git init
echo "node_modules
dist
.DS_Store
*.log
.vite" > .gitignore
```

- [ ] **Step 4: Verify dev server starts**

```bash
npm run dev
# Open http://localhost:5173 — should show Vite + React default page.
# Stop with Ctrl-C.
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: bootstrap Vite + React + TS with deps"
```

---

## Task 2: Tailwind + CSS variable theme

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`
- Modify: `src/index.css` (replace default), `src/App.tsx`

- [ ] **Step 1: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

This creates `tailwind.config.js` and `postcss.config.js`. Rename `tailwind.config.js` → `tailwind.config.ts`.

- [ ] **Step 2: Write `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        cursor: 'var(--cursor)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 3: Replace `src/index.css`**

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #ffffff;
  --surface: #fafafa;
  --border: #e5e5e5;
  --text: #0a0a0a;
  --text-muted: #737373;
  --text-subtle: #a3a3a3;
  --cursor: #0a0a0a;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #0a0a0a;
    --surface: #141414;
    --border: #262626;
    --text: #f5f5f5;
    --text-muted: #a3a3a3;
    --text-subtle: #525252;
    --cursor: #f5f5f5;
  }
}

html, body, #root {
  height: 100%;
}

body {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

@keyframes cursor-blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

.cursor-blink {
  display: inline-block;
  animation: cursor-blink 1.06s ease-in-out infinite;
  color: var(--cursor);
}
```

- [ ] **Step 4: Replace `src/App.tsx` with a theme smoke-test**

```tsx
export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="max-w-4xl mx-auto px-6 py-4 border-b border-border">
        <h1 className="text-2xl font-normal tracking-tight">Token Simulation</h1>
      </div>
      <main className="max-w-4xl mx-auto px-6 py-8 font-mono text-sm text-text-muted">
        theme smoke test — this should be monochrome in both light & dark
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Run dev server and verify theme**

```bash
npm run dev
# Open http://localhost:5173
# Toggle system dark/light — page should invert. No color beyond grayscale.
# Stop with Ctrl-C.
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tailwind config + grayscale theme with prefers-color-scheme"
```

---

## Task 3: Configure Vitest

**Files:**
- Create: `vitest.config.ts`, `src/test/setup.ts`
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

- [ ] **Step 2: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Add test script to `package.json`**

In `package.json` `scripts`, add:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 4: Sanity-check run (no tests yet → expect "no test files found" which is fine)**

```bash
npm run test:run
```

Expected: exits cleanly with message about no test files.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: configure Vitest with jsdom + RTL setup"
```

---

## Task 4: Shared types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
export type PanelStatus =
  | 'idle'
  | 'fetching'
  | 'running'
  | 'paused'
  | 'done'
  | 'error';

export type PanelConfig = {
  lang: string;
  speed: number;
  maxTokens: number;
};

export type ArticleMarker = {
  title: string;
  startTokenIndex: number;
};

export type PanelState = {
  id: string;
  config: PanelConfig;
  status: PanelStatus;
  tokens: string[];
  tokenCount: number;
  elapsedMs: number;
  articles: ArticleMarker[];
  tokPerSecSamples: number[];
  error?: string;
};

export type Language = {
  code: string;
  nameEn: string;
  nameNative: string;
  flag: string;
};

export type WikipediaSummary = {
  title: string;
  extract: string;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: shared types for panel state and domain models"
```

---

## Task 5: Smoothing utility (TDD)

**Files:**
- Create: `src/lib/smoothing.ts`, `src/lib/smoothing.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/smoothing.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
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
    expect(movingAverage([1, 2, 3, 4, 5], 3)).toBe(4); // (3+4+5)/3
  });

  it('returns 0 when window is 0', () => {
    expect(movingAverage([1, 2, 3], 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/lib/smoothing.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/smoothing.ts`**

```ts
export function movingAverage(samples: number[], window?: number): number {
  if (samples.length === 0) return 0;
  if (window === 0) return 0;
  const slice = window && window > 0 ? samples.slice(-window) : samples;
  if (slice.length === 0) return 0;
  const sum = slice.reduce((a, b) => a + b, 0);
  return sum / slice.length;
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/lib/smoothing.test.ts
```

Expected: PASS, 5/5.

- [ ] **Step 5: Commit**

```bash
git add src/lib/smoothing.ts src/lib/smoothing.test.ts
git commit -m "feat(lib): moving-average helper with tests"
```

---

## Task 6: Wikipedia client with retry (TDD)

**Files:**
- Create: `src/lib/wikipedia.ts`, `src/lib/wikipedia.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/wikipedia.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchRandomSummary } from './wikipedia';

describe('fetchRandomSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('returns { title, extract } on success', async () => {
    (globalThis.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ title: 'Hello', extract: 'World of text.' }),
    });
    const p = fetchRandomSummary('en');
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result).toEqual({ title: 'Hello', extract: 'World of text.' });
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://en.wikipedia.org/api/rest_v1/page/random/summary',
      expect.any(Object),
    );
  });

  it('retries on failure and eventually succeeds', async () => {
    (globalThis.fetch as any)
      .mockRejectedValueOnce(new Error('net'))
      .mockRejectedValueOnce(new Error('net'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ title: 'T', extract: 'E' }),
      });
    const p = fetchRandomSummary('th');
    await vi.runAllTimersAsync();
    const result = await p;
    expect(result.title).toBe('T');
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws after 3 failed attempts', async () => {
    (globalThis.fetch as any).mockRejectedValue(new Error('net'));
    const p = fetchRandomSummary('en').catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await p;
    expect(err).toBeInstanceOf(Error);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('throws when response is not ok', async () => {
    (globalThis.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
    });
    const p = fetchRandomSummary('en').catch((e) => e);
    await vi.runAllTimersAsync();
    const err = await p;
    expect(err).toBeInstanceOf(Error);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/lib/wikipedia.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/wikipedia.ts`**

```ts
import type { WikipediaSummary } from '../types';

const BACKOFF_MS = [1000, 2000, 4000];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchRandomSummary(lang: string): Promise<WikipediaSummary> {
  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/random/summary`;
  let lastErr: unknown;
  for (let i = 0; i < BACKOFF_MS.length; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { title: data.title ?? '', extract: data.extract ?? '' };
    } catch (err) {
      lastErr = err;
      if (i < BACKOFF_MS.length - 1) await sleep(BACKOFF_MS[i]);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('fetch failed');
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/lib/wikipedia.test.ts
```

Expected: PASS, 4/4.

- [ ] **Step 5: Commit**

```bash
git add src/lib/wikipedia.ts src/lib/wikipedia.test.ts
git commit -m "feat(lib): wikipedia random summary client with 3x retry"
```

---

## Task 7: Tokenizer wrapper (TDD)

**Files:**
- Create: `src/lib/tokenizer.ts`, `src/lib/tokenizer.test.ts`

- [ ] **Step 1: Write failing test**

`src/lib/tokenizer.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { getEncoder } from './tokenizer';

describe('tokenizer', () => {
  it('encodes and decodes round-trip', async () => {
    const enc = await getEncoder();
    const ids = enc.encode('hello world');
    expect(ids.length).toBeGreaterThan(0);
    const decoded = enc.decode(ids);
    expect(decoded).toBe('hello world');
  });

  it('decodeOne returns a string for a single token id', async () => {
    const enc = await getEncoder();
    const ids = enc.encode('abc');
    const piece = enc.decodeOne(ids[0]);
    expect(typeof piece).toBe('string');
    expect(piece.length).toBeGreaterThan(0);
  });

  it('caches encoder instance on repeated calls', async () => {
    const a = await getEncoder();
    const b = await getEncoder();
    expect(a).toBe(b);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/lib/tokenizer.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/lib/tokenizer.ts`**

```ts
import { Tiktoken } from 'js-tiktoken/lite';

export type Encoder = {
  encode: (text: string) => number[];
  decode: (ids: number[]) => string;
  decodeOne: (id: number) => string;
};

let cached: Encoder | null = null;

export async function getEncoder(): Promise<Encoder> {
  if (cached) return cached;
  // Dynamic import so the ~3MB table is fetched only when Start is clicked.
  const { default: o200k_base } = await import('js-tiktoken/ranks/o200k_base');
  const tk = new Tiktoken(o200k_base);
  cached = {
    encode: (text) => tk.encode(text),
    decode: (ids) => tk.decode(ids),
    decodeOne: (id) => tk.decode([id]),
  };
  return cached;
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/lib/tokenizer.test.ts
```

Expected: PASS, 3/3. (The first test downloads the rank table via Node fs — this is fine in jsdom because `js-tiktoken/ranks/o200k_base` is bundled as a JS module.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/tokenizer.ts src/lib/tokenizer.test.ts
git commit -m "feat(lib): lazy-loaded tiktoken o200k_base encoder"
```

---

## Task 8: Languages data

**Files:**
- Create: `src/lib/languages.ts`, `src/lib/languages.test.ts`

- [ ] **Step 1: Write failing tests**

`src/lib/languages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { LANGUAGES, findLanguage } from './languages';

describe('languages', () => {
  it('exports a non-empty list with unique codes', () => {
    expect(LANGUAGES.length).toBeGreaterThan(20);
    const codes = new Set(LANGUAGES.map((l) => l.code));
    expect(codes.size).toBe(LANGUAGES.length);
  });

  it('each entry has code, nameEn, nameNative, flag', () => {
    for (const l of LANGUAGES) {
      expect(l.code).toMatch(/^[a-z-]+$/);
      expect(l.nameEn.length).toBeGreaterThan(0);
      expect(l.nameNative.length).toBeGreaterThan(0);
      expect(l.flag.length).toBeGreaterThan(0);
    }
  });

  it('findLanguage matches on code', () => {
    const results = findLanguage('en');
    expect(results.find((l) => l.code === 'en')).toBeTruthy();
  });

  it('findLanguage matches on English name (case-insensitive)', () => {
    const results = findLanguage('THAI');
    expect(results.find((l) => l.code === 'th')).toBeTruthy();
  });

  it('findLanguage matches on native name', () => {
    const results = findLanguage('日本');
    expect(results.find((l) => l.code === 'ja')).toBeTruthy();
  });

  it('findLanguage returns all when query is empty', () => {
    expect(findLanguage('').length).toBe(LANGUAGES.length);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/lib/languages.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/lib/languages.ts`**

Include a curated list covering the top Wikipedia languages. More can be added; a good starting set:

```ts
import type { Language } from '../types';

export const LANGUAGES: Language[] = [
  { code: 'en', nameEn: 'English', nameNative: 'English', flag: '🇬🇧' },
  { code: 'th', nameEn: 'Thai', nameNative: 'ไทย', flag: '🇹🇭' },
  { code: 'ja', nameEn: 'Japanese', nameNative: '日本語', flag: '🇯🇵' },
  { code: 'zh', nameEn: 'Chinese', nameNative: '中文', flag: '🇨🇳' },
  { code: 'ko', nameEn: 'Korean', nameNative: '한국어', flag: '🇰🇷' },
  { code: 'fr', nameEn: 'French', nameNative: 'Français', flag: '🇫🇷' },
  { code: 'de', nameEn: 'German', nameNative: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', nameEn: 'Spanish', nameNative: 'Español', flag: '🇪🇸' },
  { code: 'pt', nameEn: 'Portuguese', nameNative: 'Português', flag: '🇵🇹' },
  { code: 'it', nameEn: 'Italian', nameNative: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', nameEn: 'Russian', nameNative: 'Русский', flag: '🇷🇺' },
  { code: 'ar', nameEn: 'Arabic', nameNative: 'العربية', flag: '🇸🇦' },
  { code: 'hi', nameEn: 'Hindi', nameNative: 'हिन्दी', flag: '🇮🇳' },
  { code: 'id', nameEn: 'Indonesian', nameNative: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'vi', nameEn: 'Vietnamese', nameNative: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', nameEn: 'Turkish', nameNative: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', nameEn: 'Polish', nameNative: 'Polski', flag: '🇵🇱' },
  { code: 'nl', nameEn: 'Dutch', nameNative: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', nameEn: 'Swedish', nameNative: 'Svenska', flag: '🇸🇪' },
  { code: 'fi', nameEn: 'Finnish', nameNative: 'Suomi', flag: '🇫🇮' },
  { code: 'no', nameEn: 'Norwegian', nameNative: 'Norsk', flag: '🇳🇴' },
  { code: 'da', nameEn: 'Danish', nameNative: 'Dansk', flag: '🇩🇰' },
  { code: 'cs', nameEn: 'Czech', nameNative: 'Čeština', flag: '🇨🇿' },
  { code: 'el', nameEn: 'Greek', nameNative: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', nameEn: 'Hebrew', nameNative: 'עברית', flag: '🇮🇱' },
  { code: 'uk', nameEn: 'Ukrainian', nameNative: 'Українська', flag: '🇺🇦' },
];

export function findLanguage(query: string): Language[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter(
    (l) =>
      l.code.toLowerCase().includes(q) ||
      l.nameEn.toLowerCase().includes(q) ||
      l.nameNative.toLowerCase().includes(q),
  );
}
```

> Note: expand the list later by pulling from Wikipedia's `sitematrix` API if desired. v1 ships with this curated set for fast initial-load UX.

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/lib/languages.test.ts
```

Expected: PASS, 6/6.

- [ ] **Step 5: Commit**

```bash
git add src/lib/languages.ts src/lib/languages.test.ts
git commit -m "feat(lib): languages list + search helper"
```

---

## Task 9: Token stream hook (rAF loop)

**Files:**
- Create: `src/hooks/useTokenStream.ts`, `src/hooks/useTokenStream.test.ts`

- [ ] **Step 1: Write failing tests**

`src/hooks/useTokenStream.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTokenStream } from './useTokenStream';

describe('useTokenStream', () => {
  let rafCallbacks: FrameRequestCallback[] = [];
  let now = 0;

  beforeEach(() => {
    rafCallbacks = [];
    now = 0;
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });
    vi.stubGlobal('cancelAnimationFrame', () => {});
    vi.stubGlobal('performance', { now: () => now });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function drainFrames(steps: number, stepMs: number) {
    for (let i = 0; i < steps; i++) {
      now += stepMs;
      const cbs = rafCallbacks.slice();
      rafCallbacks.length = 0;
      cbs.forEach((cb) => cb(now));
    }
  }

  it('emits tokens proportional to elapsed * speed', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({
        speed: 40, // 40 tok/s => 1 token every 25ms
        onAdvance: (n) => emitted.push(n),
      }),
    );
    act(() => result.current.start());
    // 10 frames of 16ms = 160ms → expect ~6 tokens
    act(() => drainFrames(10, 16));
    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(5);
    expect(total).toBeLessThanOrEqual(7);
  });

  it('pause stops advancing', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );
    act(() => result.current.start());
    act(() => drainFrames(5, 16));
    const before = emitted.reduce((a, b) => a + b, 0);
    act(() => result.current.pause());
    act(() => drainFrames(20, 16));
    const after = emitted.reduce((a, b) => a + b, 0);
    expect(after).toBe(before);
  });

  it('resume continues from where paused (no catch-up)', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );
    act(() => result.current.start());
    act(() => drainFrames(10, 16)); // ~160ms → ~16 tokens
    act(() => result.current.pause());
    act(() => drainFrames(60, 16)); // long pause
    act(() => result.current.resume());
    act(() => drainFrames(5, 16)); // 80ms → ~8 tokens
    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(22);
    expect(total).toBeLessThanOrEqual(26); // NOT 60+ (no catch-up)
  });

  it('stop resets elapsed and token budget', () => {
    const emitted: number[] = [];
    const { result } = renderHook(() =>
      useTokenStream({ speed: 100, onAdvance: (n) => emitted.push(n) }),
    );
    act(() => result.current.start());
    act(() => drainFrames(10, 16));
    act(() => result.current.stop());
    emitted.length = 0;
    act(() => result.current.start());
    act(() => drainFrames(5, 16)); // 80ms → ~8 tokens
    const total = emitted.reduce((a, b) => a + b, 0);
    expect(total).toBeGreaterThanOrEqual(7);
    expect(total).toBeLessThanOrEqual(9);
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/hooks/useTokenStream.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/hooks/useTokenStream.ts`**

```ts
import { useCallback, useEffect, useRef } from 'react';

type Options = {
  speed: number; // tokens per second (live-mutable by re-render)
  onAdvance: (tokensToAdd: number, elapsedMs: number) => void;
  onFrame?: (elapsedMs: number) => void;
};

export function useTokenStream({ speed, onAdvance, onFrame }: Options) {
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const onAdvanceRef = useRef(onAdvance);
  onAdvanceRef.current = onAdvance;

  const onFrameRef = useRef(onFrame);
  onFrameRef.current = onFrame;

  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(0);
  const elapsedRef = useRef<number>(0);
  const emittedRef = useRef<number>(0);
  const runningRef = useRef<boolean>(false);

  const tick = useCallback((now: number) => {
    if (!runningRef.current) return;
    const dt = now - lastFrameRef.current;
    lastFrameRef.current = now;
    elapsedRef.current += dt;
    const expected = Math.floor((elapsedRef.current * speedRef.current) / 1000);
    const add = expected - emittedRef.current;
    if (add > 0) {
      emittedRef.current = expected;
      onAdvanceRef.current(add, elapsedRef.current);
    }
    onFrameRef.current?.(elapsedRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const pause = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const resume = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    elapsedRef.current = 0;
    emittedRef.current = 0;
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { start, pause, resume, stop };
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/hooks/useTokenStream.test.ts
```

Expected: PASS, 4/4.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useTokenStream.ts src/hooks/useTokenStream.test.ts
git commit -m "feat(hooks): useTokenStream rAF loop with start/pause/resume/stop"
```

---

## Task 10: Panel orchestration hook

**Files:**
- Create: `src/hooks/usePanel.ts`

> Note: `usePanel` integrates Wikipedia fetch, tokenizer, and `useTokenStream`. Integration is exercised by the Panel component tests in later tasks; this hook is not unit-tested in isolation because its value is the orchestration.

- [ ] **Step 1: Implement `src/hooks/usePanel.ts`**

```ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  ArticleMarker,
  PanelConfig,
  PanelState,
  PanelStatus,
} from '../types';
import { fetchRandomSummary } from '../lib/wikipedia';
import { getEncoder, type Encoder } from '../lib/tokenizer';
import { useTokenStream } from './useTokenStream';

const SAMPLE_WINDOW = 30;
const PREFETCH_THRESHOLD = 0.2;

type Init = { id: string; config: PanelConfig };

export function usePanel({ id, config: initialConfig }: Init) {
  const [config, setConfig] = useState<PanelConfig>(initialConfig);
  const [status, setStatus] = useState<PanelStatus>('idle');
  const [tokens, setTokens] = useState<string[]>([]);
  const [articles, setArticles] = useState<ArticleMarker[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [tokPerSecSamples, setSamples] = useState<number[]>([]);
  const [error, setError] = useState<string | undefined>();

  // Pipeline refs: source ids from tokenizer, consumed by rAF loop.
  const pendingIdsRef = useRef<number[]>([]);
  const encoderRef = useRef<Encoder | null>(null);
  const nextArticlePromiseRef = useRef<Promise<void> | null>(null);
  const lastSampleAtRef = useRef<number>(0);
  const sampleAccumRef = useRef<number>(0);
  // Mirror tokens.length so emitTokens can read the latest without re-binding.
  const tokensLenRef = useRef(0);
  useEffect(() => {
    tokensLenRef.current = tokens.length;
  }, [tokens.length]);

  const prefetchNext = useCallback(async () => {
    nextArticlePromiseRef.current = (async () => {
      try {
        const { title, extract } = await fetchRandomSummary(config.lang);
        const enc = encoderRef.current ?? (await getEncoder());
        encoderRef.current = enc;
        const ids = enc.encode(extract);
        setArticles((prev) => [
          ...prev,
          { title, startTokenIndex: tokensLenRef.current + pendingIdsRef.current.length },
        ]);
        pendingIdsRef.current.push(...ids);
      } catch {
        // Prefetch failure is silent; stream will run out and main loop will surface error.
      } finally {
        nextArticlePromiseRef.current = null;
      }
    })();
  }, [config.lang]);

  const stream = useTokenStream({
    speed: config.speed,
    onAdvance: (add, elapsed) => {
      setElapsedMs(elapsed);
      emitTokens(add, elapsed);
    },
  });

  const emitTokens = useCallback(
    (add: number, elapsed: number) => {
      const enc = encoderRef.current;
      if (!enc) return;
      const take = Math.min(add, pendingIdsRef.current.length);
      if (take <= 0) return;
      const ids = pendingIdsRef.current.splice(0, take);
      const pieces = ids.map((id) => enc.decodeOne(id));
      setTokens((prev) => {
        const next = prev.concat(pieces);
        if (next.length >= config.maxTokens) {
          stream.stop();
          setStatus('done');
        }
        return next;
      });
      sampleAccumRef.current += take;
      if (elapsed - lastSampleAtRef.current >= 1000) {
        lastSampleAtRef.current = elapsed;
        const rate = sampleAccumRef.current;
        sampleAccumRef.current = 0;
        setSamples((prev) => {
          const next = prev.concat([rate]);
          return next.length > SAMPLE_WINDOW ? next.slice(-SAMPLE_WINDOW) : next;
        });
      }
      const remaining = pendingIdsRef.current.length;
      const budgetLeft = config.maxTokens - tokensLenRef.current;
      if (
        budgetLeft > 0 &&
        remaining < budgetLeft * PREFETCH_THRESHOLD &&
        nextArticlePromiseRef.current === null
      ) {
        void prefetchNext();
      }
    },
    [config.maxTokens, prefetchNext, stream],
  );

  const start = useCallback(async () => {
    setError(undefined);
    setStatus('fetching');
    try {
      const enc = await getEncoder();
      encoderRef.current = enc;
      const { title, extract } = await fetchRandomSummary(config.lang);
      const ids = enc.encode(extract);
      pendingIdsRef.current = ids;
      setArticles([{ title, startTokenIndex: 0 }]);
      setTokens([]);
      setElapsedMs(0);
      setSamples([]);
      lastSampleAtRef.current = 0;
      sampleAccumRef.current = 0;
      setStatus('running');
      stream.start();
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Unknown error');
    }
  }, [config.lang, stream]);

  const pause = useCallback(() => {
    if (status !== 'running') return;
    stream.pause();
    setStatus('paused');
  }, [status, stream]);

  const resume = useCallback(() => {
    if (status !== 'paused') return;
    stream.resume();
    setStatus('running');
  }, [status, stream]);

  const restart = useCallback(() => {
    stream.stop();
    pendingIdsRef.current = [];
    setTokens([]);
    setArticles([]);
    setElapsedMs(0);
    setSamples([]);
    setStatus('idle');
    setError(undefined);
    void start();
  }, [stream, start]);

  const newText = useCallback(() => {
    restart();
  }, [restart]);

  const updateConfig = useCallback((patch: Partial<PanelConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const state: PanelState = {
    id,
    config,
    status,
    tokens,
    tokenCount: tokens.length,
    elapsedMs,
    articles,
    tokPerSecSamples,
    error,
  };

  useEffect(() => () => stream.stop(), [stream]);

  return {
    state,
    actions: { start, pause, resume, restart, newText, updateConfig },
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/usePanel.ts
git commit -m "feat(hooks): usePanel orchestrates fetch+tokenize+stream with prefetch"
```

---

## Task 11: Sparkline component

**Files:**
- Create: `src/components/Sparkline.tsx`, `src/components/Sparkline.test.tsx`

- [ ] **Step 1: Write failing test**

`src/components/Sparkline.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from './Sparkline';

describe('Sparkline', () => {
  it('renders an svg with width 80 and height 20', () => {
    const { container } = render(<Sparkline samples={[1, 2, 3, 4, 5]} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('80');
    expect(svg?.getAttribute('height')).toBe('20');
  });

  it('renders a polyline when samples exist', () => {
    const { container } = render(<Sparkline samples={[5, 10, 3, 8]} />);
    expect(container.querySelector('polyline')).toBeTruthy();
  });

  it('renders no polyline for empty samples', () => {
    const { container } = render(<Sparkline samples={[]} />);
    expect(container.querySelector('polyline')).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/components/Sparkline.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/components/Sparkline.tsx`**

```tsx
type Props = {
  samples: number[];
  width?: number;
  height?: number;
};

export function Sparkline({ samples, width = 80, height = 20 }: Props) {
  if (samples.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden />
    );
  }
  const max = Math.max(...samples, 1);
  const min = 0;
  const stepX = width / (samples.length - 1);
  const points = samples
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/components/Sparkline.test.tsx
```

Expected: PASS, 3/3.

- [ ] **Step 5: Commit**

```bash
git add src/components/Sparkline.tsx src/components/Sparkline.test.tsx
git commit -m "feat(ui): Sparkline SVG component"
```

---

## Task 12: PanelStats component

**Files:**
- Create: `src/components/PanelStats.tsx`, `src/components/PanelStats.test.tsx`

- [ ] **Step 1: Write failing test**

`src/components/PanelStats.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PanelStats } from './PanelStats';

describe('PanelStats', () => {
  it('renders tok/s, counts, elapsed, ETA', () => {
    render(
      <PanelStats
        samples={[40, 42, 41, 39, 40]}
        tokenCount={142}
        maxTokens={500}
        elapsedMs={3400}
      />,
    );
    expect(screen.getByText(/tok\/s/)).toBeInTheDocument();
    expect(screen.getByText(/142\s*\/\s*500/)).toBeInTheDocument();
    expect(screen.getByText(/3\.4s/)).toBeInTheDocument();
    expect(screen.getByText(/ETA/)).toBeInTheDocument();
  });

  it('hides ETA when tok/s is 0', () => {
    render(
      <PanelStats samples={[]} tokenCount={0} maxTokens={500} elapsedMs={0} />,
    );
    expect(screen.queryByText(/ETA/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/components/PanelStats.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/components/PanelStats.tsx`**

```tsx
import { movingAverage } from '../lib/smoothing';
import { Sparkline } from './Sparkline';

type Props = {
  samples: number[];
  tokenCount: number;
  maxTokens: number;
  elapsedMs: number;
};

export function PanelStats({ samples, tokenCount, maxTokens, elapsedMs }: Props) {
  const smooth = movingAverage(samples, 3);
  const remaining = Math.max(0, maxTokens - tokenCount);
  const etaSec = smooth > 0 ? remaining / smooth : 0;
  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-text-muted px-4 py-2 border-t border-border">
      <span>{smooth.toFixed(1)} tok/s</span>
      <Sparkline samples={samples} />
      <span aria-hidden>│</span>
      <span>{tokenCount} / {maxTokens}</span>
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
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/components/PanelStats.test.tsx
```

Expected: PASS, 2/2.

- [ ] **Step 5: Commit**

```bash
git add src/components/PanelStats.tsx src/components/PanelStats.test.tsx
git commit -m "feat(ui): PanelStats HUD row"
```

---

## Task 13: LanguagePicker component

**Files:**
- Create: `src/components/LanguagePicker.tsx`, `src/components/LanguagePicker.test.tsx`

- [ ] **Step 1: Write failing test**

`src/components/LanguagePicker.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguagePicker } from './LanguagePicker';

describe('LanguagePicker', () => {
  it('shows the selected language code', () => {
    render(<LanguagePicker value="en" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent(/en/);
  });

  it('opens a list and filters by search', async () => {
    const user = userEvent.setup();
    render(<LanguagePicker value="en" onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    const input = screen.getByRole('combobox');
    await user.type(input, 'thai');
    expect(screen.getByText(/Thai/i)).toBeInTheDocument();
  });

  it('calls onChange with code when an item is picked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LanguagePicker value="en" onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'thai');
    await user.click(screen.getByText(/Thai/i));
    expect(onChange).toHaveBeenCalledWith('th');
  });
});
```

- [ ] **Step 2: Run test, confirm failure**

```bash
npm run test:run -- src/components/LanguagePicker.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Implement `src/components/LanguagePicker.tsx`**

```tsx
import { useState } from 'react';
import { Command } from 'cmdk';
import { LANGUAGES, findLanguage } from '../lib/languages';

type Props = {
  value: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export function LanguagePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];
  const list = findLanguage(query);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-surface text-sm disabled:opacity-50"
        aria-label="Language"
      >
        <span>{current.flag}</span>
        <span className="truncate">{current.nameEn}</span>
        <span className="font-mono text-xs text-text-muted ml-auto">{current.code}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-72 rounded-md border border-border bg-surface shadow-lg">
          <Command shouldFilter={false}>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search language…"
              className="w-full px-3 py-2 bg-transparent border-b border-border text-sm focus:outline-none"
            />
            <Command.List className="max-h-64 overflow-auto">
              {list.length === 0 && (
                <Command.Empty className="px-3 py-2 text-sm text-text-subtle">
                  No match.
                </Command.Empty>
              )}
              {list.map((l) => (
                <Command.Item
                  key={l.code}
                  value={l.code}
                  onSelect={() => {
                    onChange(l.code);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer aria-selected:bg-border"
                >
                  <span>{l.flag}</span>
                  <span className="flex-1">{l.nameEn}</span>
                  <span className="text-text-subtle">{l.nameNative}</span>
                  <span className="font-mono text-xs text-text-muted">{l.code}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test, confirm pass**

```bash
npm run test:run -- src/components/LanguagePicker.test.tsx
```

Expected: PASS, 3/3.

- [ ] **Step 5: Commit**

```bash
git add src/components/LanguagePicker.tsx src/components/LanguagePicker.test.tsx
git commit -m "feat(ui): LanguagePicker combobox"
```

---

## Task 14: PanelSidebar component

**Files:**
- Create: `src/components/PanelSidebar.tsx`

- [ ] **Step 1: Implement `src/components/PanelSidebar.tsx`**

```tsx
import { LanguagePicker } from './LanguagePicker';
import type { PanelConfig, PanelStatus } from '../types';

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
    <div className="w-56 shrink-0 flex flex-col gap-4 p-4 border-r border-border">
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
            onConfigChange({ maxTokens: Math.max(20, Math.min(5000, Number(e.target.value) || 20)) })
          }
          disabled={locked}
          className="w-full px-2 py-1 rounded-md border border-border bg-surface text-sm disabled:opacity-50"
          aria-label="Maximum output tokens"
        />
      </Field>

      <div className="flex items-center gap-1 mt-auto">
        {status === 'idle' || status === 'done' || status === 'error' ? (
          <IconBtn onClick={onStart} label="Start">▶</IconBtn>
        ) : playing ? (
          <IconBtn onClick={onPause} label="Pause">⏸</IconBtn>
        ) : (
          <IconBtn onClick={onResume} label="Resume">▶</IconBtn>
        )}
        <IconBtn onClick={onRestart} label="Restart">↻</IconBtn>
        <IconBtn onClick={onNewText} label="New text">🎲</IconBtn>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
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
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-border transition-colors"
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/PanelSidebar.tsx
git commit -m "feat(ui): PanelSidebar with config + actions"
```

---

## Task 15: PanelText component (streaming area + cursor + article divider)

**Files:**
- Create: `src/components/PanelText.tsx`

- [ ] **Step 1: Implement `src/components/PanelText.tsx`**

```tsx
import { motion } from 'framer-motion';
import type { ArticleMarker, PanelStatus } from '../types';

type Props = {
  tokens: string[];
  articles: ArticleMarker[];
  status: PanelStatus;
  error?: string;
  onRetry: () => void;
};

export function PanelText({ tokens, articles, status, error, onRetry }: Props) {
  if (status === 'fetching' && tokens.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 font-mono text-sm text-text-subtle">
        Fetching article…
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 font-mono text-sm text-text-muted">
        <div>⚠ Could not reach Wikipedia.</div>
        {error && <div className="text-text-subtle text-xs">{error}</div>}
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1 border border-border rounded-md hover:bg-border"
        >
          Retry
        </button>
      </div>
    );
  }

  const articleBoundaries = new Map(
    articles.slice(1).map((a, i) => [a.startTokenIndex, i + 2]),
  );

  return (
    <div className="flex-1 p-6 overflow-auto leading-relaxed text-[15px] max-h-[60vh]">
      {tokens.map((t, i) => (
        <span key={i}>
          {articleBoundaries.has(i) && (
            <div className="flex items-center justify-center my-6 font-mono text-xs text-text-subtle">
              ─── Article {articleBoundaries.get(i)} ───
            </div>
          )}
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.08, ease: 'linear' }}
          >
            {t}
          </motion.span>
        </span>
      ))}
      {status === 'running' && <span className="cursor-blink">▌</span>}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/PanelText.tsx
git commit -m "feat(ui): PanelText streaming area with fade-in and cursor"
```

---

## Task 16: Panel integration component

**Files:**
- Create: `src/components/Panel.tsx`

- [ ] **Step 1: Implement `src/components/Panel.tsx`**

```tsx
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePanel } from '../hooks/usePanel';
import { PanelSidebar } from './PanelSidebar';
import { PanelText } from './PanelText';
import { PanelStats } from './PanelStats';
import type { PanelConfig } from '../types';

type Props = {
  id: string;
  initialConfig: PanelConfig;
  onClose: () => void;
};

export function Panel({ id, initialConfig, onClose }: Props) {
  const { state, actions } = usePanel({ id, config: initialConfig });

  // Keyboard: Space toggles Start/Pause when the panel is focused.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const active = document.activeElement as HTMLElement | null;
      if (!active || !active.closest(`[data-panel-id="${id}"]`)) return;
      const tag = active.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      e.preventDefault();
      if (state.status === 'idle' || state.status === 'done' || state.status === 'error') {
        void actions.start();
      } else if (state.status === 'running') {
        actions.pause();
      } else if (state.status === 'paused') {
        actions.resume();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [id, state.status, actions]);

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
      className="relative bg-surface border border-border rounded-xl overflow-hidden"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close panel"
        className="absolute top-2 right-2 w-7 h-7 rounded-md hover:bg-border flex items-center justify-center text-text-muted"
      >
        ✕
      </button>
      <div className="flex flex-col md:flex-row">
        <PanelSidebar
          config={state.config}
          status={state.status}
          onConfigChange={actions.updateConfig}
          onStart={actions.start}
          onPause={actions.pause}
          onResume={actions.resume}
          onRestart={actions.restart}
          onNewText={actions.newText}
        />
        <PanelText
          tokens={state.tokens}
          articles={state.articles}
          status={state.status}
          error={state.error}
          onRetry={actions.start}
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
```

- [ ] **Step 2: Typecheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Panel.tsx
git commit -m "feat(ui): Panel integration (sidebar + text + stats + close)"
```

---

## Task 17: Header component

**Files:**
- Create: `src/components/Header.tsx`

- [ ] **Step 1: Implement `src/components/Header.tsx`**

```tsx
export function Header() {
  return (
    <header className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 py-4">
        <h1 className="text-2xl font-normal tracking-tight">Token Simulation</h1>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Header.tsx
git commit -m "feat(ui): minimal Header"
```

---

## Task 18: App shell (panel list + add button)

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Replace `src/App.tsx`**

```tsx
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
  const [panels, setPanels] = useState<PanelEntry[]>([
    { id: makeId(), initialConfig: DEFAULT_CONFIG },
  ]);

  const addPanel = () => {
    setPanels((prev) => [...prev, { id: makeId(), initialConfig: DEFAULT_CONFIG }]);
  };

  const closePanel = (id: string) => {
    setPanels((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-6">
        <AnimatePresence initial={false}>
          {panels.map((p) => (
            <Panel
              key={p.id}
              id={p.id}
              initialConfig={p.initialConfig}
              onClose={() => closePanel(p.id)}
            />
          ))}
        </AnimatePresence>
        <div className="flex justify-center">
          <button
            type="button"
            onClick={addPanel}
            className="px-4 py-2 rounded-md border border-border text-sm hover:bg-surface"
          >
            + Add Panel
          </button>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run dev server, smoke test in browser**

```bash
npm run dev
```

Manual checks:
- Default panel appears with `en / 40 / 500`.
- Click ▶ Start → after a moment, text streams with cursor.
- Drag speed slider → visible rate changes live.
- Click ⏸ → stream pauses, cursor disappears while paused.
- Click ↻ Restart → fetches new article, counters reset.
- Click `+ Add Panel` → new panel appears below (fade+slide).
- Click ✕ on a panel → panel exits with animation.
- Toggle OS dark mode → page inverts, still grayscale only.

Stop with Ctrl-C when satisfied.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(app): shell with panel list, add, close, and Framer AnimatePresence"
```

---

## Task 19: TypeScript + lint pass

**Files:**
- Verify: all

- [ ] **Step 1: Typecheck entire project**

```bash
npx tsc --noEmit
```

Expected: no errors. Fix any that appear (usually missing type imports).

- [ ] **Step 2: Run full test suite**

```bash
npm run test:run
```

Expected: all suites PASS.

- [ ] **Step 3: Production build**

```bash
npm run build
```

Expected: `dist/` produced without errors. Note bundle size — `js-tiktoken` rank table is ~3 MB; that's expected.

- [ ] **Step 4: Commit if anything changed**

```bash
git add -A
git commit -m "chore: typecheck + build pass" --allow-empty
```

---

## Task 20: GitHub Pages deploy

**Files:**
- Modify: `vite.config.ts`, `package.json`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Set `base` in `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/token-simulation/',
});
```

- [ ] **Step 2: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run test:run
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 3: Push to GitHub**

```bash
# Create the repo on GitHub named "token-simulation" (public), then:
git branch -M main
git remote add origin git@github.com:<your-user>/token-simulation.git
git push -u origin main
```

- [ ] **Step 4: Enable Pages**

In GitHub repo settings → Pages → Source → "GitHub Actions". The `deploy.yml` workflow will run on the push and publish to `https://<your-user>.github.io/token-simulation/`.

- [ ] **Step 5: Verify live deploy**

Wait for the Actions run to finish, then open the Pages URL. Run the same smoke checks from Task 18 Step 2.

- [ ] **Step 6: Commit config**

```bash
git add vite.config.ts .github/workflows/deploy.yml
git commit -m "ci: GitHub Pages deploy workflow + vite base path"
git push
```

---

## Acceptance Verification

Run these checks against the deployed app (or local `npm run dev`) and confirm each matches the spec:

- [ ] Cold page load shows header + 1 panel + Add button within 2s (tokenizer not yet loaded).
- [ ] Theme auto-switches between light/dark when the OS setting changes.
- [ ] Starting a run at 40 tok/s produces a visibly metered stream.
- [ ] Starting a run at 500 tok/s remains smooth with no stutter.
- [ ] Dragging the speed slider during a run changes the rate within one second.
- [ ] Disabling the network during a fresh Start shows the error panel after ~7 seconds (1+2+4 retry window), with a Retry button that succeeds when network returns.
- [ ] Running a panel to `maxTokens` smaller than one article stops cleanly at `done`.
- [ ] Setting `maxTokens` large enough to exceed one article shows an `─── Article 2 ───` divider mid-stream.
- [ ] Opening two panels, starting both at different speeds, shows each tracking its own tok/s without interference.
- [ ] Pressing Space while focused inside a panel toggles Start/Pause.
- [ ] Every visible element is grayscale in both themes.

---

## Notes for the Engineer

- **Why rAF and not `setInterval`?** `setInterval` drifts under load and fires during tab-hide; rAF aligns to paint and naturally throttles when the tab is backgrounded, which is the correct behavior here (paused while hidden, resumes cleanly).
- **Why lazy-load the tokenizer?** The `o200k_base` rank table is ~3 MB. Loading it only at first Start keeps the initial paint fast.
- **Why no custom number-counter animation for tok/s?** Smoothing via `movingAverage(samples, 3)` produces stable values per render; an extra Framer tween only adds lag. Keep it as-is unless the number looks jittery in practice.
- **Thai / CJK tokenization:** `o200k_base` handles UTF-8 natively — Thai text at, say, 40 tok/s will visibly produce many sub-character pieces because Thai packs more bytes per character. That's the correct LLM behavior to visualize.
- **Live-adjust Max Output was intentionally excluded** (see spec) — don't add it back without discussing.
