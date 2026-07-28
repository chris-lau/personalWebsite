import { profileData } from '../data/profile';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const ContactPage = () => {
  return (
    <div className="page-container page-contact">
      <section>
        <BoxContainer title="GET IN TOUCH">
          <div className="contact-methods">
            <p className="contact-intro">
              Whether you want to discuss AI product leadership, enterprise automation, potential collaborations, or tech opportunities, feel free to reach out directly.
            </p>

            <div className="contact-action-box">
              <a 
                href="mailto:contact@chrislau.dev" 
                className="link-button primary contact-email-btn"
              >
                ✉ Send an Email (contact@chrislau.dev)
              </a>
            </div>

            <div className="contact-links">
              <div className="contact-row">
                <span className="platform-name">Email:</span>
                <a href="mailto:contact@chrislau.dev" className="link-button">
                  contact@chrislau.dev
                </a>
              </div>
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

