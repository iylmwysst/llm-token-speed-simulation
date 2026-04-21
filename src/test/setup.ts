import '@testing-library/jest-dom/vitest';

class ResizeObserver {
  observe() {}

  unobserve() {}

  disconnect() {}
}

globalThis.ResizeObserver = ResizeObserver as typeof globalThis.ResizeObserver;

window.HTMLElement.prototype.scrollIntoView = vi.fn();
