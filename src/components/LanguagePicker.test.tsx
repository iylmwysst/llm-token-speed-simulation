import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { LanguagePicker } from './LanguagePicker';
import { useState } from 'react';

describe('LanguagePicker', () => {
  it('shows the selected language code', () => {
    render(<LanguagePicker value="en" onChange={() => {}} />);
    expect(screen.getByRole('button')).toHaveTextContent(/en/);
  });

  it('opens a list and filters by search', async () => {
    const user = userEvent.setup();
    render(<LanguagePicker value="en" onChange={() => {}} />);
    await user.click(screen.getByRole('button'));
    const input = screen.getByRole('combobox');
    await user.type(input, 'thai');
    expect(screen.getByText(/Thai/i)).toBeInTheDocument();
  });

  it('calls onChange with code when an item is picked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<LanguagePicker value="en" onChange={onChange} />);
    await user.click(screen.getByRole('button'));
    await user.type(screen.getByRole('combobox'), 'thai');
    await user.click(screen.getByText(/Thai/i));
    expect(onChange).toHaveBeenCalledWith('th');
  });

  it('closes the list after the parent value updates from a selection', async () => {
    const user = userEvent.setup();

    function Harness() {
      const [value, setValue] = useState('en');
      return <LanguagePicker value={value} onChange={setValue} />;
    }

    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Language' }));
    await user.type(screen.getByRole('combobox'), 'thai');
    await user.click(screen.getByText(/Thai/i));

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Language' })).toHaveTextContent(/th/i);
  });
});
