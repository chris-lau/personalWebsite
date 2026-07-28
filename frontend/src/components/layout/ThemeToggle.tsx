import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types/theme';
import './ThemeToggle.css';

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const options: { id: ThemeMode; label: string }[] = [
    { id: 'modern', label: 'MODERN' },
    { id: 'ascii', label: 'ASCII' },
    { id: 'cli', label: 'CLI' },
  ];

  return (
    <div
      className="theme-segmented-toggle"
      role="radiogroup"
      aria-label="Theme Mode Selection"
    >
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => setTheme(option.id)}
          className={`theme-segment-btn ${theme === option.id ? 'active' : ''}`}
          role="radio"
          aria-checked={theme === option.id ? 'true' : 'false'}
          aria-label={`Set theme to ${option.label}`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

