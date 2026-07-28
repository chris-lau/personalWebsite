import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Router & Integration Tests', () => {
  it('renders home page by default at route "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('WELCOME')).toBeDefined();
  });

  it('renders about page at route "/about"', () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('ABOUT ME')).toBeDefined();
  });

  it('renders projects page at route "/projects"', () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('FEATURED PORTFOLIO PROJECTS')).toBeDefined();
  });

  it('renders experience page at route "/experience"', () => {
    render(
      <MemoryRouter initialEntries={['/experience']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('CAREER & EXPERIENCE')).toBeDefined();
  });

  it('renders now page at route "/now"', () => {
    render(
      <MemoryRouter initialEntries={['/now']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText("WHAT I'M DOING NOW")).toBeDefined();
  });

  it('renders contact page at route "/contact"', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('GET IN TOUCH')).toBeDefined();
  });

  it('renders how-this-site-works page at route "/how-this-site-works"', () => {
    render(
      <MemoryRouter initialEntries={['/how-this-site-works']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('HOW THIS SITE WORKS')).toBeDefined();
  });

  it('renders 404 page for unknown route "/invalid-route"', () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('ERROR 404')).toBeDefined();
  });

  it('navigates to another page when clicking nav links in header', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('WELCOME')).toBeDefined();

    // Click on projects link in navigation header
    const projectsLinks = screen.getAllByRole('link', { name: /^(Projects|\[PROJECTS\])$/i });
    fireEvent.click(projectsLinks[0]);

    expect(screen.getByText('FEATURED PORTFOLIO PROJECTS')).toBeDefined();
  });

  it('allows toggling theme mode within app layout', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    const asciiSegmentBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
    expect(asciiSegmentBtn).toBeDefined();

    fireEvent.click(asciiSegmentBtn);
    
    const updatedAsciiBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
    expect(updatedAsciiBtn.getAttribute('aria-checked')).toEqual('true');
  });
});
