# LLM Token Speed Simulation

A small multi-page site for testing how LLM streaming speed feels on real text.

Instead of treating `tokens per second` as a backend-only number, this project lets you compare pacing, readability, and response feel in the browser across multiple languages.

## What It Includes

- An interactive token streaming simulator built with React + Vite
- Static article pages aimed at search and product education
- Multi-page GitHub Pages deployment
- Tokenization powered by `js-tiktoken`
- Tests for the simulator logic and UI behavior

## Pages

- `/`
  The simulator homepage
- `/about/`
  About the project creator and site context
- `/what-is-token-per-second/`
- `/how-fast-is-40-tokens-per-second/`
- `/compare-llm-speed-across-languages/`
- `/tokens-per-second-vs-words-per-minute/`

## Stack

- React 18
- Vite 5
- TypeScript
- Tailwind CSS
- Vitest

## Local Development

Install dependencies:

```bash
npm ci
```

Start the dev server:

```bash
npm run dev
```

Run tests:

```bash
npm run test:run
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
about/                                        Static about page
compare-llm-speed-across-languages/           Static article page
how-fast-is-40-tokens-per-second/             Static article page
tokens-per-second-vs-words-per-minute/        Static article page
what-is-token-per-second/                     Static article page
public/                                       Static assets, sitemap, robots
src/                                          React app and simulator logic
.github/workflows/deploy.yml                  GitHub Pages deployment workflow
```

## Deployment

The site deploys to GitHub Pages through `.github/workflows/deploy.yml`.

On every push to `main`, the workflow:

1. Installs dependencies with `npm ci`
2. Runs the test suite
3. Builds the site with `vite build`
4. Uploads `dist/` and deploys it to GitHub Pages

The Vite base path is configured for:

```text
/llm-token-speed-simulation/
```

So local asset and link changes should keep GitHub Pages routing in mind.

## Notes

- The homepage is the heaviest page because it includes the interactive simulator.
- The article pages are static HTML on purpose to keep them crawlable and lightweight.
- The tokenizer rank data is lazy-loaded, but it is still a large asset at runtime.

## Ignore Rules

The repo intentionally ignores local tooling state and generated output such as:

- `node_modules/`
- `dist/`
- editor folders
- local AI/agent logs and workdirs
- `.env*`

If you already committed a file before adding it to `.gitignore`, Git will keep tracking it until you explicitly remove it from the index.
