import { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS, NavGroupItem } from '../../config/navConfig';
import './ModernLayout.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

export const ModernLayout = ({ children }: ModernLayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLInputElement>(null);

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

  // Close dropdown when route changes
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
    <div className="modern-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="modern-header">
        <div className="modern-nav-wrapper" ref={navRef}>
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
              {NAV_GROUPS.map((group) => {
                const active = isGroupActive(group);

                if (group.path) {
                  return (
                    <li key={group.id} className="modern-nav-item">
                      <NavLink
                        to={group.path}
                        className={({ isActive }) =>
                          `modern-nav-link ${isActive ? 'active' : ''}`
                        }
                        onClick={closeMobileMenu}
                      >
                        {group.modernLabel}
                      </NavLink>
                    </li>
                  );
                }

                const isOpen = activeDropdown === group.id;

                return (
                  <li
                    key={group.id}
                    className={`modern-nav-item has-dropdown ${isOpen ? 'dropdown-open' : ''}`}
                    onMouseEnter={() => !mobileMenuOpen && setActiveDropdown(group.id)}
                  >
                    <button
                      type="button"
                      className={`modern-nav-dropdown-toggle ${active ? 'active' : ''}`}
                      onClick={() => toggleDropdown(group.id)}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-controls={`submenu-${group.id}`}
                    >
                      <span>{group.modernLabel}</span>
                      <span className="dropdown-caret" aria-hidden="true">
                        {isOpen ? '▴' : '▾'}
                      </span>
                    </button>

                    <ul
                      id={`submenu-${group.id}`}
                      className={`modern-dropdown-menu ${isOpen ? 'show' : ''}`}
                      role="menu"
                    >
                      {group.children?.map((child) => (
                        <li key={child.path} role="none">
                          <NavLink
                            to={child.path}
                            className={({ isActive }) =>
                              `modern-dropdown-item ${isActive ? 'active' : ''}`
                            }
                            role="menuitem"
                            onClick={closeMobileMenu}
                          >
                            {child.modernLabel}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="modern-main">
        <div className="modern-content-wrapper">{children}</div>
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

