import React from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AppErrorBoundary } from './ErrorBoundary';
import { UIConfigProvider } from '@mymoney/ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <UIConfigProvider config={{ locale: 'es-EC', currency: 'USD' }}>
            {children}
          </UIConfigProvider>
        </ThemeProvider>
      </QueryProvider>
    </AppErrorBoundary>
  );
}
