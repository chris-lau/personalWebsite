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

    // Verify top-level triggers and direct links
    const experienceLink = screen.getByRole('link', { name: /^Experience$/i });
    const projectsLink = screen.getByRole('link', { name: /^Projects$/i });
    const aboutTrigger = screen.getByRole('button', { name: /^About$/i });
    const labTrigger = screen.getByRole('button', { name: /^Lab$/i });
    const contactLink = screen.getByRole('link', { name: /^Contact$/i });

    expect(experienceLink).toBeDefined();
    expect(projectsLink).toBeDefined();
    expect(aboutTrigger).toBeDefined();
    expect(labTrigger).toBeDefined();
    expect(contactLink).toBeDefined();

    // Old groups should no longer exist
    expect(screen.queryByRole('button', { name: /Work & Writing/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /System & Ops/i })).toBeNull();

    // Dropdown should be initially closed (aria-expanded = false)
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');

    // Click 'About' trigger to open dropdown
    fireEvent.click(aboutTrigger);
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('true');

    // Submenu links for About should now be visible: Bio & Skills, What I'm Doing Now, Blog, Engineering Guidebook
    expect(screen.getByRole('menuitem', { name: /Bio & Skills/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /What I'm Doing Now/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /^Blog$/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /Engineering Guidebook/i })).toBeDefined();

    // Experience must NOT appear in About submenu anymore (it is top-level)
    expect(screen.queryAllByRole('menuitem', { name: /Experience/i })).toHaveLength(0);

    // Pressing Escape should close dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');

    // Lab dropdown should contain How This Site Works, Live Ops Dashboard, Amazon Seller Suite
    fireEvent.click(labTrigger);
    expect(screen.getByRole('menuitem', { name: /How This Site Works/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /Live Ops Dashboard/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /Amazon Seller Suite/i })).toBeDefined();
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

    const expLink = screen.getByRole('link', { name: /experience\//i });
    const projLink = screen.getByRole('link', { name: /projects\//i });
    const aboutTrigger = screen.getByRole('button', { name: /about\//i });
    const labTrigger = screen.getByRole('button', { name: /lab\//i });
    const contactLink = screen.getByRole('link', { name: /contact.sh/i });

    expect(expLink).toBeDefined();
    expect(projLink).toBeDefined();
    expect(aboutTrigger).toBeDefined();
    expect(labTrigger).toBeDefined();
    expect(contactLink).toBeDefined();

    fireEvent.click(aboutTrigger);
    expect(screen.getByRole('menuitem', { name: /about.txt/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /now.md/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /blog\//i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /book.md/i })).toBeDefined();

    fireEvent.click(labTrigger);
    expect(screen.getByRole('menuitem', { name: /stack.md/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /top.sh/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /amazon-tools.sh/i })).toBeDefined();
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

    const expLink = screen.getByRole('link', { name: /\[EXP\]/i });
    const projLink = screen.getByRole('link', { name: /\[PROJECTS\]/i });
    const aboutTrigger = screen.getByRole('button', { name: /\[ABOUT\]/i });
    const labTrigger = screen.getByRole('button', { name: /\[LAB\]/i });
    const contactLink = screen.getByRole('link', { name: /\[CONTACT\]/i });

    expect(expLink).toBeDefined();
    expect(projLink).toBeDefined();
    expect(aboutTrigger).toBeDefined();
    expect(labTrigger).toBeDefined();
    expect(contactLink).toBeDefined();

    fireEvent.click(aboutTrigger);
    expect(screen.getByRole('menuitem', { name: /ABOUT/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /NOW/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /BLOG/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /BOOK/i })).toBeDefined();

    fireEvent.click(labTrigger);
    expect(screen.getByRole('menuitem', { name: /STACK/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /OPS/i })).toBeDefined();
    expect(screen.getByRole('menuitem', { name: /AMZ-TOOLS/i })).toBeDefined();
  });
});
