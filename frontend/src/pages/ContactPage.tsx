import React from 'react';
import { profileData } from '../data/profile';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const ContactPage: React.FC = () => {
  return (
    <div className="page-container page-contact">
      <section>
        <BoxContainer title="GET IN TOUCH">
          <div className="contact-methods">
            <p>I am always open to discussing new opportunities, side projects, or technological ideas.</p>

            <div className="contact-links">
              {profileData.socials.map((s) => (
                <div key={s.platform} className="contact-row">
                  <span className="platform-name">{s.platform}:</span>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="link-button">
                    {s.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};

