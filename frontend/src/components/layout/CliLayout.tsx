import React from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './CliLayout.css';

interface CliLayoutProps {
  children: React.ReactNode;
}

export const CliLayout: React.FC<CliLayoutProps> = ({ children }) => {
  const navItems = [
    { path: '/', label: 'home.sh' },
    { path: '/about', label: 'about.txt' },
    { path: '/projects', label: 'projects/' },
    { path: '/blog', label: 'blog/' },
    { path: '/experience', label: 'history.log' },
    { path: '/now', label: 'now.md' },
    { path: '/how-this-site-works', label: 'stack.md' },
    { path: '/contact', label: 'contact.sh' },
  ];


  return (
    <div className="cli-layout-container">
      <a href="#cli-main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Terminal Window Frame */}
      <div className="cli-window">
        {/* Terminal Header Bar */}
        <header className="cli-header-bar">
          <div className="cli-window-buttons" aria-hidden="true">
            <span className="cli-btn close"></span>
            <span className="cli-btn minimize"></span>
            <span className="cli-btn maximize"></span>
          </div>
          <div className="cli-title">chris@portfolio:~ (bash)</div>
          <div className="cli-toggle-container">
            <ThemeToggle />
          </div>
        </header>

        {/* Terminal Navigation Bar */}
        <nav className="cli-nav-bar" aria-label="Terminal Navigation">
          <span className="cli-prompt-symbol" aria-hidden="true">$</span>
          <ul className="cli-nav-tabs">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `cli-tab ${isActive ? 'active' : ''}`
                  }
                  end={item.path === '/'}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Terminal Output Content Area */}
        <main id="cli-main-content" className="cli-body">
          {children}
        </main>

        {/* Terminal Footer */}
        <footer className="cli-footer">
          <span className="cli-status">STATUS: OK</span>
          <span className="cli-timestamp">{new Date().toISOString().split('T')[0]}</span>
        </footer>
      </div>
    </div>
  );
};
