import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode } from '../types/theme';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'portfolio_theme';
const VALID_THEMES: ThemeMode[] = ['modern', 'ascii', 'cli'];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as ThemeMode;
      return VALID_THEMES.includes(savedTheme) ? savedTheme : 'modern';
    } catch {
      return 'modern';
    }
  });

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors in restricted contexts (e.g. Chrome incognito/iframe)
    }
  };

  const toggleTheme = () => {
    if (theme === 'modern') setTheme('ascii');
    else if (theme === 'ascii') setTheme('cli');
    else setTheme('modern');
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
