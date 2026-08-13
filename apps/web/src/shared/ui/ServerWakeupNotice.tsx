import { Icon } from '@mymoney/ui';

interface ServerWakeupNoticeProps {
  elapsedSeconds?: number;
  className?: string;
}

export function ServerWakeupNotice({ elapsedSeconds = 0, className = '' }: ServerWakeupNoticeProps) {
  const getMessage = () => {
    if (elapsedSeconds < 10) {
      return 'Despertando el servidor en la nube...';
    }
    if (elapsedSeconds < 25) {
      return 'Iniciando servicios y conectando base de datos...';
    }
    return 'Casi listo, el servidor está completando el arranque...';
  };

  return (
    <div
      className={`rounded-xl border border-primary-500/30 bg-primary-500/10 p-3.5 text-xs text-text-primary animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="relative flex items-center justify-center mt-0.5">
          <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between font-semibold text-primary-600 dark:text-primary-400">
            <span className="flex items-center gap-1.5">
              <Icon name="activity" size="xs" />
              {getMessage()}
            </span>
            {elapsedSeconds > 0 && (
              <span className="font-mono text-[11px] opacity-80">{elapsedSeconds}s</span>
            )}
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            El servidor gratuito en Render se reactiva tras unos minutos de inactividad. Esto solo
            toma unos segundos en la primera solicitud.
          </p>
        </div>
      </div>
    </div>
  );
}
