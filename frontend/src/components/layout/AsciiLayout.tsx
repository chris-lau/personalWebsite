import { ReactNode, RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS } from '../../config/navConfig';
import { BACKEND_ROOT_URL } from '../../api/config';
import { useNavDropdown } from './useNavDropdown';
import './AsciiLayout.css';

interface AsciiLayoutProps {
  children: ReactNode;
}

export const AsciiLayout = ({ children }: AsciiLayoutProps) => {
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
    <div className="ascii-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* ASCII Top Header Banner */}
      <header className="ascii-header">
        <div className="ascii-banner">
          <span className="ascii-prompt">&gt;</span>
          <NavLink to="/" className="ascii-brand-link" onClick={closeMobileMenu}>
            <span className="ascii-name">CHRIS LAU</span>
          </NavLink>
          <span className="ascii-separator">//</span>
          <span className="ascii-title">STAFF PRODUCT MANAGER, AI</span>
        </div>
        <div className="sr-only">
          <h1>Chris Lau - Staff Product Manager, AI</h1>
        </div>

        {/* Navigation Bar */}
        <nav className="ascii-nav" aria-label="Main Navigation" ref={navRef as RefObject<HTMLElement>}>
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
            {NAV_GROUPS.map((group) => {
              const active = isGroupActive(group);

              if (group.path) {
                return (
                  <li key={group.id} className="ascii-nav-item">
                    <NavLink
                      to={group.path}
                      className={({ isActive }) =>
                        `ascii-nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={closeMobileMenu}
                    >
                      [{group.asciiLabel}]
                    </NavLink>
                  </li>
                );
              }

              const isOpen = activeDropdown === group.id;

              return (
                <li
                  key={group.id}
                  className={`ascii-nav-item has-dropdown ${isOpen ? 'dropdown-open' : ''}`}
                >
                  <button
                    type="button"
                    className={`ascii-nav-link ascii-dropdown-toggle ${active ? 'active' : ''}`}
                    onClick={() => toggleDropdown(group.id)}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    aria-controls={`ascii-submenu-${group.id}`}
                  >
                    <span>[{group.asciiLabel}]</span>
                    <span className="ascii-caret" aria-hidden="true">
                      {isOpen ? '▴' : '▾'}
                    </span>
                  </button>

                  <div
                    id={`ascii-submenu-${group.id}`}
                    className={`ascii-dropdown-menu ${isOpen ? 'show' : ''}`}
                    role="menu"
                  >
                    <div className="ascii-border-top" aria-hidden="true">
                      +-- {group.asciiLabel} --+
                    </div>
                    <ul className="ascii-submenu-list">
                      {group.children?.map((child) => (
                        <li key={child.path} role="none">
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `ascii-dropdown-item ${isActive ? 'active' : ''}`
                            }
                            role="menuitem"
                            onClick={closeMobileMenu}
                          >
                            <span className="ascii-item-bracket">[</span>
                            {child.asciiLabel}
                            <span className="ascii-item-bracket">]</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                    <div className="ascii-border-bottom" aria-hidden="true">
                      +----------------+
                    </div>
                  </div>
                </li>
              );
            })}
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
        <nav className="ascii-footer-nav" aria-label="Footer Navigation">
          <div className="ascii-footer-section">
            <span className="ascii-footer-heading">[CORE]</span>
            <NavLink to="/experience" className="ascii-footer-link">[Experience]</NavLink>
            <NavLink to="/projects" className="ascii-footer-link">[Projects]</NavLink>
            <NavLink to="/contact" className="ascii-footer-link">[Contact]</NavLink>
          </div>
          <div className="ascii-footer-section">
            <span className="ascii-footer-heading">[ABOUT]</span>
            <NavLink to="/about" className="ascii-footer-link">[Bio]</NavLink>
            <NavLink to="/now" className="ascii-footer-link">[Now]</NavLink>
            <NavLink to="/blog" className="ascii-footer-link">[Blog]</NavLink>
            <NavLink to="/guidebook" className="ascii-footer-link">[Guidebook]</NavLink>
          </div>
          <div className="ascii-footer-section">
            <span className="ascii-footer-heading">[LAB]</span>
            <NavLink to="/how-this-site-works" className="ascii-footer-link">[How This Site Works]</NavLink>
            <NavLink to="/monitoring" className="ascii-footer-link">[Ops Dashboard]</NavLink>
            <NavLink to="/amazon-tools" className="ascii-footer-link">[Amazon Suite]</NavLink>
          </div>
          <div className="ascii-footer-section">
            <span className="ascii-footer-heading">[EXT]</span>
            <a href="https://chris-lau-storybook.pages.dev" target="_blank" rel="noopener noreferrer" className="ascii-footer-link">[Storybook]</a>
            <a href={`${BACKEND_ROOT_URL}/docs`} target="_blank" rel="noopener noreferrer" className="ascii-footer-link">[API Docs]</a>
          </div>
        </nav>
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
