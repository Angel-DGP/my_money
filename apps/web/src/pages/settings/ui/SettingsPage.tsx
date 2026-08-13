import { useState } from 'react';
import { PageContainer, Icon, Button, cn } from '@mymoney/ui';
import { useTheme, type PrimaryColor, type DarkTheme, type LightTheme } from '@app/providers/ThemeProvider';
import { useSessionStore } from '@entities/session';

const THEME_OPTIONS = [
  {
    id: 'light' as const,
    label: 'Claro',
    icon: 'sun' as const,
    description: 'Interfaz luminosa para ambientes con buena iluminación',
  },
  {
    id: 'dark' as const,
    label: 'Oscuro',
    icon: 'moon' as const,
    description: 'Reduce el cansancio visual en ambientes con poca luz',
  },
];

const PRIMARY_COLORS: {
  id: PrimaryColor;
  label: string;
  hex: string;
  description: string;
}[] = [
  {
    id: 'blue',
    label: 'Azul Clásico',
    hex: '#3b82f6',
    description: 'Profesional y confiable',
  },
  {
    id: 'emerald',
    label: 'Verde Esmeralda',
    hex: '#10b981',
    description: 'Financiero, crecimiento y ahorro',
  },
  {
    id: 'violet',
    label: 'Violeta / Índigo',
    hex: '#6366f1',
    description: 'Moderno, tech y sofisticado',
  },
  {
    id: 'purple',
    label: 'Púrpura Real',
    hex: '#a855f7',
    description: 'Creativo y premium',
  },
  {
    id: 'amber',
    label: 'Ámbar Cálido',
    hex: '#f59e0b',
    description: 'Energético y distintivo',
  },
  {
    id: 'rose',
    label: 'Rosa Fucsia',
    hex: '#f43f5e',
    description: 'Vanguardista y audaz',
  },
  {
    id: 'cyan',
    label: 'Cian Eléctrico',
    hex: '#06b6d4',
    description: 'Fresco e innovador',
  },
];

const LIGHT_THEME_OPTIONS: {
  id: LightTheme;
  label: string;
  bgHex: string;
  surfaceHex: string;
  description: string;
}[] = [
  {
    id: 'slate',
    label: 'Gris Azulado (Slate)',
    bgHex: '#f8fafc',
    surfaceHex: '#ffffff',
    description: 'Blanco frío y balanceado (Predeterminado)',
  },
  {
    id: 'zinc',
    label: 'Blanco Puro (Zinc)',
    bgHex: '#fafafa',
    surfaceHex: '#ffffff',
    description: 'Gris neutro limpio estilo minimalista',
  },
  {
    id: 'cream',
    label: 'Arena Cálida (Latte / Paper)',
    bgHex: '#faf7f2',
    surfaceHex: '#ffffff',
    description: 'Tono marfil cálido y relajante para lectura',
  },
  {
    id: 'mint',
    label: 'Menta Fresca (Sage)',
    bgHex: '#f3faf6',
    surfaceHex: '#ffffff',
    description: 'Tinte verde suave refrescante y orgánico',
  },
  {
    id: 'lavender',
    label: 'Lavanda Suave (Breeze)',
    bgHex: '#f8f6fc',
    surfaceHex: '#ffffff',
    description: 'Tinte lila tenue sofisticado',
  },
];

const DARK_THEME_OPTIONS: {
  id: DarkTheme;
  label: string;
  bgHex: string;
  surfaceHex: string;
  description: string;
}[] = [
  {
    id: 'midnight',
    label: 'Azul Noche (Midnight)',
    bgHex: '#020617',
    surfaceHex: '#0f172a',
    description: 'Slate azulado oscuro y elegante (Predeterminado)',
  },
  {
    id: 'pure-black',
    label: 'Negro Puro (OLED Black)',
    bgHex: '#000000',
    surfaceHex: '#0a0a0a',
    description: 'Negro azabache absoluto para máximo contraste OLED',
  },
  {
    id: 'zinc',
    label: 'Gris Carbón (Charcoal)',
    bgHex: '#09090b',
    surfaceHex: '#18181b',
    description: 'Gris neutro moderno estilo minimalista',
  },
  {
    id: 'emerald',
    label: 'Bosque Noche (Deep Forest)',
    bgHex: '#02140e',
    surfaceHex: '#062319',
    description: 'Verde esmeralda oscuro orgánico y relajante',
  },
  {
    id: 'purple',
    label: 'Cyber Night (Púrpura Noche)',
    bgHex: '#0a0614',
    surfaceHex: '#130c26',
    description: 'Púrpura noche profundo con matiz de lujo',
  },
];

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
      <span className="text-2xl font-bold text-white tracking-tight">{initials}</span>
    </div>
  );
}

