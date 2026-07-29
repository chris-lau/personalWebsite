import React, { useState, useRef, useMemo } from 'react';
import { guidebookChapters, backendGuidebookChapters } from '../data/guidebookData';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';
import './GuidebookPage.css';

export const GuidebookPage: React.FC = () => {
  const [activeVolume, setActiveVolume] = useState<'frontend' | 'backend'>('frontend');
  const [activeChapterId, setActiveChapterId] = useState<string>('chapter-1');
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
      window.scrollTo({ top: y, behavior: 'instant' });
    }
  };

  const handleSelectVolume = (volume: 'frontend' | 'backend') => {
    setActiveVolume(volume);
    const firstChapterId = volume === 'frontend' ? 'chapter-1' : 'backend-chapter-1';
    setActiveChapterId(firstChapterId);
    scrollToReader();
  };

  const handleSelectChapter = (chapterId: string) => {
    setActiveChapterId(chapterId);
    scrollToReader();
  };

  // Pre-parse active chapter markdown content into React nodes using useMemo
  const renderedContent = useMemo(() => {
    const lines = activeChapter.content.split('\n');
    const elements: React.ReactNode[] = [];
    let keyIdx = 0;

    let inCodeBlock = false;
    let codeBuffer: string[] = [];

    let inTable = false;
    let tableHeader: string[] = [];
    let tableRows: string[][] = [];

    let paragraphBuffer: string[] = [];

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        const text = paragraphBuffer.join('\n').trim();
        if (text) {
          if (text === '---') {
            elements.push(<hr key={`hr-${keyIdx++}`} className="reader-divider" />);
          } else {
            elements.push(
              <p key={`p-${keyIdx++}`} className="reader-paragraph">
                {text}
              </p>
            );
          }
        }
        paragraphBuffer = [];
      }
    };

    const flushTable = () => {
      if (tableHeader.length > 0) {
        elements.push(
          <div key={`table-${keyIdx++}`} className="table-responsive-container">
            <table className="reader-table">
              <thead>
                <tr>
                  {tableHeader.map((cell, i) => (
                    <th key={i}>{cell.replace(/\*\*/g, '')}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rIndex) => (
                  <tr key={rIndex}>
                    {row.map((cell, cIndex) => (
                      <td key={cIndex}>{cell.replace(/\*\*/g, '')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      inTable = false;
      tableHeader = [];
      tableRows = [];
    };

    lines.forEach((line) => {
      if (line.trim().startsWith('```')) {
        flushParagraph();
        if (inTable) flushTable();
        if (inCodeBlock) {
          elements.push(
            <div key={`code-wrapper-${keyIdx++}`} className="reader-code-wrapper">
              <pre className="reader-code-block">
                <code>{codeBuffer.join('\n')}</code>
              </pre>
            </div>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      if (line.trim().startsWith('|')) {
        flushParagraph();
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.every((c) => /^[:-\s]+$/.test(c))) {
          return;
        }

        if (!inTable) {
          inTable = true;
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        flushTable();
      }

      if (line.startsWith('## ')) {
        flushParagraph();
        elements.push(
          <h2 key={`h2-${keyIdx++}`} className="reader-heading-2 serif-heading">
            {line.replace('## ', '')}
          </h2>
        );
        return;
      }

      if (line.startsWith('### ')) {
        flushParagraph();
        elements.push(
          <h3 key={`h3-${keyIdx++}`} className="reader-heading-3 serif-heading">
            {line.replace('### ', '')}
          </h3>
        );
        return;
      }

      if (line.trim() === '---') {
        flushParagraph();
        elements.push(<hr key={`hr-${keyIdx++}`} className="reader-divider" />);
        return;
      }

      if (/^[-*]\s+/.test(line.trim())) {
        flushParagraph();
        elements.push(
          <ul key={`ul-${keyIdx++}`} className="reader-list">
            <li>{line.trim().replace(/^[-*]\s+/, '')}</li>
          </ul>
        );
        return;
      }

      if (/^\d+\.\s+/.test(line.trim())) {
        flushParagraph();
        elements.push(
          <ol key={`ol-${keyIdx++}`} className="reader-ordered-list">
            <li>{line.trim().replace(/^\d+\.\s+/, '')}</li>
          </ol>
        );
        return;
      }

      if (line.trim() === '') {
        flushParagraph();
        return;
      }

      paragraphBuffer.push(line);
    });

    flushParagraph();
    if (inTable) flushTable();

    return elements;
  }, [activeChapter.id, activeChapter.content]);

  return (
    <div className="page-container page-guidebook">
      <section className="guidebook-hero">
        <BoxContainer title="SOFTWARE ENGINEERING GUIDEBOOK SERIES">
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
                📘 Vol 1: Frontend Architecture (Ch 1–9)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeVolume === 'backend'}
                className={`projects-tab-btn ${activeVolume === 'backend' ? 'active' : ''}`}
                onClick={() => handleSelectVolume('backend')}
              >
                🐍 Vol 2: FastAPI Backend Engine (Ch 1–7)
              </button>
            </div>
          </div>
        </BoxContainer>
      </section>

      {/* Guidebook Main Layout: Sidebar Navigation + Reader Area */}
      <div className="guidebook-layout">
        {/* Sidebar Table of Contents */}
        <aside className="guidebook-sidebar" aria-label="Table of Contents">
          <div className="sidebar-inner">
            <h2 className="sidebar-heading">
              &gt; {activeVolume === 'frontend' ? 'VOL 1 TABLE OF CONTENTS' : 'VOL 2 TABLE OF CONTENTS'}
            </h2>
            <nav className="chapter-nav">
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
          <BoxContainer title={`CHAPTER ${activeChapter.number} of ${currentChapters.length}`}>
            <div className="reader-header">
              <div className="chapter-meta">
                <span className="chapter-badge">
                  {activeVolume === 'frontend' ? 'Volume 1' : 'Volume 2'} — Chapter {activeChapter.number}
                </span>
              </div>
              <h2 className="reader-chapter-title serif-heading">{activeChapter.title}</h2>
            </div>

            <div className="reader-content">{renderedContent}</div>

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
          </BoxContainer>
        </main>
      </div>
    </div>
  );
};
