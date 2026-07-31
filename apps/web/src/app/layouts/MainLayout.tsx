import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { Button, Icon } from '@mymoney/ui';

export function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-muted flex">
      {/* Sidebar (simplified for now) */}
      <aside className="w-64 bg-bg-base border-r border-border-subtle flex flex-col hidden md:flex">
        <div className="p-4 border-b border-border-subtle">
          <h1 className="text-xl font-bold text-text-base flex items-center gap-2">
            <Icon name="wallet" className="text-brand-600" />
            MyMoney
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="block px-4 py-2 rounded-md hover:bg-bg-muted text-text-base font-medium">Dashboard</Link>
          <Link to="/accounts" className="block px-4 py-2 rounded-md hover:bg-bg-muted text-text-base font-medium">Cuentas</Link>
          <Link to="/categories" className="block px-4 py-2 rounded-md hover:bg-bg-muted text-text-base font-medium">Categorías</Link>
          <Link to="/transactions" className="block px-4 py-2 rounded-md hover:bg-bg-muted text-text-base font-medium">Transacciones</Link>
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <Button variant="ghost" fullWidth onClick={handleLogout} className="justify-start">
            <Icon name="log-out" size="sm" className="mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header (simplified for now) */}
        <header className="md:hidden h-16 bg-bg-base border-b border-border-subtle flex items-center px-4">
          <h1 className="text-xl font-bold text-text-base flex items-center gap-2">
            <Icon name="wallet" className="text-brand-600" />
            MyMoney
          </h1>
        </header>
        
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
