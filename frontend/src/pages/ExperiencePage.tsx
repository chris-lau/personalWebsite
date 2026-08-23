import React from 'react';
import { Shield, ShoppingBag } from 'lucide-react';
import { experienceData } from '../data/experience';
import { Section } from '../components/ui/Section';
import { openChat } from '../components/chat/chatControl';
import './Pages.css';

/** Domain icon per employer (surveillance/compliance vs. commerce). */
const COMPANY_ICONS: Record<string, typeof Shield> = {
  'Global Relay': Shield,
  'Elastic Path Software': ShoppingBag,
};

export const ExperiencePage: React.FC = () => {
  return (
    <div className="page-container page-experience">
      <section className="experience-history-section">
        <Section title="CAREER & EXPERIENCE" index="01">
          <div className="work-list">
            {experienceData.map((item) => {
              const CompanyIcon = COMPANY_ICONS[item.company] ?? Shield;
              return (
                <article key={item.id} className="work-row">
                  <div className="work-row__icon" aria-hidden="true">
                    <CompanyIcon size={18} strokeWidth={1.75} />
                  </div>
                  <div className="work-row__body">
                    <div className="work-row__titlerow">
                      <h3 className="work-row__title">{item.role}</h3>
                      <span className="work-row__badge">{item.company}</span>
                    </div>
                    <p className="work-row__desc">{item.description}</p>
                    <ul className="work-row__highlights">
                      {item.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="work-row__side">
                    <span className="work-row__dates">
                      {item.startDate} — {item.endDate}
                    </span>
                    <div className="work-row__actions">
                      <button
                        type="button"
                        className="link-button"
                        aria-label={`Ask this site about the ${item.role} role at ${item.company}`}
                        onClick={() => openChat({ starter: `Tell me about Chris's ${item.role} role at ${item.company}.` })}
                      >
                        Ask this site →
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </Section>
      </section>
    </div>
  );
};
