import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';
export type PrimaryColor = 'blue' | 'emerald' | 'violet' | 'purple' | 'amber' | 'rose' | 'cyan';
export type DarkTheme = 'midnight' | 'pure-black' | 'zinc' | 'emerald' | 'purple';
export type LightTheme = 'slate' | 'zinc' | 'cream' | 'mint' | 'lavender';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultPrimaryColor?: PrimaryColor;
  defaultDarkTheme?: DarkTheme;
  defaultLightTheme?: LightTheme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
  darkTheme: DarkTheme;
  setDarkTheme: (darkTheme: DarkTheme) => void;
  lightTheme: LightTheme;
  setLightTheme: (lightTheme: LightTheme) => void;
}

const initialState: ThemeProviderState = {
  theme: 'light',
  setTheme: () => null,
  primaryColor: 'blue',
  setPrimaryColor: () => null,
  darkTheme: 'midnight',
  setDarkTheme: () => null,
  lightTheme: 'slate',
  setLightTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  defaultPrimaryColor = 'blue',
  defaultDarkTheme = 'midnight',
  defaultLightTheme = 'slate',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [primaryColor, setPrimaryColor] = useState<PrimaryColor>(
    () => (localStorage.getItem(`${storageKey}-primary`) as PrimaryColor) || defaultPrimaryColor
  );

  const [darkTheme, setDarkTheme] = useState<DarkTheme>(
    () => (localStorage.getItem(`${storageKey}-dark-theme`) as DarkTheme) || defaultDarkTheme
  );

  const [lightTheme, setLightTheme] = useState<LightTheme>(
    () => (localStorage.getItem(`${storageKey}-light-theme`) as LightTheme) || defaultLightTheme
  );

  // Sync Light/Dark class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Sync Primary Accent Color attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-primary-color', primaryColor);
  }, [primaryColor]);

  // Sync Dark Mode Theme variant attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-dark-theme', darkTheme);
  }, [darkTheme]);

  // Sync Light Mode Theme variant attribute
  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-light-theme', lightTheme);
  }, [lightTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    primaryColor,
    setPrimaryColor: (color: PrimaryColor) => {
      localStorage.setItem(`${storageKey}-primary`, color);
      setPrimaryColor(color);
    },
    darkTheme,
    setDarkTheme: (newDarkTheme: DarkTheme) => {
      localStorage.setItem(`${storageKey}-dark-theme`, newDarkTheme);
      setDarkTheme(newDarkTheme);
    },
    lightTheme,
    setLightTheme: (newLightTheme: LightTheme) => {
      localStorage.setItem(`${storageKey}-light-theme`, newLightTheme);
      setLightTheme(newLightTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
