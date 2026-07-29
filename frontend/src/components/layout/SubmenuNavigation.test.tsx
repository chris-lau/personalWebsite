import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ModernLayout } from './ModernLayout';
import { CliLayout } from './CliLayout';
import { AsciiLayout } from './AsciiLayout';
import { ThemeProvider } from '../../context/ThemeContext';

describe('Submenu Navigation Component Tests', () => {
  it('renders consolidated top-level groups and opens submenus on interaction in ModernLayout', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <ModernLayout>
            <div>Content</div>
          </ModernLayout>
        </MemoryRouter>
      </ThemeProvider>
    );

    // Verify top-level triggers are rendered
    const aboutTrigger = screen.getByRole('button', { name: /About/i });
    const workTrigger = screen.getByRole('button', { name: /Work & Writing/i });
    const systemTrigger = screen.getByRole('button', { name: /System & Ops/i });
    const contactLink = screen.getByRole('link', { name: /Contact/i });

    expect(aboutTrigger).toBeDefined();
    expect(workTrigger).toBeDefined();
    expect(systemTrigger).toBeDefined();
    expect(contactLink).toBeDefined();

    // Dropdown should be initially closed (aria-expanded = false)
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');

    // Click 'About' trigger to open dropdown
    fireEvent.click(aboutTrigger);
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('true');

    // Submenu links should now be visible
    expect(screen.getByRole('menuitem', { name: /Bio & Profile/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /Experience & Career/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /What I'm Doing Now/i })).toBeDefined();

    // Pressing Escape should close dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('renders CLI layout grouped navigation submenus', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <CliLayout>
            <div>Content</div>
          </CliLayout>
        </MemoryRouter>
      </ThemeProvider>
    );

    const aboutTrigger = screen.getByRole('button', { name: /about\//i });
    expect(aboutTrigger).toBeDefined();

    fireEvent.click(aboutTrigger);
    expect(screen.getByRole('menuitem', { name: /about.txt/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /history.log/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /now.md/i })).toBeDefined();
  });

  it('renders ASCII layout grouped navigation submenus', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <AsciiLayout>
            <div>Content</div>
          </AsciiLayout>
        </MemoryRouter>
      </ThemeProvider>
    );

    const aboutTrigger = screen.getByRole('button', { name: /ABOUT/i });
    expect(aboutTrigger).toBeDefined();

    fireEvent.click(aboutTrigger);
    expect(screen.getByRole('menuitem', { name: /ABOUT/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /EXP/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /NOW/i })).toBeDefined();
  });
});
