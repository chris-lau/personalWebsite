import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('App Router & Integration Tests', () => {
  it('renders home page by default at route "/"', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('WELCOME')).toBeInTheDocument();
  });

  it('renders about page at route "/about"', async () => {
    render(
      <MemoryRouter initialEntries={['/about']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('ABOUT ME')).toBeInTheDocument();
  });

  it('renders projects page at route "/projects"', async () => {
    render(
      <MemoryRouter initialEntries={['/projects']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('FEATURED PORTFOLIO PROJECTS')).toBeInTheDocument();
  });

  it('renders experience page at route "/experience"', async () => {
    render(
      <MemoryRouter initialEntries={['/experience']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('CAREER & EXPERIENCE')).toBeInTheDocument();
  });

  it('renders now page at route "/now"', async () => {
    render(
      <MemoryRouter initialEntries={['/now']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText("WHAT I'M DOING NOW")).toBeInTheDocument();
  });

  it('renders contact page at route "/contact"', async () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('GET IN TOUCH')).toBeInTheDocument();
  });

  it('renders how-this-site-works page at route "/how-this-site-works"', async () => {
    render(
      <MemoryRouter initialEntries={['/how-this-site-works']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('HOW THIS SITE WORKS')).toBeInTheDocument();
  });

  it('renders 404 page for unknown route "/invalid-route"', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid-route']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('ERROR 404')).toBeInTheDocument();
  });

  it('navigates to another page when clicking nav links in header', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('WELCOME')).toBeInTheDocument();

    // Projects is now a direct top-level link (promoted out of Work & Writing dropdown)
    const projectsLink = screen.getByRole('link', { name: /^Projects$/i });
    fireEvent.click(projectsLink);

    expect(await screen.findByText('FEATURED PORTFOLIO PROJECTS')).toBeInTheDocument();
  });

  it('allows toggling theme mode within app layout', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    // Wait for the lazy-loaded page to render the layout.
    await screen.findByText('WELCOME');

    const asciiSegmentBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
    expect(asciiSegmentBtn).toBeInTheDocument();

    fireEvent.click(asciiSegmentBtn);

    const updatedAsciiBtn = screen.getByRole('radio', { name: /Set theme to ASCII/i });
    expect(updatedAsciiBtn.getAttribute('aria-checked')).toEqual('true');
  });
});
