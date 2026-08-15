import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutRenderer } from './components/layout/LayoutRenderer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ChatWidget } from './components/chat/ChatWidget';

// Route-level code splitting: each page loads on demand.
const HomePage = lazy(() => import('./pages/HomePage').then((m) => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ProjectsPage = lazy(() =>
  import('./pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
);
const BlogListPage = lazy(() =>
  import('./pages/BlogListPage').then((m) => ({ default: m.BlogListPage })),
);
const BlogDetailPage = lazy(() =>
  import('./pages/BlogDetailPage').then((m) => ({ default: m.BlogDetailPage })),
);
const ExperiencePage = lazy(() =>
  import('./pages/ExperiencePage').then((m) => ({ default: m.ExperiencePage })),
);
const NowPage = lazy(() => import('./pages/NowPage').then((m) => ({ default: m.NowPage })));
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
);
const HowThisSiteWorksPage = lazy(() =>
  import('./pages/HowThisSiteWorksPage').then((m) => ({ default: m.HowThisSiteWorksPage })),
);
const MonitoringPage = lazy(() =>
  import('./pages/MonitoringPage').then((m) => ({ default: m.MonitoringPage })),
);
const GuidebookPage = lazy(() =>
  import('./pages/GuidebookPage').then((m) => ({ default: m.GuidebookPage })),
);
const AmazonToolsPage = lazy(() =>
  import('./pages/AmazonToolsPage').then((m) => ({ default: m.AmazonToolsPage })),
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
);

const PageLoader: React.FC = () => (
  <div className="page-container" role="status" aria-live="polite">
    <p style={{ textAlign: 'center', padding: '2rem' }}>Loading…</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutRenderer>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogDetailPage />} />
              <Route path="/amazon-tools" element={<AmazonToolsPage />} />
              <Route path="/guidebook" element={<GuidebookPage />} />
              <Route path="/experience" element={<ExperiencePage />} />
              <Route path="/now" element={<NowPage />} />
              <Route path="/monitoring" element={<MonitoringPage />} />
              <Route path="/how-this-site-works" element={<HowThisSiteWorksPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </LayoutRenderer>
      {/* Global chat widget — floats above all three theme layouts. */}
      <ChatWidget />
    </ThemeProvider>
  );
};

export default App;
