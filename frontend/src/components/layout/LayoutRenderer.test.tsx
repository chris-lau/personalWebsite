import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LayoutRenderer } from './LayoutRenderer';
import { ModernLayout } from './ModernLayout';
import { ThemeProvider } from '../../context/ThemeContext';

describe('LayoutRenderer Component', () => {
  it('renders children content within the site layout', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <LayoutRenderer>
            <div>Test Child Content</div>
          </LayoutRenderer>
        </MemoryRouter>
      </ThemeProvider>
    );

    expect(screen.getByText('Test Child Content')).toBeDefined();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeDefined();
  });

  it('renders footer safety net links in ModernLayout', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <ModernLayout>
            <div>Content</div>
          </ModernLayout>
        </MemoryRouter>
      </ThemeProvider>
    );

    const footerNav = screen.getByRole('navigation', { name: /footer navigation/i });
    expect(footerNav).toBeDefined();

    expect(within(footerNav).getByRole('link', { name: 'Bio' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Now' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Blog' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Guidebook' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'How This Site Works' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Ops Dashboard' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Amazon Suite' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Experience' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Projects' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Contact' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'Storybook' })).toBeDefined();
    expect(within(footerNav).getByRole('link', { name: 'API Docs' })).toBeDefined();
  });
});
