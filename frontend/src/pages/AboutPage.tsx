import React from 'react';
import { profileData } from '../data/profile';
import { skillsData } from '../data/skills';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="page-container page-about">
      <section className="about-bio-section">
        <BoxContainer title="ABOUT ME">
          <div className="about-bio">
            <p>
              I&apos;m a Technical Product Leader who moved from hands-on engineering into enterprise SaaS product management, and now lead AI Surveillance and Agentic Automation initiatives at Global Relay. That path — engineering (UBC B.A.Sc.), then business (USC Marshall MBA), then AI product leadership — shapes how I work: I want to understand a system deeply enough to build it before owning its roadmap. That&apos;s part of why I built this site&apos;s frontend myself (see /how-this-site-works) rather than delegating it.
            </p>
            <p>
              Certified Scrum Product Owner (CSPO) &amp; Professional Engineer (P.Eng., Non-Practising).
            </p>
            <p className="location-info">Location: {profileData.location}</p>
          </div>
        </BoxContainer>
      </section>

      <section className="skills-matrix-section">
        <BoxContainer title="SKILL MATRIX">
          <div className="skills-matrix">
            {skillsData.map((cat) => (
              <div key={cat.category} className="matrix-category">
                <h3 className="category-title">{cat.category}</h3>
                <ul className="skill-tags">
                  {(cat.detailedSkills || cat.skills.map(s => ({ name: s, level: 'core' as const }))).map((skillItem) => {
                    const name = typeof skillItem === 'string' ? skillItem : skillItem.name;
                    const level = typeof skillItem === 'string' ? 'core' : (skillItem.level || 'core');
                    return (
                      <li
                        key={name}
                        className={`skill-pill ${level === 'core' ? 'skill-pill-core' : 'skill-pill-proficient'}`}
                      >
                        {level === 'core' && <span className="skill-badge-star" title="Core Expertise">★ </span>}
                        <span>{name}</span>
                        <span className="skill-tier-badge">{level === 'core' ? 'Core' : 'Proficient'}</span>
                      </li>
                    );
                  })}
                </ul>

              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
