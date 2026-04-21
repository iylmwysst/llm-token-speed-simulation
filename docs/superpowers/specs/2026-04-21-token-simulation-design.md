# Token Simulation — Design Spec

- **Date:** 2026-04-21
- **Status:** Approved

## Overview

Token Simulation is a pure client-side web app that visualizes LLM token generation speed. Users open one or more independent streaming panels, each configured with a language, generation rate (tokens/sec), and maximum output length. Each panel fetches random Wikipedia articles in the chosen language, tokenizes them with a real BPE tokenizer, and streams tokens to the screen at the chosen rate.

The purpose is to let users *feel through vision* how fast a given token/s actually is — whether the rate is readable, and how different rates compare side by side.

The app deploys to GitHub Pages and uses a minimal grayscale design that adapts to the browser's `prefers-color-scheme`.

## Goals & Non-Goals

**Goals**
- Visualize token/s streaming on real readable text
- Support all Wikipedia-supported languages
- Realistic BPE tokenization (not word/char splits)
- Multiple independent panels on one screen, stacked vertically
- Live speed adjustment during streaming
- Minimal, typography-focused UI with auto dark/light theme

**Non-Goals**
- Comparing named real models (no "Sonnet vs Haiku" labels)
- Calling real LLM APIs
- Measuring human reading speed
- User accounts, saved state, or server-side storage
- Mobile-first design (responsive, but desktop-primary)

## UX & Layout

### Initial state
On first load, the app shows:
- Header (brand only)
- One Panel in `idle` status with default config
- `+ Add Panel` button below the panel

### App structure
- **Header** (top): brand text only. No buttons in v1. Reserved for future controls.
- **Panel list**: panels stacked vertically, `24px` gap between panels.
- **Add button**: centered below the last panel. Clicking spawns a new panel at the bottom.

### Panel layout — Layout B (sidebar + text)

Each panel has three regions:

**Left sidebar (~220px fixed width)** — configuration + actions:
- 🌐 Language picker — searchable combobox (ISO code, native name, English name)
- ⚡ Speed slider — `1 – 500 tok/s`, default `40`
- 🎯 Max output — number input `20 – 5000`, default `500`
- Action row: `▶ Start`, `⏸ Pause`, `↻ Restart`, `🎲 New text`

**Right area** — streaming text:
- Padding `24px`
- `max-height: 60vh`, scrolls on overflow
- Typography: Inter 15px, `line-height: 1.7`

**Bottom HUD** — horizontal stats stripe:
```
42.1 tok/s  ▁▂▃▅▇▃▂  │  142/500  │  3.4s  │  ETA 8.5s
```

**Close button** (`✕`) at top-right of panel.

### Interaction rules

- **Live adjust**: Speed slider applies immediately while running. Language and Max Output are **locked during a run** — user must Restart to change them.
- **Start / Pause / Resume**: `Space` bar toggles Start/Pause when the panel is focused.
- **Close**: Removes the panel. Empty state (zero panels) shows only the `+ Add Panel` button.
- **Article continuation**: When the current article's remaining token buffer drops below 20%, prefetch the next random article and append seamlessly. Insert a centered `─── Article N ───` divider in the stream at the boundary.
- **Stop condition**: `tokenCount >= maxTokens` → `status = 'done'`.
- **Token fade-in**: each token appears with `opacity 0 → 1` over 80ms, linear. Batched per `requestAnimationFrame` so high rates remain smooth.
- **Cursor**: a blinking `▌` follows the last token while `status === 'running'`.

### Responsive (<768px)
Sidebar collapses above the text area. Each panel becomes a vertical stack: config on top, text middle, HUD bottom.

## Technical Architecture

### Stack
- Vite 5 + React 18 + TypeScript
- Tailwind CSS 3
- Framer Motion — panel enter/exit, counter tweening
- `js-tiktoken` with `o200k_base` encoding

