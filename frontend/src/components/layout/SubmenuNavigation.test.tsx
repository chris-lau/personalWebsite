import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ModernLayout } from './ModernLayout';
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

    const headerNav = screen.getByRole('navigation', { name: /main navigation/i });

    // Verify top-level triggers and direct links in header nav
    const experienceLink = within(headerNav).getByRole('link', { name: /^Experience$/i });
    const projectsLink = within(headerNav).getByRole('link', { name: /^Projects$/i });
    const aboutTrigger = within(headerNav).getByRole('button', { name: /^About$/i });
    const labTrigger = within(headerNav).getByRole('button', { name: /^Lab$/i });
    const contactLink = within(headerNav).getByRole('link', { name: /^Contact$/i });

    expect(experienceLink).toBeDefined();
    expect(projectsLink).toBeDefined();
    expect(aboutTrigger).toBeDefined();
    expect(labTrigger).toBeDefined();
    expect(contactLink).toBeDefined();

    // Old groups should no longer exist
    expect(within(headerNav).queryByRole('button', { name: /Work & Writing/i })).toBeNull();
    expect(within(headerNav).queryByRole('button', { name: /System & Ops/i })).toBeNull();

    // Dropdown should be initially closed (aria-expanded = false)
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');

    // Click 'About' trigger to open dropdown
    fireEvent.click(aboutTrigger);
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('true');

    // Submenu links for About should now be visible: Bio & Skills, What I'm Doing Now, Blog, Engineering Guidebook
    expect(within(headerNav).getByRole('menuitem', { name: /Bio & Skills/i })).toBeDefined();
    expect(within(headerNav).getByRole('menuitem', { name: /What I'm Doing Now/i })).toBeDefined();
    expect(within(headerNav).getByRole('menuitem', { name: /^Blog$/i })).toBeDefined();
    expect(within(headerNav).getByRole('menuitem', { name: /Engineering Guidebook/i })).toBeDefined();

    // Experience must NOT appear in About submenu anymore (it is top-level)
    expect(within(headerNav).queryAllByRole('menuitem', { name: /Experience/i })).toHaveLength(0);

    // Pressing Escape should close dropdown
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(aboutTrigger.getAttribute('aria-expanded')).toBe('false');

    // Lab dropdown should contain How This Site Works, Live Ops Dashboard, Amazon Seller Suite
    fireEvent.click(labTrigger);
    expect(within(headerNav).getByRole('menuitem', { name: /How This Site Works/i })).toBeDefined();
    expect(within(headerNav).getByRole('menuitem', { name: /Live Ops Dashboard/i })).toBeDefined();
    expect(within(headerNav).getByRole('menuitem', { name: /Amazon Seller Suite/i })).toBeDefined();
  });

});
