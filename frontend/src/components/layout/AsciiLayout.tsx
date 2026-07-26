import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './AsciiLayout.css';

interface AsciiLayoutProps {
  children: React.ReactNode;
}

export const AsciiLayout: React.FC<AsciiLayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/', label: 'HOME' },
    { path: '/about', label: 'ABOUT' },
    { path: '/projects', label: 'PROJECTS' },
    { path: '/blog', label: 'BLOG' },
    { path: '/experience', label: 'EXP' },
    { path: '/now', label: 'NOW' },
    { path: '/how-this-site-works', label: 'STACK' },
    { path: '/contact', label: 'CONTACT' },
  ];


  return (
    <div className="ascii-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* ASCII Top Header Banner */}
      <header className="ascii-header">
        <div className="ascii-banner" aria-hidden="true">
          +-----------------------------------------------+<br />
          |     CHRIS LAU // STAFF PRODUCT MANAGER, AI    |<br />
          +-----------------------------------------------+
        </div>
        <div className="sr-only">
          <h1>Chris Lau - Staff Product Manager, AI</h1>
        </div>

        {/* Navigation Bar */}
        <nav className="ascii-nav" aria-label="Main Navigation">
          <ul className="ascii-nav-list">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `ascii-nav-link ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                >
                  [{item.label}]
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="ascii-nav-toggle">
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="ascii-main">
        {children}
      </main>

      {/* ASCII Footer */}
      <footer className="ascii-footer">
        <div className="ascii-footer-line" aria-hidden="true">
          +-------------------------------------------------------+
        </div>
        <p className="ascii-footer-text">
          &copy; {new Date().getFullYear()} Chris Lau. Built with React &amp; TypeScript.
        </p>
      </footer>
    </div>
  );
};
