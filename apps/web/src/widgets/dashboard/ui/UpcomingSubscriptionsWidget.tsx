import { Card, Icon } from '@mymoney/ui';
import { useSubscriptions } from '../../../features/catalogs/api/useCatalogs';
import { parseSafeDate } from '@shared/utils/date';

export function UpcomingSubscriptionsWidget() {
  const { data: subscriptions = [], isLoading } = useSubscriptions();

  // Find subscriptions due in the next 5 days
  const today = new Date();
  const next5Days = new Date();
  next5Days.setDate(today.getDate() + 5);

  const upcoming = subscriptions.filter(sub => {
    const targetDateStr = sub.next_billing_date || sub.start_date;
    if (!sub.billing_cycle || !targetDateStr) return false;
    
    // Simplistic calculation for Monthly subscriptions for demonstration
    const startDate = parseSafeDate(targetDateStr) || new Date(targetDateStr);
    const billingDay = startDate.getDate();
    
    const currentMonthDue = new Date(today.getFullYear(), today.getMonth(), billingDay);
    if (currentMonthDue < today) {
      currentMonthDue.setMonth(currentMonthDue.getMonth() + 1);
    }
    
    const timeDiff = currentMonthDue.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Include if due today or in next 5 days
    return daysDiff >= 0 && daysDiff <= 5;
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-surface-2 animate-pulse" />
          <div className="h-6 w-48 bg-surface-2 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-surface-2 animate-pulse rounded-xl" />
          <div className="h-12 bg-surface-2 animate-pulse rounded-xl" />
        </div>
      </Card>
    );
  }

  if (upcoming.length === 0) {
    return null; // Don't show the widget if there are no upcoming subscriptions
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500">
          <Icon name="calendar" size="sm" />
        </div>
        <h3 className="font-semibold text-lg text-text-primary">Suscripciones Próximas</h3>
      </div>
      
      <div className="space-y-3">
        {upcoming.map(sub => (
          <div key={sub.id} className="flex items-center justify-between p-3 rounded-xl border border-border-subtle bg-surface-2/50 backdrop-blur-sm transition-colors hover:bg-surface-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-sm">
                <Icon name="credit-card" size="sm" className="text-text-secondary" />
              </div>
              <div>
                <p className="font-medium text-sm text-text-primary">{sub.name}</p>
                <p className="text-xs text-text-muted">Se cobra en los próximos días</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-sm text-text-primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(sub.amount))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
