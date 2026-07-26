import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

describe('ThemeToggle Component', () => {
  it('renders correctly and toggles through ASCII, CLI, and MODERN theme states', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button.textContent).toContain('[ MODE: MODERN ]');

    fireEvent.click(button);
    expect(button.textContent).toContain('[ MODE: ASCII ]');

    fireEvent.click(button);
    expect(button.textContent).toContain('[ MODE: CLI ]');

    fireEvent.click(button);
    expect(button.textContent).toContain('[ MODE: MODERN ]');
  });
});
