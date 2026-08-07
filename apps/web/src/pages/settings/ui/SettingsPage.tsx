import { PageContainer, Icon, Button, cn } from '@mymoney/ui';
import { useTheme } from '@app/providers/ThemeProvider';
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
  const { theme, setTheme } = useTheme();
  const user = useSessionStore((s) => s.user);

  return (
    <PageContainer>
      <PageContainer.Header
        title="Configuración"
        description="Gestiona tu perfil y preferencias de la aplicación"
      />

      <PageContainer.Body variant="transparent" className="flex flex-col gap-6">

        {/* ─── Sección: Mi Perfil ─────────────────────────────────────── */}
        <section aria-labelledby="profile-heading">
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/30">
              <h3
                id="profile-heading"
                className="text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <Icon name="user" size="sm" className="text-primary-500" />
                Mi Perfil
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Tu información personal en MyMoney
              </p>
            </div>

            {/* Profile Content */}
            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <UserAvatar name={user?.name ?? 'U'} />

              <div className="flex-1 min-w-0">
                <p className="text-xl font-bold text-text-primary truncate">
                  {user?.name ?? '—'}
                </p>
                <p className="text-sm text-text-secondary mt-0.5 truncate">{user?.email ?? '—'}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label="Editar perfil"
                    tabIndex={0}
                    className="gap-2"
                  >
                    <Icon name="pencil" size="sm" />
                    Editar perfil
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label="Cambiar contraseña"
                    tabIndex={0}
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

        {/* ─── Sección: Apariencia ────────────────────────────────────── */}
        <section aria-labelledby="appearance-heading">
          <div className="bg-surface rounded-2xl border border-border-subtle shadow-sm overflow-hidden">
            {/* Section Header */}
            <div className="px-6 py-4 border-b border-border-subtle bg-surface-2/30">
              <h3
                id="appearance-heading"
                className="text-base font-semibold text-text-primary flex items-center gap-2"
              >
                <Icon name="palette" size="sm" className="text-primary-500" />
                Apariencia
              </h3>
              <p className="text-sm text-text-secondary mt-0.5">
                Elige el tema visual de la aplicación
              </p>
            </div>

            {/* Theme Selector */}
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="appearance-heading">
                {THEME_OPTIONS.map((option) => {
                  const isSelected = theme === option.id;
                  return (
                    <button
                      key={option.id}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onClick={() => setTheme(option.id)}
                      className={cn(
                        'relative flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all duration-150',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 shadow-sm shadow-primary-500/10'
                          : 'border-border-subtle hover:border-border hover:bg-surface-2/50 cursor-pointer'
                      )}
                    >
                      {/* Icon */}
                      <div className={cn(
                        'mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
                        isSelected
                          ? 'bg-primary-500 text-white'
                          : 'bg-surface-2 text-text-secondary'
                      )}>
                        <Icon name={option.icon} size="sm" />
                      </div>

                      {/* Text */}
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

                      {/* Selected indicator */}
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center shrink-0">
                          <Icon name="check" size="sm" className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
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
