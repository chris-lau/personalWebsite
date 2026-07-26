import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { LayoutRenderer } from './LayoutRenderer';
import { ThemeProvider } from '../../context/ThemeContext';

describe('LayoutRenderer Component', () => {
  it('renders children content within current theme layout', () => {
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
    expect(screen.getByRole('navigation')).toBeDefined();
  });
});
