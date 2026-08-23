import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { HomePage } from './HomePage';

// HomePage embeds the hero chat — mock the hook to avoid backend calls.
vi.mock('../hooks/useChat', () => ({
  useChat: () => ({
    messages: [],
    loading: false,
    error: null,
    isFallback: false,
    models: [{ id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', provider: 'gemini' }],
    selectedModel: 'gemini-2.5-flash',
    setSelectedModel: vi.fn(),
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
    metricsMap: new Map(),
    streamProgress: null,
  }),
}));
import { ProjectsPage } from './ProjectsPage';
import { AboutPage } from './AboutPage';
import { ExperiencePage } from './ExperiencePage';
import { NowPage } from './NowPage';
import { ContactPage } from './ContactPage';
import { HowThisSiteWorksPage } from './HowThisSiteWorksPage';
import { MonitoringPage } from './MonitoringPage';
import { NotFoundPage } from './NotFoundPage';
import { BlogListPage } from './BlogListPage';
import { BlogDetailPage } from './BlogDetailPage';
import { AmazonToolsPage } from './AmazonToolsPage';

describe('Page Components Unit Tests', () => {
  it('renders MonitoringPage telemetry console', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <MonitoringPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /Full-Stack Operational Monitoring & Telemetry/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText('LIVE TELEMETRY CONSOLE')).toBeInTheDocument();
  });

  it('renders BlogListPage and filters by search input and tag buttons', () => {
    render(
      <MemoryRouter>
        <BlogListPage />
      </MemoryRouter>
    );

    expect(screen.getByText('TECHNICAL BLOG')).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/Search posts by keyword/i);
    fireEvent.change(searchInput, { target: { value: 'Scaffolding' } });

    expect(screen.getByText(/Demystifying Modern React Scaffolding/i)).toBeInTheDocument();

    // Reset search and test tag click — getByRole throws if missing, so this is a real assertion.
    fireEvent.change(searchInput, { target: { value: '' } });
    const reactTag = screen.getByRole('button', { name: '#React' });
    fireEvent.click(reactTag);
    expect(reactTag.className).toContain('active');
  });

  it('renders BlogDetailPage with content and related articles when valid slug provided', () => {
    render(
      <MemoryRouter initialEntries={['/blog/demystifying-react-architecture-and-dev-tools']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByText(
        'Demystifying Modern React Architecture: Data Contracts, Dev Servers, and Type-Safe State',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('By Chris Lau')).toBeInTheDocument();
    expect(screen.getByText('RELATED ARTICLES')).toBeInTheDocument();
  });

  it('renders BlogDetailPage error state when invalid slug provided', () => {
    render(
      <MemoryRouter initialEntries={['/blog/invalid-slug']}>
        <Routes>
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('BLOG POST NOT FOUND')).toBeInTheDocument();
  });

  it('renders HomePage with hero, status badge, and bento tiles', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    // Statement hero: positioning headline, name carried in the lede.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Technical product leader who builds the AI systems he ships.',
    );
    expect(screen.getByText('Chris Lau')).toBeInTheDocument();
    expect(screen.getByText('Staff Product Manager, AI at Global Relay')).toBeInTheDocument();
    expect(screen.getByText(/Greater Vancouver Metropolitan Area/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View Experience/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Get in Touch' })).toHaveAttribute(
      'href',
      'mailto:contact@chrislau.dev',
    );
    expect(
      screen
        .getAllByRole('link', { name: /LinkedIn/i })
        .filter((el) => el.className.includes('hero-cta-social')),
    ).toHaveLength(1);
    expect(
      screen
        .getAllByRole('link', { name: /GitHub/i })
        .filter((el) => el.className.includes('hero-cta-social')),
    ).toHaveLength(1);

    // Current-role status badge links to the experience page.
    expect(screen.getByText('Staff Product Manager, Artificial Intelligence @ Global Relay')).toBeInTheDocument();

    // Chat lives in its own bento tile below the hero.
    expect(screen.getByText('ASK THIS SITE')).toBeInTheDocument();
    expect(screen.getByText(/This chat runs on a RAG backend I built/i)).toBeInTheDocument();

    expect(screen.getByText('FEATURED WORK')).toBeInTheDocument();
    expect(screen.getByText('CORE SKILLS')).toBeInTheDocument();
    expect(screen.getByText('NOW')).toBeInTheDocument();
  });

  it('renders HomePage without the explore dock; skills surfaced via the toolchain tile', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.queryByText('── or explore directly ──')).toBeNull();
    expect(screen.queryByRole('navigation', { name: 'Direct site exploration' })).toBeNull();
    expect(screen.queryByText('SKILLS SNAPSHOT')).toBeNull();
  });

  it('renders featured projects in priority order with outcome lines and live demo links', () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings.indexOf('Multi-Agent System Platform'))
      .toBeLessThan(headings.indexOf('Amazon Seller Trend & Opportunity Suite'));
    expect(headings.indexOf('Amazon Seller Trend & Opportunity Suite'))
      .toBeLessThan(headings.indexOf('Personal Portfolio Website'));

    // One-line outcomes condensed from each project's description.
    expect(screen.getByText(/specialized AI agents orchestrated/i)).toBeInTheDocument();
    expect(screen.getByText(/Opportunity Score with FBA unit-economics/i)).toBeInTheDocument();
    expect(screen.getByText(/three themes, a live GitHub Activity Dashboard/i)).toBeInTheDocument();

    // Live Demo routing: Amazon Suite -> /amazon-tools, Portfolio -> /how-this-site-works.
    const liveDemoHrefs = screen
      .getAllByRole('link', { name: /Live Demo/ })
      .map((link) => link.getAttribute('href'));
    expect(liveDemoHrefs).toEqual(['/amazon-tools', '/how-this-site-works']);
  });

  it('renders AboutPage with skill matrix', () => {
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>
    );

    expect(screen.getByText('ABOUT ME')).toBeInTheDocument();
    expect(screen.getByText('SKILL MATRIX')).toBeInTheDocument();
  });

  it('renders ProjectsPage and handles tag filtering', () => {
    render(
      <MemoryRouter>
        <ProjectsPage />
      </MemoryRouter>
    );

    expect(screen.getByText('FEATURED PORTFOLIO PROJECTS')).toBeInTheDocument();

    // Find all tags filter button
    const allButton = screen.getByRole('button', { name: 'All' });
    expect(allButton.className).toContain('active');

    // Click a tech tag button — getByRole throws if missing, so this is a real assertion.
    const reactTag = screen.getByRole('button', { name: '#React' });
    fireEvent.click(reactTag);
    expect(reactTag.className).toContain('active');

    // Switch to GitHub activity tab
    const githubTab = screen.getByRole('tab', { name: /Live GitHub Activity/i });
    fireEvent.click(githubTab);
    expect(screen.getByText('LIVE GITHUB ACTIVITY & REPOSITORIES')).toBeInTheDocument();
  });

  it('renders ExperiencePage timeline items', () => {
    render(
      <MemoryRouter>
        <ExperiencePage />
      </MemoryRouter>
    );

    expect(screen.getByText('CAREER & EXPERIENCE')).toBeInTheDocument();
  });

  it('renders NowPage content', () => {
    render(
      <MemoryRouter>
        <NowPage />
      </MemoryRouter>
    );

    expect(screen.getByText("WHAT I'M DOING NOW")).toBeInTheDocument();
  });

  it('renders ContactPage options', () => {
    render(
      <MemoryRouter>
        <ContactPage />
      </MemoryRouter>
    );

    expect(screen.getByText('GET IN TOUCH')).toBeInTheDocument();
  });

  it('renders HowThisSiteWorksPage technical stack', () => {
    render(
      <MemoryRouter>
        <HowThisSiteWorksPage />
      </MemoryRouter>
    );

    expect(screen.getByText('HOW THIS SITE WORKS')).toBeInTheDocument();
  });

  it('renders AmazonToolsPage suite', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AmazonToolsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Amazon Seller Trend & Opportunity Suite/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with error state', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByText('ERROR 404')).toBeInTheDocument();
    expect(screen.getByText(/Return Home/i)).toBeInTheDocument();
  });

  // Track C: Showcase reframing tests for Monitoring, Amazon Tools, and How This Site Works
  it('renders MonitoringPage with showcase framing intro line', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <MonitoringPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Exhibit:/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'LIVE TELEMETRY CONSOLE' })).toBeInTheDocument();
    expect(screen.getByText(/Zero-cost observability I built/i)).toBeInTheDocument();
  });

  it('renders AmazonToolsPage with showcase framing intro line', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <AmazonToolsPage />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/Live product demo:/i)).toBeInTheDocument();
    expect(screen.getByText(/an opportunity-scoring suite I designed and built end-to-end/i)).toBeInTheDocument();
  });

  it('renders HowThisSiteWorksPage with Lab hub explorer buttons for Amazon Suite and Chat Obs', () => {
    render(
      <MemoryRouter>
        <HowThisSiteWorksPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('link', { name: /Amazon Seller Suite/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Chat Observability & Telemetry/i })).toBeInTheDocument();
  });
});
