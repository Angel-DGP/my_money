import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Button, Icon, cn } from '@mymoney/ui';
import { GlobalSearchWidget } from '@widgets/global-search';
import { NotificationBell } from '@widgets/notification';
import { useTheme } from '../providers/ThemeProvider';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { path: '/accounts', label: 'Cuentas', icon: 'credit-card' as const },
  { path: '/categories', label: 'Categorías', icon: 'tag' as const },
  { path: '/transactions', label: 'Transacciones', icon: 'arrow-left-right' as const },
  { path: '/budgets', label: 'Presupuestos', icon: 'pie-chart' as const },
  { path: '/goals', label: 'Metas', icon: 'target' as const },
  { path: '/automations', label: 'Automatizaciones', icon: 'repeat' as const },
  { path: '/catalogs', label: 'Catálogos', icon: 'settings' as const },
  { path: '/ui-kit', label: 'Interfaz (UI Kit)', icon: 'palette' as const },
];

export function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-surface flex overflow-hidden">
      <GlobalSearchWidget />
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-background border-r border-border-subtle flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-border-subtle">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white">
              <Icon name="wallet" size="sm" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight">MyMoney</span>
          </Link>
          <Button variant="ghost" className="md:hidden -mr-2 p-2" onClick={closeMobileMenu}>
            <Icon name="x" size="sm" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeMobileMenu}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors",
                isActive(item.path)
                  ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface"
              )}
            >
              <Icon 
                name={item.icon} 
                size="sm" 
                className={cn(isActive(item.path) ? "text-brand-600 dark:text-brand-400" : "text-text-secondary")} 
              />
              {item.label}
            </Link>
          ))}
        </div>
        
        <div className="p-4 border-t border-border-subtle">
          <Button variant="ghost" fullWidth onClick={handleLogout} className="justify-start text-text-secondary hover:text-text-primary hover:bg-surface">
            <Icon name="log-out" size="sm" className="mr-3" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-background/50 dark:bg-background/30 backdrop-blur-xl border-b border-border-subtle flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
            >
              <Icon name="menu" size="sm" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Icon name="wallet" className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                MyMoney
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-surface transition-colors text-text-secondary"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
            </button>
            <NotificationBell />
          </div>
        </header>
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-16 border-b border-border-subtle bg-background/50 dark:bg-background/30 backdrop-blur-xl items-center justify-end px-8 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-surface transition-colors text-text-secondary"
            >
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} size="sm" />
            </button>
            <NotificationBell />
          </div>
        </header>
        
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
