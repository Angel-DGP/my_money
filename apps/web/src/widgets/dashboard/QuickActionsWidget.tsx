import { Link } from 'react-router-dom';
import { Card, Icon } from '@mymoney/ui';

export function QuickActionsWidget() {
  const actions = [
    {
      title: 'Nueva Transacción',
      description: 'Registra un ingreso o gasto',
      icon: 'arrow-left-right',
      path: '/transactions/new',
      color: 'text-brand-500',
      bgColor: 'bg-brand-500/10'
    },
    {
      title: 'Nueva Cuenta',
      description: 'Agrega una cuenta o tarjeta',
      icon: 'wallet',
      path: '/accounts/new',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      title: 'Nuevo Presupuesto',
      description: 'Asigna un límite de gasto',
      icon: 'piggy-bank',
      path: '/budgets/new',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      title: 'Nueva Meta',
      description: 'Define un objetivo de ahorro',
      icon: 'target',
      path: '/goals/new',
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10'
    }
  ] as const;

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Acciones Rápidas</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <Link key={index} to={action.path} className="block group">
            <Card className="h-full p-4 hover:border-brand-500/50 transition-colors cursor-pointer flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${action.bgColor} ${action.color}`}>
                  <Icon name={action.icon as React.ComponentProps<typeof Icon>['name']} size="sm" />
                </div>
                <h3 className="font-medium text-text-primary group-hover:text-brand-500 transition-colors">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-text-secondary">
                {action.description}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
