import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { NavGroupItem } from '../../config/navConfig';

/**
 * Shared navigation dropdown state and behavior for layout components.
 *
 * Extracts the duplicated logic (mobile menu toggle, dropdown open/close,
 * Escape-key + click-outside dismissal, route-change close, active-group
 * detection) that was previously triplicated across ModernLayout, AsciiLayout,
 * and CliLayout.
 */
export function useNavDropdown() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const location = useLocation();
  // Generic ref — works for <div>, <nav>, or any HTMLElement the layout assigns it to.
  const navRef = useRef<HTMLElement | null>(null);

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

  return {
    navRef,
    mobileMenuOpen,
    activeDropdown,
    toggleMobileMenu,
    closeMobileMenu,
    toggleDropdown,
    setActiveDropdown,
    isGroupActive,
  };
}
