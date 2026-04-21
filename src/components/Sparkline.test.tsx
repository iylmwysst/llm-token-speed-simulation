import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
