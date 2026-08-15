import * as React from 'react';

export interface UIConfig {
  locale: string;
  currency: string;
  timeZone?: string;
}

const defaultConfig: UIConfig = {
  locale: 'es-EC',
  currency: 'USD',
  timeZone: 'America/Guayaquil',
};

const UIConfigContext = React.createContext<UIConfig>(defaultConfig);

export interface UIConfigProviderProps {
  children: React.ReactNode;
  config?: Partial<UIConfig>;
}

export function UIConfigProvider({ children, config }: UIConfigProviderProps) {
  const mergedConfig = React.useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  
  return (
    <UIConfigContext.Provider value={mergedConfig}>
      {children}
    </UIConfigContext.Provider>
  );
}

export function useUIConfig() {
  return React.useContext(UIConfigContext);
}
