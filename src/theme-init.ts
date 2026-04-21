import { THEME_STORAGE_KEY, applyTheme, getInitialTheme, type Theme } from './lib/theme';

function setToggleState(theme: Theme) {
  document.querySelectorAll<HTMLElement>('[data-theme-state]').forEach((node) => {
    node.textContent = theme === 'dark' ? 'Dark' : 'Light';
  });

  document.querySelectorAll<HTMLElement>('[data-theme-knob]').forEach((node) => {
    node.classList.toggle('translate-x-5', theme === 'dark');
    node.classList.toggle('translate-x-0', theme === 'light');
  });

  document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((node) => {
    node.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
    );
    node.setAttribute(
      'title',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
    );
  });
}

let currentTheme = getInitialTheme();
applyTheme(currentTheme);
setToggleState(currentTheme);

document.querySelectorAll<HTMLElement>('[data-theme-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(currentTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, currentTheme);
    setToggleState(currentTheme);
  });
});
