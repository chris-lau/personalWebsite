import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BoxContainer } from './BoxContainer';

describe('BoxContainer Component', () => {
  it('renders children content correctly', () => {
    render(<BoxContainer>Test Content</BoxContainer>);
    expect(screen.getByText('Test Content')).toBeDefined();
  });

  it('renders title when provided', () => {
    render(<BoxContainer title="Test Title">Test Content</BoxContainer>);
    expect(screen.getByText('[ Test Title ]')).toBeDefined();
  });
});

