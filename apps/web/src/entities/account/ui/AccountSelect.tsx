import { useState, useRef, useEffect, useMemo } from 'react';
import { useAccountsQuery } from '../model/queries';
import type { Account, AccountType } from '../types/account.types';
import { Icon, Label, type IconName } from '@mymoney/ui';

export interface AccountSelectProps {
  id?: string | undefined;
  name?: string | undefined;
  label?: string | undefined;
  value?: string | undefined;
  onChange?: ((value: string) => void) | undefined;
  filterType?: AccountType | 'ALL' | undefined;
  excludeCash?: boolean | undefined;
  placeholder?: string | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  required?: boolean | undefined;
  allowNone?: boolean | undefined;
  noneLabel?: string | undefined;
  className?: string | undefined;
  excludeId?: string | undefined;
  searchable?: boolean | undefined;
}

const getAccountFallbackIcon = (type: AccountType): IconName => {
  switch (type) {
    case 'CASH':
      return 'wallet';
    case 'SAVINGS':
      return 'piggy-bank';
    case 'CREDIT':
      return 'credit-card';
    case 'INVESTMENT':
      return 'trending-up';
    case 'CHECKING':
    default:
      return 'coins';
  }
};

const getAccountTypeLabel = (type: AccountType): string => {
  switch (type) {
    case 'CHECKING':
      return 'Corriente';
    case 'SAVINGS':
      return 'Ahorros';
    case 'CASH':
      return 'Efectivo';
    case 'CREDIT':
      return 'Crédito';
    case 'INVESTMENT':
      return 'Inversión';
    default:
      return type;
  }
};

const formatBalance = (amountStr: string, currency: string = 'USD') => {
  const num = parseFloat(amountStr || '0');
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(num);
};

