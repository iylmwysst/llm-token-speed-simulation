type Theme = 'light' | 'dark';

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

export function Header({ theme, onToggleTheme }: Props) {
  const nextThemeLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
        <h1 className="text-2xl font-normal tracking-tight">Token Simulation</h1>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={nextThemeLabel}
          title={nextThemeLabel}
          className="group inline-flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 text-sm text-text-muted transition-colors hover:text-text"
        >
          <span className="relative flex h-6 w-11 items-center rounded-full border border-border bg-bg px-1 transition-colors">
            <span
              className={`absolute h-4 w-4 rounded-full bg-text transition-transform duration-200 ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </span>
          <span className="flex items-center gap-2">
            {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
            <span className="hidden sm:inline">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </span>
        </button>
      </div>
    </header>
  );
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="3.5" />
      <path d="M10 1.75v2.1M10 16.15v2.1M18.25 10h-2.1M3.85 10h-2.1M15.84 4.16l-1.48 1.48M5.64 14.36l-1.48 1.48M15.84 15.84l-1.48-1.48M5.64 5.64 4.16 4.16" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13.91 2.58a7 7 0 1 0 3.51 12.96A7.7 7.7 0 0 1 13.91 2.58Z" />
    </svg>
  );
}
