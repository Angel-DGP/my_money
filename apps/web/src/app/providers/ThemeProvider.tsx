import React, { useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
}: ThemeProviderProps) {
  const [theme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Context is omitted here because ThemeProvider shouldn't leak UI knowledge.
  // It only sets the HTML class and stores preference.
  // We can add a simple ThemeContext if needed later, but as requested: 
  // "El ThemeProvider no debe conocer componentes UI. Solo administra tema, persistencia, clase del html"
  // For other components to change the theme, they can use a small Zustand store or Context, 
  // but for Phase 1.5, we just need the structural provider.

  return <>{children}</>;
}
