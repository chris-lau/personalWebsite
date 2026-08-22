import { RefObject, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Check, Clock, Copy } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { NAV_GROUPS } from '../../config/navConfig';
import { BACKEND_ROOT_URL } from '../../api/config';
import { profileData } from '../../data/profile';
import { useNavDropdown } from './useNavDropdown';
import './ModernLayout.css';

interface ModernLayoutProps {
  children: React.ReactNode;
}

const VANCOUVER_TIME = new Intl.DateTimeFormat('en-CA', {
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'America/Vancouver',
});

const useLocalClock = () => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return VANCOUVER_TIME.format(now);
};

const EmailCopyButton = ({ email }: { email: string }) => {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (permissions/insecure context) — keep address visible as mailto fallback.
    }
  };

  return (
    <button type="button" className="modern-footer-copy-email" onClick={copyEmail}>
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span aria-live="polite">{copied ? 'Copied' : email}</span>
    </button>
  );
};

export const ModernLayout = ({ children }: ModernLayoutProps) => {
  const {
    navRef,
    mobileMenuOpen,
    activeDropdown,
    toggleMobileMenu,
    closeMobileMenu,
    toggleDropdown,
    isGroupActive,
  } = useNavDropdown();
  const localTime = useLocalClock();

  return (
    <div className="modern-layout-container">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Top Navigation Bar */}
      <header className="modern-header">
        <div className="modern-nav-wrapper" ref={navRef as RefObject<HTMLDivElement>}>
          <NavLink to="/" className="modern-brand-logo" onClick={closeMobileMenu}>
            <span className="brand-initials">CL</span>
            <span className="brand-divider">/</span>
            <span className="brand-title">Chris Lau</span>
          </NavLink>

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
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="modern-main">
        <div className="modern-content-wrapper">{children}</div>
      </main>

      {/* Footer */}
      <footer className="modern-footer">
        <div className="modern-footer-card">
          <div className="modern-footer-top">
            <div className="modern-footer-brand">
              <code className="modern-footer-whoami" aria-hidden="true">$ whoami</code>
              <span className="brand-initials">CL</span>
              <span className="brand-divider">/</span>
              <span className="brand-name">Chris Lau</span>
              <span className="brand-role">&mdash; Staff Product Manager, AI</span>
            </div>
          </div>

          <nav className="modern-footer-nav" aria-label="Footer Navigation">
            <div className="modern-footer-col">
              <span className="modern-footer-heading">Core</span>
              <ul className="modern-footer-links">
                <li><NavLink to="/experience" className="modern-footer-link">Experience</NavLink></li>
                <li><NavLink to="/projects" className="modern-footer-link">Projects</NavLink></li>
                <li><NavLink to="/contact" className="modern-footer-link">Contact</NavLink></li>
              </ul>
            </div>

            <div className="modern-footer-col">
              <span className="modern-footer-heading">About</span>
              <ul className="modern-footer-links">
                <li><NavLink to="/about" className="modern-footer-link">Bio</NavLink></li>
                <li><NavLink to="/now" className="modern-footer-link">Now</NavLink></li>
                <li><NavLink to="/blog" className="modern-footer-link">Blog</NavLink></li>
                <li><NavLink to="/guidebook" className="modern-footer-link">Guidebook</NavLink></li>
              </ul>
            </div>

            <div className="modern-footer-col">
              <span className="modern-footer-heading">Lab</span>
              <ul className="modern-footer-links">
                <li><NavLink to="/how-this-site-works" className="modern-footer-link">How This Site Works</NavLink></li>
                <li><NavLink to="/monitoring" className="modern-footer-link">Ops Dashboard</NavLink></li>
                <li><NavLink to="/amazon-tools" className="modern-footer-link">Amazon Suite</NavLink></li>
              </ul>
            </div>

            <div className="modern-footer-col">
              <span className="modern-footer-heading">External</span>
              <ul className="modern-footer-links">
                <li>
                  <a
                    href="https://chris-lau-storybook.pages.dev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-footer-link"
                  >
                    Storybook
                  </a>
                </li>
                <li>
                  <a
                    href={`${BACKEND_ROOT_URL}/docs`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modern-footer-link"
                  >
                    API Docs
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <div className="modern-footer-status">
            <p className="modern-footer-copy">
              &copy; {new Date().getFullYear()} Chris Lau
            </p>
            <EmailCopyButton email={profileData.email} />
            <span className="modern-footer-clock">
              <Clock size={13} aria-hidden="true" />
              {localTime} · Vancouver
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
