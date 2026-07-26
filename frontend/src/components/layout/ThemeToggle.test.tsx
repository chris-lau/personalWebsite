import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

describe('ThemeToggle Component', () => {
  it('renders all 3 theme options and allows direct theme selection', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const modernBtn = screen.getByRole('radio', { name: /Set theme to MODERN/i });
    const asciiBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
    const cliBtn = screen.getByRole('radio', { name: /Set theme to CLI/i });

    expect(modernBtn).toBeDefined();
    expect(asciiBtn).toBeDefined();
    expect(cliBtn).toBeDefined();

    // Initial default theme is MODERN
    expect(modernBtn.getAttribute('aria-checked')).toBe('true');

    // Click ASCII segment button
    fireEvent.click(asciiBtn);
    expect(asciiBtn.getAttribute('aria-checked')).toBe('true');

    // Click CLI segment button
    fireEvent.click(cliBtn);
    expect(cliBtn.getAttribute('aria-checked')).toBe('true');
  });
});
