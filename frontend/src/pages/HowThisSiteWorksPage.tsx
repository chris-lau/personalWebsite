import React from 'react';
import { siteArchitectureData } from '../data/siteArchitecture';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const HowThisSiteWorksPage: React.FC = () => {
  return (
    <div className="page-container page-how-it-works">
      <section>
        <BoxContainer title="HOW THIS SITE WORKS">
          <p className="intro-text">
            This portfolio is built as a lightweight, stateful, single-page application showcasing modern frontend architectural principles, strict typing, dynamic theming, and multi-tier testing strategies.
          </p>

          <div className="stack-sections">
            {siteArchitectureData.map((sec) => (
              <div key={sec.category} className="stack-group">
                <h3 className="stack-group-title">&gt; {sec.category}</h3>
                <div className="stack-list">
                  {sec.items.map((item) => (
                    <div key={item.name} className="stack-item">
                      <h4 className="stack-item-name">* {item.name}</h4>
                      <p className="stack-item-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};

