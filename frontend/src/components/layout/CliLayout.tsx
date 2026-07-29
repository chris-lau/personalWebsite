import { useState, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import './CliLayout.css';

interface CliLayoutProps {
  children: ReactNode;
}

const NAV_ITEMS = [
  { path: '/', label: 'home.sh' },
  { path: '/about', label: 'about.txt' },
  { path: '/projects', label: 'projects/' },
  { path: '/blog', label: 'blog/' },
  { path: '/guidebook', label: 'book.md' },
  { path: '/experience', label: 'history.log' },
  { path: '/now', label: 'now.md' },
  { path: '/monitoring', label: 'top.sh' },
  { path: '/how-this-site-works', label: 'stack.md' },
  { path: '/contact', label: 'contact.sh' },
];

export const CliLayout = ({ children }: CliLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="cli-layout-container">
      <a href="#main-content" className="skip-to-content">
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
          <div className="cli-nav-header">
            <span className="cli-prompt-symbol" aria-hidden="true">$</span>
            <button
              className="cli-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle terminal navigation menu"
            >
              [{mobileMenuOpen ? 'exit' : 'menu'}]
            </button>
          </div>
          <ul className={`cli-nav-tabs ${mobileMenuOpen ? 'open' : ''}`}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `cli-tab ${isActive ? 'active' : ''}`
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

        {/* Main Terminal Output Content Area */}
        <main id="main-content" className="cli-body">
          {children}
        </main>

        {/* Terminal Footer */}
        <footer className="cli-footer">
          <span className="cli-status-badge">
            <span className="cli-status-dot" aria-hidden="true"></span>
            <span>STATUS: OK</span>
          </span>
          <span className="cli-timestamp">{new Date().toISOString().split('T')[0]}</span>
        </footer>
      </div>
    </div>
  );
};
