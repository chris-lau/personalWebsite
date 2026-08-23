import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeMode } from '../types/theme';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'portfolio_theme';
const VALID_THEMES: ThemeMode[] = ['light', 'dark'];
/** Legacy layout-theme values from before the Light Crisp consolidation. */
const LEGACY_THEMES = ['modern', 'ascii', 'cli'];

const readInitialTheme = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && VALID_THEMES.includes(saved as ThemeMode)) return saved as ThemeMode;
    if (saved && LEGACY_THEMES.includes(saved)) return 'light';
  } catch {
    // Ignore storage errors in restricted contexts (e.g. Chrome incognito/iframe)
  }
  return 'light';
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(readInitialTheme);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors in restricted contexts
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
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
