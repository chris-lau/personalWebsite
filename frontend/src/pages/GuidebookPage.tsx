import React, { useState } from 'react';
import { guidebookChapters } from '../data/guidebookData';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';
import './GuidebookPage.css';

export const GuidebookPage: React.FC = () => {
  const [activeChapterId, setActiveChapterId] = useState<string>('chapter-1');

  const activeChapter =
    guidebookChapters.find((ch) => ch.id === activeChapterId) || guidebookChapters[0];

  const activeIndex = guidebookChapters.findIndex((ch) => ch.id === activeChapter.id);
  const prevChapter = activeIndex > 0 ? guidebookChapters[activeIndex - 1] : null;
  const nextChapter =
    activeIndex < guidebookChapters.length - 1 ? guidebookChapters[activeIndex + 1] : null;

  return (
    <div className="page-container page-guidebook">
      <section className="guidebook-hero">
        <BoxContainer title="FRONTEND DEVELOPMENT GUIDEBOOK">
          <div className="hero-content">
            <h1 className="hero-title serif-heading">Building Modern Web Applications</h1>
            <p className="hero-subtitle">
              A Step-by-Step Architecture Guide for Frontend Beginners, TPMs & Engineers
            </p>
            <p className="hero-bio">
              Written by <strong>Chris Lau</strong> — Staff Product Manager, AI & Enterprise Systems. 
              This interactive guidebook breaks down the end-to-end architecture, technical decisions, 
              design tokens, data contracts, testing strategy, and Cloudflare Pages deployment behind modern web apps.
            </p>
          </div>
        </BoxContainer>
      </section>

      {/* Guidebook Main Layout: Sidebar Navigation + Reader Area */}
      <div className="guidebook-layout">
        {/* Sidebar Table of Contents */}
        <aside className="guidebook-sidebar" aria-label="Table of Contents">
          <div className="sidebar-inner">
            <h2 className="sidebar-heading">&gt; TABLE OF CONTENTS</h2>
            <nav className="chapter-nav">
              <ul className="chapter-list">
                {guidebookChapters.map((ch) => (
                  <li key={ch.id} className="chapter-item">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveChapterId(ch.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
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
        <main className="guidebook-reader">
          <BoxContainer title={`CHAPTER ${activeChapter.number} of ${guidebookChapters.length}`}>
            <div className="reader-header">
              <div className="chapter-meta">
                <span className="chapter-badge">Chapter {activeChapter.number}</span>
              </div>
              <h2 className="reader-chapter-title serif-heading">{activeChapter.title}</h2>
            </div>

            <div className="reader-content">
              {activeChapter.content.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('## ')) {
                  return (
                    <h2 key={index} className="reader-heading-2 serif-heading">
                      {paragraph.replace('## ', '')}
                    </h2>
                  );
                }
                if (paragraph.startsWith('### ')) {
                  return (
                    <h3 key={index} className="reader-heading-3 serif-heading">
                      {paragraph.replace('### ', '')}
                    </h3>
                  );
                }
                if (paragraph.startsWith('```')) {
                  const lines = paragraph.split('\n');
                  const lang = lines[0].replace('```', '');
                  const code = lines.slice(1, -1).join('\n');
                  return (
                    <div key={index} className="reader-code-wrapper">
                      {lang && <div className="code-lang-tag">{lang}</div>}
                      <pre className="reader-code-block">
                        <code>{code}</code>
                      </pre>
                    </div>
                  );
                }
                if (paragraph.startsWith('|')) {
                  const rows = paragraph.split('\n');
                  return (
                    <div key={index} className="table-responsive-container">
                      <table className="reader-table">
                        <tbody>
                          {rows.map((row, rIdx) => {
                            const cells = row
                              .split('|')
                              .filter((c) => c.trim() !== '')
                              .map((c) => c.trim());
                            if (row.includes(':---') || row.includes('---')) return null;
                            const isHeader = rIdx === 0;
                            return (
                              <tr key={rIdx}>
                                {cells.map((cell, cIdx) =>
                                  isHeader ? (
                                    <th key={cIdx}>{cell.replace(/\*\*/g, '')}</th>
                                  ) : (
                                    <td key={cIdx}>{cell.replace(/\*\*/g, '')}</td>
                                  )
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                }
                if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ul key={index} className="reader-list">
                      {items.map((item, iIdx) => (
                        <li key={iIdx}>{item.replace(/^[-*]\s+/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                if (paragraph.startsWith('1. ') || paragraph.startsWith('2. ')) {
                  const items = paragraph.split('\n');
                  return (
                    <ol key={index} className="reader-ordered-list">
                      {items.map((item, iIdx) => (
                        <li key={iIdx}>{item.replace(/^\d+\.\s+/, '')}</li>
                      ))}
                    </ol>
                  );
                }
                return (
                  <p key={index} className="reader-paragraph">
                    {paragraph}
                  </p>
                );
              })}
            </div>

            {/* Chapter Pagination Navigation */}
            <nav className="chapter-pagination" aria-label="Chapter Pagination">
              {prevChapter ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveChapterId(prevChapter.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
                  onClick={() => {
                    setActiveChapterId(nextChapter.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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
