import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutRenderer } from './components/layout/LayoutRenderer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { BlogListPage } from './pages/BlogListPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { ExperiencePage } from './pages/ExperiencePage';
import { NowPage } from './pages/NowPage';
import { ContactPage } from './pages/ContactPage';
import { HowThisSiteWorksPage } from './pages/HowThisSiteWorksPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LayoutRenderer>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogDetailPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/now" element={<NowPage />} />
          <Route path="/how-this-site-works" element={<HowThisSiteWorksPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </LayoutRenderer>
    </ThemeProvider>
  );
};


export default App;