export function SettingsPage() {
  const {
    theme,
    setTheme,
    primaryColor,
    setPrimaryColor,
    darkTheme,
    setDarkTheme,
    lightTheme,
    setLightTheme,
  } = useTheme();
  const user = useSessionStore((s) => s.user);

  // Dynamic tab switcher for tone palette to prevent long scroll
  const [toneTab, setToneTab] = useState<'current' | 'light' | 'dark'>('current');

  const activeMode = theme === 'dark' ? 'dark' : 'light';
  const effectiveToneMode = toneTab === 'current' ? activeMode : toneTab;

  return (
    <PageContainer>
      <PageContainer.Header
        title="Configuración"
        description="Gestiona tu perfil, preferencias visuales y personalización de la aplicación"
      />

      <PageContainer.Body variant="transparent" className="flex flex-col gap-6">

        {/* ─── Sección: Mi Perfil ─────────────────────────────────────── */}
        <section aria-labelledby="profile-heading">
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/30">
              <h3
                id="profile-heading"
                className="text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <Icon name="user" size="sm" className="text-primary-500" />
                Mi Perfil
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Información personal y de tu cuenta
              </p>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <UserAvatar name={user?.name ?? 'Usuario'} />
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-lg font-bold text-text-primary truncate">
                    {user?.name ?? 'Usuario'}
                  </h4>
                  <p className="text-sm text-text-secondary flex items-center gap-1.5 truncate">
                    <Icon name="mail" size="xs" />
                    {user?.email ?? 'correo@ejemplo.com'}
                  </p>
                </div>

                <div className="shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-text-secondary"
                  >
                    <Icon name="lock" size="sm" />
                    Cambiar contraseña
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Sección: Apariencia & Temas ────────────────────────────── */}
        <section aria-labelledby="appearance-heading" className="space-y-6">
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/30">
              <h3
                id="appearance-heading"
                className="text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <Icon name="palette" size="sm" className="text-primary-500" />
                Apariencia y Modo Visual
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Personaliza la estética diurna y nocturna de toda tu aplicación
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. Selector Modo Claro / Oscuro */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="appearance-heading">
                {THEME_OPTIONS.map((option) => {
                  const isSelected = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => {
                        setTheme(option.id);
                        setToneTab('current');
                      }}
                      className={cn(
                        'relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10 shadow-sm shadow-primary-500/10'
                          : 'border-border-subtle hover:border-border hover:bg-surface-2/50 cursor-pointer'
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-surface-2 text-text-secondary'
                      )}>
                        <Icon name={option.icon} size="sm" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold text-sm',
                          isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-text-primary'
                        )}>
                          {option.label}
                        </p>
                        <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                          {option.description}
                        </p>
                      </div>

                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <Icon name="check" size="xs" className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 2. Selector de Color Principal / Acento */}
              <div className="pt-6 border-t border-border-subtle space-y-3">
                <div>
                  <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                    <Icon name="layers" size="xs" className="text-primary-500" />
                    Color de Acento Principal
                  </h4>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Personaliza el color de botones, badges, enlaces y elementos interactivos
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-1">
                  {PRIMARY_COLORS.map((col) => {
                    const isSelected = primaryColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setPrimaryColor(col.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                          isSelected
                            ? 'border-primary-500 bg-surface shadow-sm'
                            : 'border-border-subtle hover:border-border hover:bg-surface-2/40 cursor-pointer'
                        )}
                      >
                        <div
                          className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center shadow-inner"
                          style={{ backgroundColor: col.hex }}
                        >
                          {isSelected && <Icon name="check" size="xs" className="text-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn(
                            'text-xs font-bold truncate',
                            isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-text-primary'
                          )}>
                            {col.label}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">{col.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Selector Dinámico de Tonalidad de Fondo (Sin Scroll Redundante) */}
              <div className="pt-6 border-t border-border-subtle space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                      <Icon
                        name={effectiveToneMode === 'dark' ? 'moon' : 'sun'}
                        size="xs"
                        className={effectiveToneMode === 'dark' ? 'text-primary-500' : 'text-amber-500'}
                      />
                      {effectiveToneMode === 'dark'
                        ? 'Tonalidad de Fondo para Modo Oscuro'
                        : 'Tonalidad de Fondo para Modo Claro'}
                    </h4>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {effectiveToneMode === 'dark'
                        ? 'Elige la atmósfera nocturna (Negro puro OLED, Azul noche, Gris carbón, etc.)'
                        : 'Elige la atmósfera diurna (Gris azulado, Blanco puro, Arena cálida, Menta o Lavanda)'}
                    </p>
                  </div>

                  {/* Switcher compacto entre Claro y Oscuro */}
                  <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl border border-border-subtle shrink-0">
                    <button
                      type="button"
                      onClick={() => setToneTab('light')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        effectiveToneMode === 'light'
                          ? 'bg-surface text-text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                      )}
                    >
                      <Icon name="sun" size="xs" className="text-amber-500" />
                      <span>Paleta Clara</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setToneTab('dark')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        effectiveToneMode === 'dark'
                          ? 'bg-surface text-text-primary shadow-sm'
                          : 'text-text-muted hover:text-text-primary'
                      )}
                    >
                      <Icon name="moon" size="xs" className="text-primary-500" />
                      <span>Paleta Oscura</span>
                    </button>
                  </div>
                </div>

                {/* Grid para Modo Claro */}
                {effectiveToneMode === 'light' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                    {LIGHT_THEME_OPTIONS.map((lightOpt) => {
                      const isSelected = lightTheme === lightOpt.id;
                      return (
                        <button
                          key={lightOpt.id}
                          type="button"
                          onClick={() => setLightTheme(lightOpt.id)}
                          className={cn(
                            'relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-150 overflow-hidden',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                            isSelected
                              ? 'border-primary-500 bg-surface shadow-sm'
                              : 'border-border-subtle hover:border-border hover:bg-surface-2/20 cursor-pointer'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="w-6 h-6 rounded-md border border-border shadow-sm flex items-center justify-center text-[10px]"
                              style={{ backgroundColor: lightOpt.bgHex }}
                              title="Fondo"
                            />
                            <div
                              className="w-6 h-6 rounded-md border border-border shadow-sm flex items-center justify-center text-[10px]"
                              style={{ backgroundColor: lightOpt.surfaceHex }}
                              title="Superficie"
                            />
                            <span className="text-xs font-mono text-text-muted ml-auto">
                              {lightOpt.bgHex}
                            </span>
                          </div>

                          <div className="space-y-1 min-w-0">
                            <p className={cn(
                              'text-xs font-bold flex items-center justify-between',
                              isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-text-primary'
                            )}>
                              <span>{lightOpt.label}</span>
                              {isSelected && (
                                <Icon name="check" size="xs" className="text-primary-500" />
                              )}
                            </p>
                            <p className="text-[11px] text-text-secondary leading-relaxed">
                              {lightOpt.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Grid para Modo Oscuro */}
                {effectiveToneMode === 'dark' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in duration-200">
                    {DARK_THEME_OPTIONS.map((darkOpt) => {
                      const isSelected = darkTheme === darkOpt.id;
                      return (
                        <button
                          key={darkOpt.id}
                          type="button"
                          onClick={() => setDarkTheme(darkOpt.id)}
                          className={cn(
                            'relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-150 overflow-hidden',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                            isSelected
                              ? 'border-primary-500 bg-surface-2/40 shadow-sm'
                              : 'border-border-subtle hover:border-border hover:bg-surface-2/20 cursor-pointer'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className="w-6 h-6 rounded-md border border-white/10 shadow-sm flex items-center justify-center text-[10px] text-white/50"
                            style={{ backgroundColor: darkOpt.bgHex }}
                            title="Fondo"
                          />
                          <div
                            className="w-6 h-6 rounded-md border border-white/10 shadow-sm flex items-center justify-center text-[10px] text-white/50"
                            style={{ backgroundColor: darkOpt.surfaceHex }}
                            title="Superficie"
                          />
                          <span className="text-xs font-mono text-text-muted ml-auto">
                            {darkOpt.bgHex}
                          </span>
                        </div>

                        <div className="space-y-1 min-w-0">
                          <p className={cn(
                            'text-xs font-bold flex items-center justify-between',
                            isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-text-primary'
                          )}>
                            <span>{darkOpt.label}</span>
                            {isSelected && (
                              <Icon name="check" size="xs" className="text-primary-500" />
                            )}
                          </p>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            {darkOpt.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Sección: Cuenta ────────────────────────────────────────── */}
      <section aria-labelledby="account-heading">
        <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/30">
            <h3
              id="account-heading"
              className="text-base font-semibold text-text-primary flex items-center gap-2"
            >
              <Icon name="shield" size="sm" className="text-primary-500" />
              Cuenta
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">
              Acciones relacionadas con tu cuenta
            </p>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-error-100 dark:border-error-900/50 bg-error-50/50 dark:bg-error-900/10">
              <div>
                <p className="text-sm font-medium text-text-primary">Zona de peligro</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  Estas acciones son irreversibles. Procede con precaución.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-error-600 hover:text-error-700 hover:bg-error-100 dark:hover:bg-error-900/30 gap-2 shrink-0"
                aria-label="Eliminar cuenta"
                tabIndex={0}
              >
                <Icon name="trash" size="sm" />
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </div>
      </section>

    </PageContainer.Body>
  </PageContainer>
  );
}
