import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PanelSidebar } from './PanelSidebar';

describe('PanelSidebar', () => {
  it('lets users clear and retype max output before clamping on blur', async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();

    render(
      <PanelSidebar
        config={{ lang: 'en', speed: 40, maxTokens: 500 }}
        status="idle"
        onConfigChange={onConfigChange}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
        onNewText={() => {}}
      />,
    );

    const input = screen.getByLabelText(/maximum output tokens/i);

    await user.clear(input);
    expect(input).toHaveValue('');

    await user.type(input, '120');
    expect(input).toHaveValue('120');
    expect(onConfigChange).not.toHaveBeenCalled();

    await user.tab();
    expect(onConfigChange).toHaveBeenCalledWith({ maxTokens: 120 });
  });

  it('clamps max output to 20 on commit if the typed value is too low', async () => {
    const user = userEvent.setup();
    const onConfigChange = vi.fn();

    render(
      <PanelSidebar
        config={{ lang: 'en', speed: 40, maxTokens: 500 }}
        status="idle"
        onConfigChange={onConfigChange}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
        onNewText={() => {}}
      />,
    );

    const input = screen.getByLabelText(/maximum output tokens/i);

    await user.clear(input);
    await user.type(input, '9');
    await user.tab();

    expect(onConfigChange).toHaveBeenCalledWith({ maxTokens: 20 });
  });

  it('keeps language controls available while paused', () => {
    render(
      <PanelSidebar
        config={{ lang: 'en', speed: 40, maxTokens: 500 }}
        status="paused"
        onConfigChange={() => {}}
        onStart={() => {}}
        onPause={() => {}}
        onResume={() => {}}
        onRestart={() => {}}
        onNewText={() => {}}
      />,
    );

    expect(screen.getByRole('button', { name: /language/i })).toBeEnabled();
  });
});
