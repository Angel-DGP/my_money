import React from 'react';
import { Button } from '../../core/Button';
import { Icon } from '../../core/Icon';
import { cn } from '../../../utils/cn';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  
  // Basic sliding window for large numbers of pages
  const getVisiblePages = () => {
    if (totalPages <= 7) return pages;
    
    if (currentPage <= 4) {
      return [...pages.slice(0, 5), 'ellipsis', totalPages];
    }
    
    if (currentPage >= totalPages - 3) {
      return [1, 'ellipsis', ...pages.slice(totalPages - 5)];
    }
    
    return [1, 'ellipsis', currentPage - 1, currentPage, currentPage + 1, 'ellipsis', totalPages];
  };

  return (
    <div className={cn("flex items-center justify-between px-4 py-3 sm:px-6", className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">
            Mostrando página <span className="font-medium text-text-primary">{currentPage}</span> de{' '}
            <span className="font-medium text-text-primary">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-text-secondary ring-1 ring-inset ring-border-subtle hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Anterior</span>
              <Icon name="chevron-left" className="h-5 w-5" aria-hidden="true" />
            </button>
            {getVisiblePages().map((page, index) => {
              if (page === 'ellipsis') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-text-secondary ring-1 ring-inset ring-border-subtle focus:outline-offset-0"
                  >
                    ...
                  </span>
                );
              }
              
              const isActive = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ring-1 ring-inset ring-border-subtle",
                    isActive
                      ? "z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                      : "text-text-primary hover:bg-surface"
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-text-secondary ring-1 ring-inset ring-border-subtle hover:bg-surface disabled:opacity-50 disabled:cursor-not-allowed focus:z-20 focus:outline-offset-0"
            >
              <span className="sr-only">Siguiente</span>
              <Icon name="chevron-right" className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