### File structure
```
token-simulation/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── vite.config.ts
├── .github/workflows/deploy.yml
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── components/
    │   ├── Header.tsx
    │   ├── Panel.tsx
    │   ├── PanelSidebar.tsx
    │   ├── PanelText.tsx
    │   ├── PanelStats.tsx
    │   ├── Sparkline.tsx
    │   └── LanguagePicker.tsx
    ├── hooks/
    │   ├── usePanel.ts
    │   └── useTokenStream.ts
    ├── lib/
    │   ├── wikipedia.ts
    │   ├── tokenizer.ts
    │   ├── languages.ts
    │   └── smoothing.ts
    └── index.css
```

### State model (per panel)
```ts
type PanelStatus =
  | 'idle' | 'fetching' | 'running' | 'paused' | 'done' | 'error';

type PanelConfig = {
  lang: string;       // Wikipedia language code, e.g. 'en', 'th'
  speed: number;      // tokens/sec, 1–500
  maxTokens: number;  // 20–5000
};

type ArticleMarker = {
  title: string;
  startTokenIndex: number;
};

type PanelState = {
  id: string;
  config: PanelConfig;
  status: PanelStatus;
  tokens: string[];            // decoded subword strings, append-only
  tokenCount: number;
  elapsedMs: number;
  articles: ArticleMarker[];
  tokPerSecSamples: number[];  // last ~30 samples for sparkline + smoothing
  error?: string;
};
```

### Data flow — main streaming loop

1. **Start** clicked:
   - `status = 'fetching'`
   - `wikipedia.fetchRandomSummary(lang)` → retry up to 3× with exponential backoff `1s → 2s → 4s`
   - On success: get `{ title, extract }`
   - `tokenizer.encode(extract)` → `number[]` token IDs
   - `status = 'running'`; start rAF loop
2. **rAF loop** (per frame):
   - Compute `expectedTokenCount = floor(elapsedMs * speed / 1000)`
   - Append tokens up to that count, decoding each to its string piece
   - Sample live tok/s from the last 1s of appends, push to `tokPerSecSamples`
   - If remaining article tokens < 20% of article total: trigger background prefetch of next article
   - If `tokenCount >= maxTokens`: `status = 'done'`, stop loop
3. **Live speed change**: updating `config.speed` takes effect on the very next rAF frame (no restart).
4. **Pause**: stop advancing `elapsedMs`; resume continues from saved elapsed.
5. **Restart**: clear tokens + counters, fetch new article, reset state.

### Tokenizer
- `js-tiktoken`, encoding `o200k_base` (matches GPT-4o / modern Claude tokenization)
- Lazy-loaded on first Start (not on page load)
- Interface:
  ```ts
  encode(text: string): number[];
  decode(ids: number[]): string;
  decodeOne(id: number): string;  // used to get the visible string per token
  ```

### Wikipedia integration
- Endpoint: `https://{lang}.wikipedia.org/api/rest_v1/page/random/summary`
- Fields used: `title`, `extract`
- Retry policy: 3 attempts, backoff `1s → 2s → 4s`
- Final failure → `status = 'error'`, show error UI with Retry button
- Prefetch: after 80% of the current article is consumed, begin fetching the next

### Smoothing (tok/s HUD)
- Main number: moving average over last 3 seconds of samples
- Sparkline: raw last ~30 samples at ~1Hz, 80×20 SVG polyline

### Deployment
- GitHub Actions workflow: on push to `main`, run Vite build, deploy `dist/` to `gh-pages` branch
- `vite.config.ts` — `base: '/token-simulation/'`

## Visual Design

### Theme (CSS variables, `prefers-color-scheme`)

**Light:**
```css
--bg:           #ffffff;
--surface:      #fafafa;
--border:       #e5e5e5;
--text:         #0a0a0a;
--text-muted:   #737373;
--text-subtle:  #a3a3a3;
--cursor:       #0a0a0a;
```

**Dark:**
```css
--bg:           #0a0a0a;
--surface:      #141414;
--border:       #262626;
--text:         #f5f5f5;
--text-muted:   #a3a3a3;
--text-subtle:  #525252;
--cursor:       #f5f5f5;
```

No accent colors. Pure grayscale.

