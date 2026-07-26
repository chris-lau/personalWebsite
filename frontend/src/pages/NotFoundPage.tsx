import React from 'react';
import { Link } from 'react-router-dom';
import { BoxContainer } from '../components/ui/BoxContainer';
import './Pages.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="page-container page-404">
      <section className="not-found-section">
        <BoxContainer title="ERROR 404">
          <div className="not-found-content">
            <pre className="ascii-404">
{`
  ___  ___  _  _   ___ 
 | _ ||   || || | | _ |
 |  _|| | || || |_|  _|
 |_|  |___||_|    |_|  
`}
            </pre>
            <p>Check the URL or navigate back to safety.</p>
            <Link to="/" className="link-button primary">Return Home &rarr;</Link>
          </div>
        </BoxContainer>
      </section>
    </div>
  );
};

