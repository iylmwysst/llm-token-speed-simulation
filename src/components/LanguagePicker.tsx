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
  const current = LANGUAGES.find((language) => language.code === value) ?? LANGUAGES[0];
  const list = findLanguage(query);

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex w-full items-center gap-2 rounded-md border border-border bg-surface px-2 py-1.5 text-sm disabled:opacity-50"
        aria-label="Language"
      >
        <span>{current.flag}</span>
        <span className="truncate">{current.nameEn}</span>
        <span className="ml-auto font-mono text-xs text-text-muted">{current.code}</span>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-72 rounded-md border border-border bg-surface shadow-lg">
          <Command shouldFilter={false}>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search language…"
              className="w-full border-b border-border bg-transparent px-3 py-2 text-sm focus:outline-none"
            />
            <Command.List className="max-h-64 overflow-auto">
              {list.length === 0 && (
                <Command.Empty className="px-3 py-2 text-sm text-text-subtle">
                  No match.
                </Command.Empty>
              )}
              {list.map((language) => (
                <Command.Item
                  key={language.code}
                  value={language.code}
                  onSelect={() => {
                    onChange(language.code);
                    setOpen(false);
                    setQuery('');
                  }}
                  className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm aria-selected:bg-border"
                >
                  <span>{language.flag}</span>
                  <span className="flex-1">{language.nameEn}</span>
                  <span className="text-text-subtle">{language.nameNative}</span>
                  <span className="font-mono text-xs text-text-muted">{language.code}</span>
                </Command.Item>
              ))}
            </Command.List>
          </Command>
        </div>
      )}
    </div>
  );
}
