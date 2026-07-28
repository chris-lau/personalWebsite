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
              I am a Technical Product Leader specializing in AI Surveillance, Agentic Automation, Enterprise Data Acquisition, and SaaS platforms. My approach bridges deep technical engineering (UBC Computer Engineering B.A.Sc.) with strategic business execution (USC Marshall MBA).
            </p>
            <p>
              Outside of product management, I focus on system design, building scalable frontend/backend architectures, and mentoring teams on modern development practices and AI workflow integration.
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
                  {cat.skills.map((skill) => (
                    <li key={skill} className="skill-pill">
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};
