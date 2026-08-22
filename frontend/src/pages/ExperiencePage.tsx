import React from 'react';
import { experienceData } from '../data/experience';
import { BoxContainer } from '../components/ui/BoxContainer';
import { openChat } from '../components/chat/chatControl';
import './Pages.css';

export const ExperiencePage: React.FC = () => {
  return (
    <div className="page-container page-experience">
      <section className="experience-history-section">
        <BoxContainer title="CAREER & EXPERIENCE">
          <div className="experience-list">
            {experienceData.map((item) => (
              <div key={item.id} className="experience-item">
                <div className="item-header">
                  <h3 className="item-role">{item.role}</h3>
                  <span className="item-company">@ {item.company}</span>
                  <span className="item-dates">
                    ({item.startDate} - {item.endDate})
                  </span>
                </div>
                <ul className="item-highlights">
                  {item.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="link-button"
                  aria-label={`Ask about this role: ${item.role} @ ${item.company}`}
                  onClick={() => openChat({ starter: `Tell me about Chris's ${item.role} role at ${item.company}.` })}
                >
                  Ask about this →
                </button>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
