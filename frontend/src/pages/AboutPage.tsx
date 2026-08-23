import React from 'react';
import { profileData } from '../data/profile';
import { skillsData } from '../data/skills';
import { Section } from '../components/ui/Section';
import './Pages.css';

export const AboutPage: React.FC = () => {
  return (
    <div className="page-container page-about">
      <section className="about-bio-section">
        <Section title="ABOUT ME" index="01">
          <div className="about-bio">
            <p>
              I&apos;m a Technical Product Leader who moved from hands-on engineering into enterprise SaaS product management, and now lead AI Surveillance and Agentic Automation initiatives at Global Relay. That path — engineering (UBC B.A.Sc.), then business (USC Marshall MBA), then AI product leadership — shapes how I work: I want to understand a system deeply enough to build it before owning its roadmap. That&apos;s part of why I built this site&apos;s frontend myself (see /how-this-site-works) rather than delegating it.
            </p>
            <p>
              Certified Scrum Product Owner (CSPO) &amp; Professional Engineer (P.Eng., Non-Practising).
            </p>
            <p className="location-info">Location: {profileData.location}</p>
          </div>
        </Section>
      </section>

      <section className="skills-matrix-section">
        <Section title="SKILL MATRIX" index="02" tint>
          <div className="skills-matrix">
            {skillsData.map((cat) => (
              <div key={cat.category} className="matrix-category">
                <h3 className="category-title">{cat.category}</h3>
                <ul className="skill-tags">
                  {(cat.detailedSkills || cat.skills.map(s => ({ name: s }))).map((skillItem) => {
                    const name = typeof skillItem === 'string' ? skillItem : skillItem.name;
                    return (
                      <li key={name} className="skill-pill">
                        <span>{name}</span>
                      </li>
                    );
                  })}
                </ul>

              </div>
            ))}
          </div>
        </Section>
      </section>
    </div>
  );
};
