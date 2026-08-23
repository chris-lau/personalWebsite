import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider, useTheme } from '../../context/ThemeContext';

const Probe = () => {
  const { theme } = useTheme();
  return <span data-testid="probe">{theme}</span>;
};

describe('ThemeToggle Component', () => {
  it('renders as a dark-mode switch (light default)', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: 'Switch to dark mode' });
    expect(button).toBeDefined();
  });

  it('toggles between light and dark modes', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
        <Probe />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(screen.getByTestId('probe').textContent).toBe('dark');

    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(screen.getByTestId('probe').textContent).toBe('light');
  });
});
