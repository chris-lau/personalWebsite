import { RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS } from '../../config/navConfig';
import { BACKEND_ROOT_URL } from '../../api/config';
import { useNavDropdown } from './useNavDropdown';
import './CliLayout.css';

interface CliLayoutProps {
  children: React.ReactNode;
}

export const CliLayout = ({ children }: CliLayoutProps) => {
  const {
    navRef,
    mobileMenuOpen,
    activeDropdown,
    toggleMobileMenu,
    closeMobileMenu,
    toggleDropdown,
    isGroupActive,
  } = useNavDropdown();

  return (
    <div className="cli-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Terminal Window Frame */}
      <div className="cli-window">
        {/* Title Bar with Window Controls */}
        <header className="cli-header-bar">
          <div className="cli-controls" aria-hidden="true">
            <span className="cli-btn close"></span>
            <span className="cli-btn minimize"></span>
            <span className="cli-btn maximize"></span>
          </div>
          <div className="cli-title">chrislau@personal-os: ~</div>
          <div className="cli-actions">
            <ThemeToggle />
          </div>
        </header>

        {/* Command / Tab Navigation Bar */}
        <nav className="cli-nav-bar" aria-label="Terminal Navigation" ref={navRef as RefObject<HTMLElement>}>
          <div className="cli-nav-header">
            <span className="cli-prompt-label">EXEC:</span>
            <button
              className="cli-mobile-menu-toggle"
              onClick={toggleMobileMenu}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              [{mobileMenuOpen ? 'CLOSE' : 'MENU'}]
            </button>
          </div>

          <ul className={`cli-nav-tabs ${mobileMenuOpen ? 'open' : ''}`}>
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group);

              if (group.path) {
                return (
                  <li key={group.id} className="cli-tab-item">
                    <NavLink
                      to={group.path}
                      className={({ isActive }) =>
                        `cli-tab ${isActive ? 'active' : ''}`
                      }
                      onClick={closeMobileMenu}
                    >
                      {group.cliLabel}
                    </NavLink>
                  </li>
                );
              }

              const isOpen = activeDropdown === group.id;

              return (
                <li
                  key={group.id}
                  className={`cli-tab-item has-dropdown ${isOpen ? 'dropdown-open' : ''}`}
                >
                  <button
                    type="button"
                    className={`cli-tab cli-dropdown-toggle ${active ? 'active' : ''}`}
                    onClick={() => toggleDropdown(group.id)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`cli-submenu-${group.id}`}
                  >
                    <span>{group.cliLabel}</span>
                    <span className="cli-caret" aria-hidden="true">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  <ul
                    id={`cli-submenu-${group.id}`}
                    className={`cli-dropdown-menu ${isOpen ? 'show' : ''}`}
                    role="menu"
                  >
                    {group.children?.map((child) => (
                      <li key={child.path} role="none">
                        <NavLink
                          to={child.path}
                          className={({ isActive }) =>
                            `cli-dropdown-item ${isActive ? 'active' : ''}`
                          }
                          role="menuitem"
                          onClick={closeMobileMenu}
                        >
                          <span className="cli-sub-prefix">&gt;</span> {child.cliLabel}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Terminal Output Content Area */}
        <main id="main-content" className="cli-body">
          {children}
        </main>

        {/* Terminal Footer */}
        <footer className="cli-footer">
          <nav className="cli-footer-nav" aria-label="Footer Navigation">
            <div className="cli-footer-group">
              <span className="cli-footer-heading">CORE:</span>
              <NavLink to="/experience" className="cli-footer-link">Experience</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/projects" className="cli-footer-link">Projects</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/contact" className="cli-footer-link">Contact</NavLink>
            </div>
            <div className="cli-footer-group">
              <span className="cli-footer-heading">ABOUT:</span>
              <NavLink to="/about" className="cli-footer-link">Bio</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/now" className="cli-footer-link">Now</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/blog" className="cli-footer-link">Blog</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/guidebook" className="cli-footer-link">Guidebook</NavLink>
            </div>
            <div className="cli-footer-group">
              <span className="cli-footer-heading">LAB:</span>
              <NavLink to="/how-this-site-works" className="cli-footer-link">How This Site Works</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/monitoring" className="cli-footer-link">Ops Dashboard</NavLink>
              <span className="cli-footer-dot">·</span>
              <NavLink to="/amazon-tools" className="cli-footer-link">Amazon Suite</NavLink>
            </div>
            <div className="cli-footer-group">
              <span className="cli-footer-heading">EXT:</span>
              <a href="https://chris-lau-storybook.pages.dev" target="_blank" rel="noopener noreferrer" className="cli-footer-link">Storybook</a>
              <span className="cli-footer-dot">·</span>
              <a href={`${BACKEND_ROOT_URL}/docs`} target="_blank" rel="noopener noreferrer" className="cli-footer-link">API Docs</a>
            </div>
          </nav>
          <div className="cli-footer-meta">
            <span className="cli-status-badge">
              <span className="cli-status-dot" aria-hidden="true"></span>
              <span>STATUS: OK</span>
            </span>
            <span className="cli-timestamp">{new Date().toISOString().split('T')[0]}</span>
          </div>
        </footer>
      </div>
    </div>
  );
};
