import React from 'react';
import { BookOpen } from 'lucide-react';
import { nowData } from '../data/now';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const NowPage: React.FC = () => {
  return (
    <div className="page-container page-now">
      <section>
        <BoxContainer title="WHAT I'M DOING NOW">
          <p className="last-updated">Last Updated: {nowData.lastUpdated}</p>

          <div className="now-block">
            <h3>&gt; CURRENT FOCUS</h3>
            <p>{nowData.currentFocus}</p>
          </div>

          <div className="now-block">
            <h3>&gt; WORKING ON</h3>
            <ul>
              {nowData.workingOn.map((item, i) => (
                <li key={i}>* {item}</li>
              ))}
            </ul>
          </div>

          {nowData.reading.length > 0 && (
            <div className="now-block">
              <h3>&gt; CURRENTLY READING</h3>
              <ul>
                {nowData.reading.map((book, i) => (
                  <li key={i} className="inline-icon-label">
                    <BookOpen size={14} aria-hidden="true" className="inline-icon" style={{ color: 'var(--accent-primary)' }} />
                    <span>{book}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="now-block">
            <h3>&gt; LEARNING</h3>
            <ul>
              {nowData.learning.map((topic, i) => (
                <li key={i}>* {topic}</li>
              ))}
            </ul>
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};

