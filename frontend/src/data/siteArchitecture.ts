import { SiteArchitectureCategory } from '../types/portfolio';

export const siteArchitectureData: SiteArchitectureCategory[] = [
  {
    category: 'CORE ARCHITECTURE & FRAMEWORK',
    items: [
      {
        name: 'React 18 & TypeScript (Strict Mode)',
        desc: 'Built with strongly typed interfaces (Profile, Project, Experience, SiteArchitectureCategory, ThemeMode) ensuring compile-time safety and zero any types.'
      },
      {
        name: 'Vite 5 Build Engine',
        desc: 'Configured with lightning-fast HMR and optimized production bundle chunking (< 180kB JS / 9kB CSS).'
      },
      {
        name: 'React Router 6 (Client-Side SPA Routing)',
        desc: 'Declarative routing with <Routes> and <Route> wrapped in a global LayoutRenderer context.'
      },
      {
        name: 'GitHub REST API Integration & sessionStorage Caching Layer',
        desc: 'Real-time GitHub activity integration fetching user profile & repository metrics (api.github.com), 15-minute per-username sessionStorage TTL caching, custom React hook (useGitHubData), and 30-day activity highlight filters.'
      }
    ]
  },
  {
    category: 'DESIGN SYSTEM & DYNAMIC THEMING',
    items: [
      {
        name: 'Multi-Theme Architecture (Modern Editorial, ASCII Box & CLI Terminal)',
        desc: 'Stateful 3-way theme switching using React Context (ThemeContext) with localStorage persistence and CSS variable design tokens (data-theme="modern", "ascii", and "cli").'
      },
      {
        name: 'Pure Vanilla CSS & Monospace Typography',
        desc: 'Custom CSS resets, responsive grid/flexbox layouts, Google JetBrains Mono font loading, and retro terminal styling without heavy UI library dependencies.'
      }
    ]
  },
  {
    category: 'TESTING & QUALITY ASSURANCE',
    items: [
      {
        name: 'Vitest + React Testing Library + happy-dom',
        desc: 'In-memory unit tests for component rendering, static data layers, router navigation, and interactive tag filtering.'
      },
      {
        name: 'Playwright E2E Integration Testing',
        desc: 'Automated real Chrome browser tests verifying user navigation flows, theme toggle persistence, interactive filtering, and 404 page fallback.'
      },
      {
        name: 'Storybook 10 & Accessibility (a11y) Audits',
        desc: 'Isolated component visual development and @storybook/addon-a11y accessibility validation (.sr-only utility, ARIA landmark roles, and high contrast visible focus rings).'
      }
    ]
  }
];
