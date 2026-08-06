import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  Icon
} from '@mymoney/ui';

export function GlobalSearchWidget() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Buscar comandos, navegar..." />
      <CommandList>
        <CommandEmpty>No hay resultados.</CommandEmpty>
        
        <CommandGroup heading="Navegación">
          <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
            <Icon name="layout-dashboard" size="sm" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/accounts'))}>
            <Icon name="wallet" size="sm" />
            <span>Cuentas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/transactions'))}>
            <Icon name="arrow-left-right" size="sm" />
            <span>Transacciones</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/budgets'))}>
            <Icon name="piggy-bank" size="sm" />
            <span>Presupuestos</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/goals'))}>
            <Icon name="target" size="sm" />
            <span>Metas</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
            <Icon name="settings" size="sm" />
            <span>Configuración</span>
            <CommandShortcut>⌘S</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        
        <CommandSeparator />
        
        <CommandGroup heading="Acciones Rápidas">
          <CommandItem onSelect={() => runCommand(() => navigate('/transactions/new'))}>
            <Icon name="plus-circle" size="sm" />
            <span>Nueva Transacción</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/budgets/new'))}>
            <Icon name="plus-circle" size="sm" />
            <span>Nuevo Presupuesto</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/goals/new'))}>
            <Icon name="plus-circle" size="sm" />
            <span>Nueva Meta</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate('/accounts/new'))}>
            <Icon name="plus-circle" size="sm" />
            <span>Nueva Cuenta</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
