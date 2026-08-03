import { ReactNode, RefObject } from 'react';
import { NavLink } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS } from '../../config/navConfig';
import { useNavDropdown } from './useNavDropdown';
import './CliLayout.css';

interface CliLayoutProps {
  children: ReactNode;
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
        {/* Terminal Header Bar */}
        <header className="cli-header-bar">
          <div className="cli-window-buttons" aria-hidden="true">
            <span className="cli-btn close"></span>
            <span className="cli-btn minimize"></span>
            <span className="cli-btn maximize"></span>
          </div>
          <div className="cli-title">contact@chrislau.dev:~ (bash)</div>
          <div className="cli-toggle-container">
            <ThemeToggle />
          </div>
        </header>

        {/* Terminal Navigation Bar */}
        <nav className="cli-nav-bar" aria-label="Terminal Navigation" ref={navRef as RefObject<HTMLElement>}>
          <div className="cli-nav-header">
            <NavLink to="/" className="cli-prompt-link" onClick={closeMobileMenu}>
              <span className="cli-prompt-symbol" aria-hidden="true">$</span> home.sh
            </NavLink>
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

