import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PanelText } from './PanelText';

describe('PanelText', () => {
  it('keeps a fixed-height scroll container for streamed text', () => {
    const { container } = render(
      <PanelText tokens={['Hello', ' world']} articles={[]} status="running" onRetry={() => {}} />,
    );

    expect(container.firstElementChild).toHaveClass('h-[22rem]', 'md:h-[24rem]', 'overflow-auto');
  });

  it('auto-scrolls to the latest token when content grows', () => {
    const { container, rerender } = render(
      <PanelText tokens={['Hello']} articles={[]} status="running" onRetry={() => {}} />,
    );

    const scrollNode = container.firstElementChild as HTMLDivElement;
    let scrollHeight = 120;

    Object.defineProperty(scrollNode, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });

    rerender(<PanelText tokens={['Hello', ' world', '!']} articles={[]} status="running" onRetry={() => {}} />);

    expect(scrollNode.scrollTop).toBe(120);

    scrollHeight = 240;
    rerender(
      <PanelText
        tokens={['Hello', ' world', '!', ' More']}
        articles={[]}
        status="running"
        onRetry={() => {}}
      />,
    );

    expect(scrollNode.scrollTop).toBe(240);
  });
});
