import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ThemeToggle } from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

describe('ThemeToggle Component', () => {
  it('renders a single icon trigger button that opens a theme menu', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const trigger = screen.getByRole('button', { name: /Theme: Modern/i });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    // Menu is initially closed
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    // No menu items visible before opening
    expect(screen.queryAllByRole('menuitemradio')).toHaveLength(0);

    // Open the menu
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    // All 3 themes appear as menuitemradio options
    const items = screen.getAllByRole('menuitemradio');
    expect(items).toHaveLength(3);
    expect(screen.getByRole('menuitemradio', { name: /Modern/i })).toBeDefined();
    expect(screen.getByRole('menuitemradio', { name: /ASCII/i })).toBeDefined();
    expect(screen.getByRole('menuitemradio', { name: /CLI/i })).toBeDefined();
  });

  it('marks the active theme as checked and switches on selection', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const trigger = screen.getByRole('button', { name: /Theme: Modern/i });
    fireEvent.click(trigger);

    // Default theme is Modern — it should be the checked option
    const modernItem = screen.getByRole('menuitemradio', { name: /Modern/i });
    expect(modernItem.getAttribute('aria-checked')).toBe('true');

    // Select ASCII
    const asciiItem = screen.getByRole('menuitemradio', { name: /ASCII/i });
    fireEvent.click(asciiItem);

    // Menu closes after selection
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toContain('ASCII');

    // Re-open and confirm ASCII is now the active option
    fireEvent.click(trigger);
    expect(
      screen.getByRole('menuitemradio', { name: /ASCII/i }).getAttribute('aria-checked')
    ).toBe('true');
    // Modern is no longer checked
    expect(
      screen.getByRole('menuitemradio', { name: /Modern/i }).getAttribute('aria-checked')
    ).toBe('false');
  });

  it('closes the menu on Escape', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Query the trigger generically (theme label varies with localStorage state across tests)
    const trigger = screen.getByRole('button', { name: /Theme:.+select theme/i });
    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });
});
