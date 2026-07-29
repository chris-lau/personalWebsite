import { useState, useRef, useEffect, ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS, NavGroupItem } from '../../config/navConfig';
import './AsciiLayout.css';

interface AsciiLayoutProps {
  children: ReactNode;
}

export const AsciiLayout = ({ children }: AsciiLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const toggleDropdown = (groupId: string) => {
    setActiveDropdown((prev) => (prev === groupId ? null : groupId));
  };

  // Close dropdown on click outside or Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  const isGroupActive = (group: NavGroupItem) => {
    if (group.path) {
      return location.pathname === group.path;
    }
    return group.children?.some((child) => location.pathname === child.path);
  };

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
        <nav className="ascii-nav" aria-label="Main Navigation" ref={navRef}>
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
                  onMouseEnter={() => !mobileMenuOpen && setActiveDropdown(group.id)}
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
        <p className="ascii-footer-text">
          &copy; {new Date().getFullYear()} Chris Lau. Built with React &amp; TypeScript.
        </p>
      </footer>
    </div>
  );
};

