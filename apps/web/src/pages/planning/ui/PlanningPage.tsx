import { useSearchParams } from 'react-router-dom';
import { BudgetsListWidget } from '@widgets/budgets';
import { GoalsListWidget } from '@widgets/goals';
import { ProjectionsPage } from '../../cashflow/projections.page';

export function PlanningPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'budgets';

  if (activeTab === 'goals') {
    return <GoalsListWidget />;
  }

  if (activeTab === 'projections') {
    return <ProjectionsPage />;
  }

  return <BudgetsListWidget />;
}
