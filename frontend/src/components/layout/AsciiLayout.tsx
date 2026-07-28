import { useState, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './AsciiLayout.css';

interface AsciiLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/', label: 'HOME' },
  { path: '/about', label: 'ABOUT' },
  { path: '/projects', label: 'PROJECTS' },
  { path: '/blog', label: 'BLOG' },
  { path: '/guidebook', label: 'BOOK' },
  { path: '/experience', label: 'EXP' },
  { path: '/now', label: 'NOW' },
  { path: '/how-this-site-works', label: 'STACK' },
  { path: '/contact', label: 'CONTACT' },
];

export const AsciiLayout = ({ children }: AsciiLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="ascii-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* ASCII Top Header Banner */}
      <header className="ascii-header">
        <div className="ascii-banner" aria-hidden="true">
          <span className="ascii-prompt">&gt;</span>
          <span className="ascii-name">CHRIS LAU</span>
          <span className="ascii-separator">//</span>
          <span className="ascii-title">STAFF PRODUCT MANAGER, AI</span>
        </div>
        <div className="sr-only">
          <h1>Chris Lau - Staff Product Manager, AI</h1>
        </div>

        {/* Navigation Bar */}
        <nav className="ascii-nav" aria-label="Main Navigation">
          <div className="ascii-nav-controls">
            <button
              className="ascii-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              [{mobileMenuOpen ? 'X' : 'MENU'}]
            </button>
            <div className="ascii-nav-toggle">
              <ThemeToggle />
            </div>
          </div>

          <ul className={`ascii-nav-list ${mobileMenuOpen ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `ascii-nav-link ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                  onClick={closeMobileMenu}
                >
                  [{item.label}]
                </NavLink>
              </li>
            ))}
          </ul>
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
