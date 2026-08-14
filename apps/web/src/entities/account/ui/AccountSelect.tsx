import { useState, useRef, useEffect, useMemo } from 'react';
import { useAccountsQuery } from '../model/queries';
import type { Account, AccountType } from '../types/account.types';
import { Icon, Badge, type IconName } from '@mymoney/ui';

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
}

const getAccountIcon = (type: AccountType): IconName => {
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
    if (isOpen && availableAccounts.length > 4) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, availableAccounts.length]);

  const handleSelect = (accId: string) => {
    onChange?.(accId);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={id}
          className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5"
        >
          {label}
          {required && <span className="text-error-500 ml-0.5">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[44px] px-3.5 py-2 flex items-center justify-between text-left text-sm rounded-xl border bg-surface-2 transition-all outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${
          error
            ? 'border-error-500 bg-error-500/5'
            : isOpen
            ? 'border-primary-500 ring-2 ring-primary-500/20 shadow-sm'
            : 'border-border-subtle hover:border-border-strong hover:bg-surface-3'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
          {selectedAccount ? (
            <>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  backgroundColor: selectedAccount.color ? `${selectedAccount.color}15` : 'rgba(59, 130, 246, 0.1)',
                  borderColor: selectedAccount.color ? `${selectedAccount.color}30` : 'rgba(59, 130, 246, 0.2)',
                  color: selectedAccount.color || '#3b82f6',
                }}
              >
                <Icon name={getAccountIcon(selectedAccount.type)} size="xs" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-semibold text-text-primary truncate">
                    {selectedAccount.name}
                  </span>
                  <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5 shrink-0">
                    {getAccountTypeLabel(selectedAccount.type)}
                  </Badge>
                </div>
              </div>
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
            size="xs"
            className={`text-text-muted transition-transform duration-200 ${
              isOpen ? 'transform rotate-180 text-primary-500' : ''
            }`}
          />
        </div>
      </button>

      {/* Error Message */}
      {error && <p className="text-xs text-error-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 py-1.5 bg-surface-1 border border-border-strong rounded-xl shadow-xl backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-100 max-h-72 flex flex-col">
          {/* Search bar if multiple accounts */}
          {availableAccounts.length > 4 && (
            <div className="px-2.5 pb-2 pt-1 border-b border-border-subtle">
              <div className="relative">
                <Icon
                  name="search"
                  size="xs"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar cuenta..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-2 border border-border-subtle rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1 space-y-0.5" role="listbox">
            {allowNone && (
              <button
                type="button"
                onClick={() => handleSelect('none')}
                className={`w-full px-3 py-2 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                  !value || value === 'none'
                    ? 'bg-primary-500/10 text-primary-500 font-medium'
                    : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                }`}
                role="option"
                aria-selected={!value || value === 'none'}
              >
                <span>{noneLabel}</span>
                {(!value || value === 'none') && <Icon name="check" size="xs" />}
              </button>
            )}

            {filteredAccounts.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-text-muted">
                No se encontraron cuentas
              </div>
            ) : (
              filteredAccounts.map((acc: Account) => {
                const isSelected = value === acc.id;
                const balNum = parseFloat(acc.current_balance?.value || '0');
                const isCredit = acc.type === 'CREDIT';

                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelect(acc.id)}
                    className={`w-full px-3 py-2.5 text-left text-xs rounded-lg flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-primary-500/10 text-text-primary font-medium'
                        : 'text-text-secondary hover:bg-surface-2 hover:text-text-primary'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border"
                        style={{
                          backgroundColor: acc.color ? `${acc.color}15` : 'rgba(59, 130, 246, 0.1)',
                          borderColor: acc.color ? `${acc.color}30` : 'rgba(59, 130, 246, 0.2)',
                          color: acc.color || '#3b82f6',
                        }}
                      >
                        <Icon name={getAccountIcon(acc.type)} size="xs" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-text-primary truncate">
                            {acc.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-3 text-text-muted font-normal">
                            {getAccountTypeLabel(acc.type)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-semibold ${
                          isCredit
                            ? 'text-text-secondary'
                            : balNum < 0
                            ? 'text-error-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {formatBalance(acc.current_balance?.value, acc.currency)}
                      </span>
                      {isSelected && <Icon name="check" size="xs" className="text-primary-500 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