### Typography
- **Sans** (UI + streaming text): `Inter` via Google Fonts, fallback `-apple-system, system-ui, sans-serif`
- **Mono** (HUD, numbers, sparkline, language code): `JetBrains Mono`, fallback `ui-monospace, SFMono-Regular, Menlo, monospace`

**Scale:**
- `text-xs` 11px — stats labels, article markers
- `text-sm` 13px — sidebar labels, inputs
- `text-base` 15px — streaming text (line-height 1.7)
- `text-2xl` 24px — header brand, `font-normal`, `tracking-tight`

### Spacing
- Container: `max-w-4xl mx-auto` (~896px)
- Header: `px-6 py-4`
- Panel padding: `p-4`
- Gap between panels: `gap-6` (24px)
- Sidebar internal gap: `gap-2` (8px)

### Borders & radius
- Panel: `1px` border, `rounded-xl` (12px)
- Sidebar/text divider: 1px hairline (`border-l`)
- Inputs: 1px border, `rounded-md` (6px)
- Buttons: `rounded-md`, `w-8 h-8` icon hit area

### Animations
- **Token fade-in**: `opacity 0 → 1`, `80ms linear`, batched per rAF frame
- **Cursor blink**: CSS keyframes, `1.06s ease-in-out infinite`
- **Panel enter**: `opacity 0, y -8` → `opacity 1, y 0`, `240ms cubic-bezier(0.16, 1, 0.3, 1)` (Framer Motion)
- **Panel exit**: mirror enter, `180ms`
- **tok/s counter**: Framer Motion `MotionValue` with spring config, ~200ms settle
- **Sparkline**: redraw per sample, no tween

### Language picker
- Combobox (e.g. `cmdk` or headless-ui Combobox)
- Display format: `🇬🇧 English (en)` — flag + English name + code
- Search matches English name, native name, and ISO code
- Language list from a curated `languages.ts` mapping covering Wikipedia's ~300 supported codes

### Stats HUD (bottom row)
- Single horizontal row, all mono `text-xs`, color `--text-muted`
- Format: `42.1 tok/s  ▁▂▃▅▇▃▂ │ 142/500 │ 3.4s │ ETA 8.5s`
- Separators: `│` Unicode character (not CSS border)
- Sparkline: SVG `80×20`, stroke `1.5px currentColor`, `opacity 0.6`
- On narrow widths, row wraps; sparkline retains fixed size

### Loading / Error / Transitional states
- Fetching: centered `Fetching article…`, mono `text-subtle`
- Article divider in stream: centered `─── Article 2 ───`, mono `text-xs text-subtle`, `my-6` vertical margin
- Error: centered `⚠ Could not reach Wikipedia.` + `[Retry]` button, mono `text-muted`
- Empty state (zero panels): only the `+ Add Panel` button centered

### Responsive
- Breakpoint `md` = 768px
- Desktop: sidebar (220px) + text (flex-1)
- Mobile: vertical stack — sidebar on top, text below, HUD at bottom

### Accessibility
- Contrast ≥ 4.5:1 in both themes
- Panel: `role="region"`, `aria-label="Panel {n}"`
- Icon buttons: `aria-label` (Start, Pause, Restart, New text, Close)
- Keyboard: Tab through all controls; `Space` toggles Start/Pause when a panel is focused; slider supports arrow keys, Home/End

## Acceptance Criteria

- [ ] Page loads in < 2s on a fresh visit (tokenizer is lazy-loaded)
- [ ] Theme auto-matches `prefers-color-scheme` on load and when system toggles
- [ ] At 40 tok/s, tokens appear smoothly with visible per-token cadence
- [ ] At 500 tok/s, streaming remains smooth with no stutter or dropped frames at 60fps
- [ ] Speed-slider change during a run updates the visible rate within 100ms
- [ ] Wikipedia fetch retries 3× with backoff before showing error
- [ ] Article boundary inserts a divider in the stream
- [ ] Multiple panels stream independently without interfering with each other's tok/s accuracy
- [ ] Language picker filters search within a single frame on typed input
- [ ] GitHub Pages deploy succeeds from `main` via Actions
- [ ] Grayscale-only — no accent colors appear in any state
