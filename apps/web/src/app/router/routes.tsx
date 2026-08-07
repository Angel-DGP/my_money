import type { RouteObject } from 'react-router-dom';
import { LoginPage } from '@pages/auth/login.page';
import { RegisterPage } from '@pages/auth/register.page';
import { ProtectedRoute } from '@features/auth';
import { PublicRoute } from './public';
import { MainLayout } from '../layouts/MainLayout';
import { ErrorPage } from '@pages/error';
import { NotFoundPage } from '@pages/not-found';
import { AccountsPage, NewAccountPage, EditAccountPage } from '@pages/accounts';
import { CategoriesPage, NewCategoryPage } from '@pages/categories';
import { TransactionsPage, NewTransactionPage, EditTransactionPage } from '@pages/transactions';
import { BudgetsPage, NewBudgetPage } from '@pages/budgets';
import { GoalsPage, NewGoalPage } from '@pages/goals';
import { DashboardPage } from '@pages/dashboard';
import { AutomationsPage, CreateAutomationPage, EditAutomationPage } from '@pages/automations';
import { UIKitPage } from '@pages/ui-kit';
import { SettingsPage } from '@pages/settings';
import { 
  CatalogsPage,
  NewInstitutionPage,
  NewCardPage,
  NewSubscriptionPage,
  NewProductServicePage
} from '@pages/catalogs';

// Lazy loading pages can be done here or in index.tsx
export const routes: RouteObject[] = [
  {
    errorElement: <ErrorPage />,
    children: [
      {
        element: <PublicRoute />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
              {
                path: '/',
                element: <DashboardPage />,
              },
              {
                path: '/accounts',
                element: <AccountsPage />,
              },
              {
                path: '/accounts/new',
                element: <NewAccountPage />,
              },
              {
                path: '/accounts/:id/edit',
                element: <EditAccountPage />,
              },
              {
                path: '/categories',
                element: <CategoriesPage />,
              },
              {
                path: '/categories/new',
                element: <NewCategoryPage />,
              },
              {
                path: '/transactions',
                element: <TransactionsPage />,
              },
              {
                path: '/transactions/new',
                element: <NewTransactionPage />,
              },
              {
                path: '/transactions/edit',
                element: <EditTransactionPage />,
              },
              {
                path: '/budgets',
                element: <BudgetsPage />,
              },
              {
                path: '/budgets/new',
                element: <NewBudgetPage />,
              },
              {
                path: '/goals',
                element: <GoalsPage />,
              },
              {
                path: '/goals/new',
                element: <NewGoalPage />,
              },
              {
                path: '/automations',
                element: <AutomationsPage />,
              },
              {
                path: '/automations/new',
                element: <CreateAutomationPage />,
              },
              {
                path: '/automations/:id/edit',
                element: <EditAutomationPage />,
              },
              {
                path: '/catalogs',
                element: <CatalogsPage />,
              },
              {
                path: '/catalogs/institutions/new',
                element: <NewInstitutionPage />,
              },
              {
                path: '/catalogs/cards/new',
                element: <NewCardPage />,
              },
              {
                path: '/catalogs/subscriptions/new',
                element: <NewSubscriptionPage />,
              },
              {
                path: '/catalogs/products/new',
                element: <NewProductServicePage />,
              },
              {
                path: '/ui-kit',
                element: <UIKitPage />,
              },
              {
                path: '/settings',
                element: <SettingsPage />,
              },
            ],
          },
        ],
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];
