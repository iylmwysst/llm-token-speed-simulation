import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App theme toggle', () => {
  const originalMatchMedia = window.matchMedia;

  beforeEach(() => {
    window.localStorage.clear();
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    delete document.documentElement.dataset.theme;
    document.documentElement.style.colorScheme = '';
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('initializes from system preference and toggles persistently', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');

    await user.click(screen.getByRole('button', { name: /switch to light mode/i }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('token-simulation-theme')).toBe('light');
  });

  it('limits the app to five panels', async () => {
    const user = userEvent.setup();
    render(<App />);

    const addButton = screen.getByRole('button', { name: /\+ add panel/i });

    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getAllByRole('region')).toHaveLength(5);
    expect(screen.getByRole('button', { name: /max 5 panels/i })).toBeDisabled();
  });

  it('adds matching top spacing above the add button when all panels are closed', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /close panel/i }));

    const addButton = screen.getByRole('button', { name: /\+ add panel/i });
    expect(addButton.parentElement).toHaveClass('pt-8');
  });
});
