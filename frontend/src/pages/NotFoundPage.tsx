import React from 'react';
import { Link } from 'react-router-dom';
import { Section } from '../components/ui/Section';
import './Pages.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page-container page-404">
      <section className="not-found-section">
        <Section title="ERROR 404">
          <div className="not-found-content">
            <pre className="error-404">
{`
  ___  ___  _  _   ___ 
 | _ ||   || || | | _ |
 |  _|| | || || |_|  _|
 |_|  |___||_|    |_|  
`}
            </pre>
            <p>Check the URL or navigate back to safety.</p>
            <div className="not-found-recovery">
              <Link to="/" className="link-button primary">Return Home &rarr;</Link>
              <Link to="/projects" className="link-button">Projects</Link>
              <Link to="/blog" className="link-button">Blog</Link>
              <Link to="/experience" className="link-button">Experience</Link>
            </div>
          </div>
        </Section>
      </section>
    </div>
  );
};

