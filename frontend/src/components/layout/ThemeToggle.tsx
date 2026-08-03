import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, Type, Terminal, Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types/theme';
import './ThemeToggle.css';

interface ThemeOption {
  id: ThemeMode;
  label: string;
  Icon: typeof LayoutGrid;
}

const THEME_OPTIONS: ThemeOption[] = [
  { id: 'modern', label: 'Modern', Icon: LayoutGrid },
  { id: 'ascii', label: 'ASCII', Icon: Type },
  { id: 'cli', label: 'CLI', Icon: Terminal },
];

/**
 * Compact theme switcher: a single icon button showing the current theme that
 * opens a dropdown menu listing all three themes. Replaces the previous
 * 3-button segmented control (~150px) with a ~36px resting footprint while
 * preserving direct, one-click access to any theme.
 */
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside or Escape.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const current = THEME_OPTIONS.find((opt) => opt.id === theme) ?? THEME_OPTIONS[0];
  const CurrentIcon = current.Icon;

  const handleSelect = (id: ThemeMode) => {
    setTheme(id);
    setIsOpen(false);
  };

  return (
    <div className="theme-toggle" ref={containerRef}>
      <button
        type="button"
        className="theme-toggle-button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Theme: ${current.label} — select theme`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        title={`Theme: ${current.label}`}
      >
        <CurrentIcon size={16} aria-hidden="true" />
      </button>

      {isOpen && (
        <ul className="theme-toggle-menu" role="menu" aria-label="Select theme">
          {THEME_OPTIONS.map(({ id, label, Icon }) => {
            const isActive = id === theme;
            return (
              <li key={id} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  className={`theme-toggle-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelect(id)}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span className="theme-toggle-item-label">{label}</span>
                  {isActive && <Check size={14} className="theme-toggle-check" aria-hidden="true" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
