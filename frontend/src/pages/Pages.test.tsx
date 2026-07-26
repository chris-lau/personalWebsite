import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './HomePage';
import { ProjectsPage } from './ProjectsPage';
import { AboutPage } from './AboutPage';
import { ExperiencePage } from './ExperiencePage';
import { NowPage } from './NowPage';
import { ContactPage } from './ContactPage';
import { HowThisSiteWorksPage } from './HowThisSiteWorksPage';
import { NotFoundPage } from './NotFoundPage';
import { BlogListPage } from './BlogListPage';
import { BlogDetailPage } from './BlogDetailPage';

describe('Page Components Unit Tests', () => {

  it('renders BlogListPage and filters by search input', () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    expect(screen.getByText('TECHNICAL BLOG')).toBeDefined();

    const searchInput = screen.getByPlaceholderText(/Search posts by keyword/i);
    fireEvent.change(searchInput, { target: { value: 'Scaffolding' } });

    expect(screen.getByText(/Demystifying Modern React Scaffolding/i)).toBeDefined();
  });

  it('renders BlogDetailPage with content when valid slug provided', () => {
    render(
      <MemoryRouter initialEntries={['/blog/demystifying-react-architecture-and-dev-tools']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Demystifying Modern React Architecture: Data Contracts, Dev Servers, and Type-Safe State')).toBeDefined();
    expect(screen.getByText('By Chris Lau')).toBeDefined();
  });

  it('renders BlogDetailPage error state when invalid slug provided', () => {
    render(
      <MemoryRouter initialEntries={['/blog/invalid-slug']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('BLOG POST NOT FOUND')).toBeDefined();
  });

  it('renders HomePage with profile bio and featured section', () => {

    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('WELCOME')).toBeDefined();
    expect(screen.getByText('FEATURED PROJECTS')).toBeDefined();
    expect(screen.getByText('SKILLS SNAPSHOT')).toBeDefined();
  });

  it('renders AboutPage with skill matrix', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('ABOUT ME')).toBeDefined();
    expect(screen.getByText('SKILL MATRIX')).toBeDefined();
  });

  it('renders ProjectsPage and handles tag filtering', () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('PROJECT ARCHIVE')).toBeDefined();
    
    // Find all tags filter button
    const allButton = screen.getByRole('button', { name: '[All]' });
    expect(allButton.className).toContain('active');

    // Click a tech tag button if present
    const reactTag = screen.queryByRole('button', { name: '#React' });
    if (reactTag) {
      fireEvent.click(reactTag);
      expect(reactTag.className).toContain('active');
    }
  });

  it('renders ExperiencePage timeline items', () => {
    render(
      <MemoryRouter>
        <ExperiencePage />
      </MemoryRouter>
    );

    expect(screen.getByText('CAREER & EXPERIENCE')).toBeDefined();
  });

  it('renders NowPage content', () => {
    render(
      <MemoryRouter>
        <NowPage />
      </MemoryRouter>
    );

    expect(screen.getByText("WHAT I'M DOING NOW")).toBeDefined();
  });

  it('renders ContactPage options', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    expect(screen.getByText('GET IN TOUCH')).toBeDefined();
  });

  it('renders HowThisSiteWorksPage technical stack', () => {
    render(
      <MemoryRouter>
        <HowThisSiteWorksPage />
      </MemoryRouter>
    );

    expect(screen.getByText('HOW THIS SITE WORKS')).toBeDefined();
  });

  it('renders NotFoundPage with error state', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('ERROR 404')).toBeDefined();
    expect(screen.getByText('[ Return Home ]')).toBeDefined();
  });
});