export function AccountSelect({
  id,
  name,
  label,
  value,
  onChange,
  filterType = 'ALL',
  excludeCash = false,
  placeholder = 'Seleccionar cuenta...',
  error,
  disabled = false,
  required = false,
  allowNone = false,
  noneLabel = 'Sin cuenta',
  className = '',
  excludeId,
  searchable,
}: AccountSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data: accounts = [], isLoading } = useAccountsQuery();

  // Filter accounts list
  const availableAccounts = useMemo(() => {
    if (!Array.isArray(accounts)) return [];
    return accounts.filter((acc: Account) => {
      if (excludeId && acc.id === excludeId) return false;
      if (excludeCash && acc.type === 'CASH') return false;
      if (filterType !== 'ALL' && acc.type !== filterType) return false;
      return true;
    });
  }, [accounts, excludeId, excludeCash, filterType]);

  const isSearchable = searchable ?? availableAccounts.length >= 4;

  // Selected item
  const selectedAccount = useMemo(() => {
    if (!value || value === 'none' || value === 'all') return null;
    return accounts.find((a: Account) => a.id === value) || null;
  }, [value, accounts]);

  // Filtered by search query
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return availableAccounts;
    const q = searchQuery.toLowerCase().trim();
    return availableAccounts.filter(
      (a: Account) =>
        a.name.toLowerCase().includes(q) ||
        getAccountTypeLabel(a.type).toLowerCase().includes(q)
    );
  }, [availableAccounts, searchQuery]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && isSearchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isSearchable]);

  const handleSelect = (accId: string) => {
    onChange?.(accId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${className}`} ref={containerRef}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}

      {/* Trigger Button - standard h-10 with clean borders */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-10 w-full items-center justify-between rounded-lg border bg-background/50 backdrop-blur-sm px-3.5 py-2 text-sm text-text-primary transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          isOpen
            ? 'border-primary-500 ring-1 ring-primary-500'
            : error
            ? 'border-error-500'
            : 'border-border-subtle hover:border-border-strong'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {selectedAccount ? (
            <>
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  backgroundColor: selectedAccount.color || '#3b82f6',
                }}
              >
                <Icon
                  name={(selectedAccount.icon as IconName) || getAccountFallbackIcon(selectedAccount.type)}
                  size="xs"
                  className="text-white drop-shadow-sm scale-90"
                />
              </div>
              <span className="font-medium text-text-primary truncate">
                {selectedAccount.name}
              </span>
              <span className="text-[11px] text-text-muted shrink-0">
                ({getAccountTypeLabel(selectedAccount.type)})
              </span>
            </>
          ) : (
            <span className="text-text-muted truncate">
              {isLoading ? 'Cargando cuentas...' : placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {selectedAccount && (
            <span
              className={`text-xs font-semibold ${
                selectedAccount.type === 'CREDIT'
                  ? 'text-text-secondary'
                  : parseFloat(selectedAccount.current_balance?.value || '0') < 0
                  ? 'text-error-500'
                  : 'text-emerald-500'
              }`}
            >
              {formatBalance(selectedAccount.current_balance?.value, selectedAccount.currency)}
            </span>
          )}
          <Icon
            name="chevron-down"
            size="sm"
            className={`text-text-secondary transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-primary-500' : ''
            }`}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && <p className="text-xs text-error-500">{error}</p>}

      {/* Dropdown Menu - matching core Select search & options */}
      {isOpen && (
        <div className="absolute top-[calc(100%+4px)] z-50 max-h-64 w-full flex flex-col rounded-xl border border-border-subtle bg-surface shadow-2xl animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
          {/* Search bar matching SelectSearch.tsx */}
          {isSearchable && (
            <div className="p-2 border-b border-border-subtle sticky top-0 bg-surface/90 dark:bg-surface-2/90 z-10 backdrop-blur-md">
              <div className="relative">
                <Icon
                  name="search"
                  size="sm"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted h-3.5 w-3.5 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Buscar cuenta..."
                  className="w-full bg-background/50 border border-border-subtle rounded-md pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-text-primary placeholder:text-text-muted"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-auto p-1.5 max-h-[220px] custom-scrollbar space-y-0.5" role="listbox">
            {allowNone && (
              <div
                role="option"
                aria-selected={!value || value === 'none'}
                onClick={() => handleSelect('none')}
                className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-colors my-0.5 ${
                  !value || value === 'none'
                    ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                    : 'text-text-primary hover:bg-surface-2'
                }`}
              >
                <span>{noneLabel}</span>
                {(!value || value === 'none') && <Icon name="check" size="sm" className="text-primary-500" />}
              </div>
            )}

            {filteredAccounts.length === 0 ? (
              <div className="p-2 text-sm text-text-muted text-center py-4">
                No hay resultados
              </div>
            ) : (
              filteredAccounts.map((acc: Account) => {
                const isSelected = value === acc.id;
                const balNum = parseFloat(acc.current_balance?.value || '0');
                const isCredit = acc.type === 'CREDIT';
                const accIcon = (acc.icon as IconName) || getAccountFallbackIcon(acc.type);

                return (
                  <div
                    key={acc.id}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(acc.id)}
                    className={`relative flex w-full cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2 text-sm outline-none transition-colors my-0.5 ${
                      isSelected
                        ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400 font-semibold'
                        : 'text-text-primary hover:bg-surface-2'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                        style={{
                          backgroundColor: acc.color || '#3b82f6',
                        }}
                      >
                        <Icon
                          name={accIcon}
                          size="xs"
                          className="text-white drop-shadow-sm scale-90"
                        />
                      </div>
                      <span className="truncate">{acc.name}</span>
                      <span className="text-[11px] text-text-muted font-normal shrink-0">
                        ({getAccountTypeLabel(acc.type)})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-xs font-semibold ${
                          isCredit
                            ? 'text-text-secondary'
                            : balNum < 0
                            ? 'text-error-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {formatBalance(acc.current_balance?.value, acc.currency)}
                      </span>
                      {isSelected && <Icon name="check" size="sm" className="text-primary-500 shrink-0" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
