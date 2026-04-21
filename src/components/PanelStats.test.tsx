import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
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
    render(<PanelStats samples={[]} tokenCount={0} maxTokens={500} elapsedMs={0} />);
    expect(screen.queryByText(/ETA/)).not.toBeInTheDocument();
  });
});
