import React from 'react';
import { cn } from '../../../utils/cn';
import { Icon, type IconName } from '../../core/Icon';

export interface DrawerSummaryCardBadge {
  text: string;
  variant?: 'neutral' | 'primary' | 'success' | 'warning' | 'info';
  icon?: IconName;
}

export interface DrawerSummaryCardProps {
  label?: string;
  title: string;
  amountLabel?: string;
  amount?: React.ReactNode;
  icon?: IconName;
  iconBgColor?: string;
  badges?: DrawerSummaryCardBadge[];
  children?: React.ReactNode;
  className?: string;
}

export function DrawerSummaryCard({
  label,
  title,
  amountLabel,
  amount,
  icon,
  iconBgColor,
  badges,
  children,
  className,
}: DrawerSummaryCardProps) {
  return (
    <div className={cn('p-4 rounded-2xl bg-surface-2/60 border border-border-subtle space-y-3 shadow-sm', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: iconBgColor || '#3b82f6' }}
            >
              <Icon name={icon} size="sm" className="text-white drop-shadow-sm" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {label && (
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block truncate">
                {label}
              </span>
            )}
            <h4 className="text-base font-bold text-text-primary mt-0.5 truncate">
              {title}
            </h4>
          </div>
        </div>

        {amount !== undefined && (
          <div className="text-right shrink-0">
            {amountLabel && (
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider block">
                {amountLabel}
              </span>
            )}
            <div className="text-lg font-black text-text-primary mt-0.5">
              {amount}
            </div>
          </div>
        )}
      </div>

      {((badges && badges.length > 0) || children) && (
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-border-subtle/80 text-xs">
          {badges?.map((b, idx) => {
            const variantClasses = {
              neutral: 'bg-surface-3 text-text-secondary',
              primary: 'bg-primary-500/10 text-primary-500 font-semibold',
              success: 'bg-emerald-500/10 text-emerald-500 font-semibold',
              warning: 'bg-amber-500/10 text-amber-500 font-semibold',
              info: 'bg-blue-500/10 text-blue-500 font-semibold',
            }[b.variant || 'neutral'];

            return (
              <span
                key={idx}
                className={cn('px-2.5 py-1 rounded-lg flex items-center gap-1.5', variantClasses)}
              >
                {b.icon && <Icon name={b.icon} size="xs" />}
                {b.text}
              </span>
            );
          })}
          {children}
        </div>
      )}
    </div>
  );
}
