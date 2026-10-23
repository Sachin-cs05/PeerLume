import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AppTheme } from '@peerlume/shared';
import { apiService } from '../services/api.js';

interface ThemeContextType {
  theme: AppTheme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    try {
      return (localStorage.getItem('peerlume_theme') as AppTheme) || 'system';
    } catch {
      return 'system';
    }
  });

  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('peerlume_reduced_motion') === 'true';
    } catch {
      return false;
    }
  });

  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('dark');

  // Compute and apply dark class
  useEffect(() => {
    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        // system
        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      setEffectiveTheme(isDark ? 'dark' : 'light');
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme();
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Load preferences from backend on mount
  useEffect(() => {
    apiService.preferences.get().then((res) => {
      if (res.data) {
        if (res.data.theme) {
          setThemeState(res.data.theme);
          try {
            localStorage.setItem('peerlume_theme', res.data.theme);
          } catch {
            // Ignore storage errors in restricted contexts
          }
        }
        if (res.data.reducedMotion !== undefined) {
          setReducedMotionState(res.data.reducedMotion);
          try {
            localStorage.setItem('peerlume_reduced_motion', String(res.data.reducedMotion));
          } catch {
            // Ignore storage errors
          }
        }
      }
    }).catch(() => {
      // Ignored for unauthenticated visitors
    });
  }, []);

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('peerlume_theme', newTheme);
    } catch {
      // Ignore storage errors
    }

    // Persist to API asynchronously
    apiService.preferences.update({ theme: newTheme }).catch(() => {});
  };

  const toggleTheme = () => {
    const nextTheme: AppTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setReducedMotion = (val: boolean) => {
    setReducedMotionState(val);
    try {
      localStorage.setItem('peerlume_reduced_motion', String(val));
    } catch {
      // Ignore storage errors
    }
    apiService.preferences.update({ reducedMotion: val }).catch(() => {});
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme,
        toggleTheme,
        reducedMotion,
        setReducedMotion,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
