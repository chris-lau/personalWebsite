import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const nextTheme = theme === 'modern' ? 'ascii' : theme === 'ascii' ? 'cli' : 'modern';

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label={`Switch to ${nextTheme.toUpperCase()} theme`}
      aria-pressed={theme !== 'ascii'}
      type="button"
    >
      <span aria-hidden="true">[ MODE: {theme.toUpperCase()} ]</span>
      <span className="sr-only">Current theme is {theme}. Click to switch to {nextTheme}.</span>
    </button>
  );
};
