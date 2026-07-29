import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './ModernLayout.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/projects', label: 'Projects' },
  { path: '/blog', label: 'Blog' },
  { path: '/guidebook', label: 'Book' },
  { path: '/experience', label: 'Experience' },
  { path: '/now', label: 'Now' },
  { path: '/monitoring', label: 'Ops' },
  { path: '/how-this-site-works', label: 'Stack' },
  { path: '/contact', label: 'Contact' },
];

export const ModernLayout = ({ children }: ModernLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="modern-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="modern-header">
        <div className="modern-nav-wrapper">
          <NavLink to="/" className="modern-brand-logo" onClick={closeMobileMenu}>
            <span className="brand-initials">CL</span>
            <span className="brand-divider">/</span>
            <span className="brand-title">Chris Lau</span>
          </NavLink>

          <div className="modern-nav-controls">
            <ThemeToggle />
            <button
              className="modern-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          <nav className={`modern-nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="Main Navigation">
            <ul className="modern-nav-list">
              {NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `modern-nav-link ${isActive ? 'active' : ''}`
                    }
                    end={item.path === '/'}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="modern-main">
        <div className="modern-content-wrapper">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="modern-footer-card">
          <div className="modern-footer-brand">
            <span className="brand-initials">CL</span>
            <span className="brand-divider">/</span>
            <span className="brand-name">Chris Lau</span>
            <span className="brand-role">&mdash; Staff Product Manager, AI</span>
          </div>
          <p className="modern-footer-copy">
            &copy; {new Date().getFullYear()} Chris Lau. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
