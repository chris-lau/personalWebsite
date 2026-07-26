import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './ModernLayout.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export const ModernLayout: React.FC<ModernLayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/projects', label: 'Projects' },
    { path: '/blog', label: 'Blog' },
    { path: '/experience', label: 'Experience' },
    { path: '/now', label: 'Now' },
    { path: '/how-this-site-works', label: 'Stack' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <div className="modern-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="modern-header">
        <div className="modern-nav-wrapper">
          <NavLink to="/" className="modern-brand-logo">
            <span className="brand-initials">CL</span>
            <span className="brand-divider">/</span>
            <span className="brand-title">Chris Lau</span>
          </NavLink>

          <nav className="modern-nav" aria-label="Main Navigation">
            <ul className="modern-nav-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `modern-nav-link ${isActive ? 'active' : ''}`
                    }
                    end={item.path === '/'}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="modern-nav-actions">
            <ThemeToggle />
          </div>
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
        <div className="modern-footer-content">
          <div className="modern-footer-brand">
            <span>Chris Lau</span> &mdash; Software Engineer &amp; Systems Architect
          </div>
          <p className="modern-footer-copy">
            &copy; {new Date().getFullYear()} Chris Lau. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
