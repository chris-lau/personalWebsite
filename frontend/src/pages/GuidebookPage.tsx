import React, { useState, useRef } from 'react';
import { BookOpen, Server } from 'lucide-react';
import { guidebookChapters, backendGuidebookChapters } from '../data/guidebookData';
import { Section } from '../components/ui/Section';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import './Pages.css';
import './GuidebookPage.css';

export const GuidebookPage: React.FC = () => {
  const [activeVolume, setActiveVolume] = useState<'frontend' | 'backend'>('frontend');
  const [activeChapterId, setActiveChapterId] = useState<string>('chapter-1');
  const [mobileTocOpen, setMobileTocOpen] = useState<boolean>(false);
  const readerRef = useRef<HTMLDivElement>(null);

  const currentChapters = activeVolume === 'frontend' ? guidebookChapters : backendGuidebookChapters;

  const activeChapter =
    currentChapters.find((ch) => ch.id === activeChapterId) || currentChapters[0];

  const activeIndex = currentChapters.findIndex((ch) => ch.id === activeChapter.id);
  const prevChapter = activeIndex > 0 ? currentChapters[activeIndex - 1] : null;
  const nextChapter =
    activeIndex < currentChapters.length - 1 ? currentChapters[activeIndex + 1] : null;

  const scrollToReader = () => {
    if (readerRef.current) {
      const yOffset = -80;
      const y = readerRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'auto' });
    }
  };

  const handleSelectVolume = (volume: 'frontend' | 'backend') => {
    setActiveVolume(volume);
    const firstChapterId = volume === 'frontend' ? 'chapter-1' : 'backend-chapter-1';
    setActiveChapterId(firstChapterId);
    setMobileTocOpen(false);
    scrollToReader();
  };

  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    setMobileTocOpen(false);
    scrollToReader();
  };

  return (
    <div className="page-container page-guidebook">
      <section className="guidebook-hero">
        <Section title="SOFTWARE ENGINEERING GUIDEBOOK SERIES">
          <div className="hero-content">
            <h1 className="hero-title serif-heading">
              {activeVolume === 'frontend'
                ? 'Volume 1: Building Modern Web Applications'
                : 'Volume 2: FastAPI & Python Backend Architecture'}
            </h1>
            <p className="hero-subtitle">
              {activeVolume === 'frontend'
                ? 'A Step-by-Step Architecture Guide for Frontend Beginners, TPMs & Engineers'
                : 'A Step-by-Step Guide to FastAPI REST Microservices, Pydantic v2, Pytest & Docker'}
            </p>
            <p className="hero-bio">
              Written by <strong>Chris Lau</strong> — Staff Product Manager, AI & Enterprise Systems. 
              This interactive guidebook series breaks down modern full-stack web architecture, TypeScript patterns, 
              Python FastAPI REST design, Pydantic schemas, server-side caching, testing strategies, and containerized cloud deployments.
            </p>

            {/* Volume Selector Tab Bar */}
            <div className="projects-tab-bar" style={{ marginTop: '1rem' }} role="tablist" aria-label="Guidebook volume selection">
              <button
                type="button"
                role="tab"
                aria-selected={activeVolume === 'frontend'}
                className={`projects-tab-btn ${activeVolume === 'frontend' ? 'active' : ''}`}
                onClick={() => handleSelectVolume('frontend')}
              >
                <BookOpen size={16} aria-hidden="true" /> Vol 1: Frontend Architecture (Ch 1–9)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeVolume === 'backend'}
                className={`projects-tab-btn ${activeVolume === 'backend' ? 'active' : ''}`}
                onClick={() => handleSelectVolume('backend')}
              >
                <Server size={16} aria-hidden="true" /> Vol 2: FastAPI Backend Engine (Ch 1–7)
              </button>
            </div>
          </div>
        </Section>
      </section>

      {/* Guidebook Main Layout: Sidebar Navigation + Reader Area */}
      <div className="guidebook-layout">
        {/* Sidebar Table of Contents */}
        <aside className="guidebook-sidebar" aria-label="Table of Contents">
          <div className="sidebar-inner">
            <div className="sidebar-header-row">
              <h2 className="sidebar-heading">
                &gt; {activeVolume === 'frontend' ? 'VOL 1 TOC' : 'VOL 2 TOC'} (Ch {activeChapter.number}/{currentChapters.length})
              </h2>
              <button
                type="button"
                className="mobile-toc-toggle-btn"
                onClick={() => setMobileTocOpen((prev) => !prev)}
                aria-expanded={mobileTocOpen}
                aria-label="Toggle table of contents"
              >
                {mobileTocOpen ? 'Hide Chapters ▴' : 'Choose Chapter ▾'}
              </button>
            </div>
            <nav className={`chapter-nav ${mobileTocOpen ? 'mobile-open' : ''}`}>
              <ul className="chapter-list">
                {currentChapters.map((ch) => (
                  <li key={ch.id} className="chapter-item">
                    <button
                      type="button"
                      onClick={() => handleSelectChapter(ch.id)}
                      className={`chapter-btn ${activeChapter.id === ch.id ? 'active' : ''}`}
                    >
                      <span className="chapter-num">Ch {ch.number}.</span>
                      <span className="chapter-title-text">{ch.title}</span>
                    </button>

                    {/* Subsections list for active chapter */}
                    {activeChapter.id === ch.id && (
                      <ul className="subsection-list">
                        {ch.subsections.map((sub, i) => (
                          <li key={i} className="subsection-item">
                            {sub}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* Chapter Reader Area */}
        <main ref={readerRef} className="guidebook-reader">
          <Section title={`CHAPTER ${activeChapter.number} of ${currentChapters.length}`}>
            <div className="reader-header">
              <div className="chapter-meta">
                <span className="chapter-badge">
                  {activeVolume === 'frontend' ? 'Volume 1' : 'Volume 2'} — Chapter {activeChapter.number}
                </span>
              </div>
              <h2 className="reader-chapter-title serif-heading">{activeChapter.title}</h2>
            </div>

            <div className="reader-content">
              <MarkdownRenderer content={activeChapter.content} variant="reader" />
            </div>

            {/* Chapter Pagination Navigation */}
            <nav className="chapter-pagination" aria-label="Chapter Pagination">
              {prevChapter ? (
                <button
                  type="button"
                  onClick={() => handleSelectChapter(prevChapter.id)}
                  className="link-button pagination-btn prev"
                >
                  ← Ch {prevChapter.number}: {prevChapter.title}
                </button>
              ) : (
                <div />
              )}

              {nextChapter && (
                <button
                  type="button"
                  onClick={() => handleSelectChapter(nextChapter.id)}
                  className="link-button primary pagination-btn next"
                >
                  Ch {nextChapter.number}: {nextChapter.title} →
                </button>
              )}
            </nav>
          </Section>
        </main>
      </div>
    </div>
  );
};
