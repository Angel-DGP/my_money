import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth';
import { Button, Icon, type IconName, cn } from '@mymoney/ui';
import { GlobalSearchWidget } from '@widgets/global-search';
import { NotificationBell } from '@widgets/notification';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'layout-dashboard' as const },
  { path: '/accounts', label: 'Cuentas', icon: 'wallet' as const },
  { path: '/transactions', label: 'Transacciones', icon: 'arrow-left-right' as const },
  { 
    path: '/planning', 
    label: 'Planificación', 
    icon: 'target' as const,
    subItems: [
      { path: '/planning?tab=budgets', label: 'Presupuestos' },
      { path: '/planning?tab=goals', label: 'Metas de Ahorro' },
      { path: '/planning?tab=projections', label: 'Flujo de Caja' },
    ]
  },
  { path: '/analytics', label: 'Analíticas', icon: 'bar-chart-2' as const },
  { 
    path: '/catalogs', 
    label: 'Catálogos', 
    icon: 'layers' as const,
    subItems: [
      { path: '/catalogs/institutions', label: 'Bancos e Instituciones' },
      { path: '/catalogs/cards', label: 'Mis Tarjetas' },
      { path: '/catalogs/categories', label: 'Categorías' },
      { path: '/catalogs/subscriptions', label: 'Suscripciones' },
      { path: '/catalogs/products', label: 'Compras Frecuentes' },
    ]
  },
  { path: '/automations', label: 'Automatizaciones', icon: 'zap' as const },
  { path: '/settings', label: 'Configuración', icon: 'settings' as const },
];

export function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    const basePath = path.split('?')[0] || path;
    return location.pathname.startsWith(basePath);
  };

  const toggleExpand = (path: string) => {
    setExpandedItems(prev => ({ ...prev, [path]: !prev[path] }));
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
        {/* Sidebar Header: Logo + NotificationBell */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-border-subtle shrink-0">
          <Link to="/" onClick={closeMobileMenu} className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-primary-600 text-white">
              <Icon name="wallet" size="sm" />
            </div>
            <span className="text-xl font-bold text-text-primary tracking-tight truncate">MyMoney</span>
          </Link>

          <div className="flex items-center gap-1 shrink-0">
            <NotificationBell />
            {/* Close button (mobile only) */}
            <Button variant="ghost" className="md:hidden p-2" onClick={closeMobileMenu} aria-label="Cerrar menú">
              <Icon name="x" size="sm" />
            </Button>
          </div>
        </div>
        
        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar py-4 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isItemActive = isActive(item.path);
            const isExpanded = isItemActive || expandedItems[item.path];
            
            return (
              <div key={item.path} className="flex flex-col gap-1">
                {item.subItems ? (
                  <button
                    onClick={() => toggleExpand(item.path)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors w-full",
                      isItemActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    )}
                  >
                    <Icon 
                      name={item.icon as IconName} 
                      size="sm" 
                      className={cn(isItemActive ? "text-primary-600 dark:text-primary-400" : "text-text-secondary")} 
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    <Icon name={isExpanded ? 'chevron-down' : 'chevron-right'} size="sm" className="opacity-50 transition-transform" />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors w-full",
                      isItemActive
                        ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface"
                    )}
                  >
                    <Icon 
                      name={item.icon as IconName} 
                      size="sm" 
                      className={cn(isItemActive ? "text-primary-600 dark:text-primary-400" : "text-text-secondary")} 
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                  </Link>
                )}

                {item.subItems && isExpanded && (
                  <div className="flex flex-col gap-1 pl-9 pr-2 py-1 animate-in slide-in-from-top-2 duration-200">
                    {item.subItems.map((subItem) => {
                      const isSubActive = (() => {
                        if (subItem.path.includes('?')) {
                          const parts = subItem.path.split('?');
                          const subPath = parts[0] || '';
                          const subQuery = parts[1] || '';
                          if (location.pathname !== subPath) return false;
                          const currentTab = new URLSearchParams(location.search).get('tab') || 'budgets';
                          const itemTab = new URLSearchParams(subQuery).get('tab');
                          return currentTab === itemTab;
                        }
                        return location.pathname === subItem.path || location.pathname.startsWith(`${subItem.path}/`);
                      })();

                      return (
                        <Link
                          key={subItem.path}
                          to={subItem.path}
                          onClick={closeMobileMenu}
                          className={cn(
                            "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            isSubActive
                              ? "bg-primary-50/50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                              : "text-text-secondary hover:text-text-primary hover:bg-surface"
                          )}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Sidebar Footer: Settings + Logout (Icon buttons only) */}
        <div className="p-3 border-t border-border-subtle flex items-center justify-between gap-2 shrink-0">
          <Link
            to="/settings"
            onClick={closeMobileMenu}
            aria-label="Configuración"
            className={cn(
              "flex-1 flex justify-center items-center p-2 rounded-md transition-colors",
              isActive('/settings')
                ? "bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-400"
                : "text-text-secondary hover:text-text-primary hover:bg-surface"
            )}
          >
            <Icon
              name="settings"
              size="sm"
              className={cn(isActive('/settings') ? "text-primary-600 dark:text-primary-400" : "text-text-secondary")}
            />
          </Link>
          <button
            onClick={handleLogout}
            aria-label="Cerrar Sesión"
            className="flex-1 flex justify-center items-center p-2 rounded-md text-text-secondary hover:text-error-600 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
          >
            <Icon name="log-out" size="sm" />
          </button>
        </div>
      </aside>

      {/* Main Content — no top header, PageContainer owns the full right area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
        {/* Mobile Header (preserved for mobile navigation) */}
        <header className="md:hidden h-16 bg-background/80 backdrop-blur-md border-b border-border-subtle flex items-center justify-between px-4 shrink-0 z-10 sticky top-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface transition-colors"
              aria-label="Abrir menú"
            >
              <Icon name="menu" size="sm" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Icon name="wallet" className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                MyMoney
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
          </div>
        </header>
        
        {/* Outlet: PageContainer takes the full remaining space */}
        <div className="flex-1 min-h-0 flex flex-col bg-background">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
