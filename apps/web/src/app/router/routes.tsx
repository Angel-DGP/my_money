import type { RouteObject } from 'react-router-dom';
import { LoginPage } from '@pages/auth/login.page';
import { RegisterPage } from '@pages/auth/register.page';
import { ProtectedRoute } from '@features/auth';
import { PublicRoute } from './public';
import { MainLayout } from '../layouts/MainLayout';
import { ErrorPage } from '@pages/error';
import { NotFoundPage } from '@pages/not-found';
import { AccountsPage, NewAccountPage, EditAccountPage } from '@pages/accounts';
import { CategoriesPage, NewCategoryPage, EditCategoryPage } from '@pages/categories';
import { TransactionsPage, NewTransactionPage, EditTransactionPage } from '@pages/transactions';
import { BudgetsPage, NewBudgetPage, EditBudgetPage } from '@pages/budgets';
import { GoalsPage, NewGoalPage, EditGoalPage } from '@pages/goals';
import { DashboardPage } from '@pages/dashboard';
import { AnalyticsPage } from '@pages/analytics';
import { ProjectionsPage } from '@pages/cashflow/projections.page';
import { ProjectionDetailPage } from '@pages/cashflow/projection-detail.page';
import { NewSalaryPage } from '@pages/cashflow/new-salary.page';
import { AutomationsPage, CreateAutomationPage, EditAutomationPage } from '@pages/automations';
import { PlanningPage } from '@pages/planning';
import { SettingsPage } from '@pages/settings';
import { UIKitPage } from '@pages/ui-kit';
import { 
  CatalogsPage,
  InstitutionsPage,
  CardsPage,
  SubscriptionsPage,
  ProductServicesPage,
  CategoriesCatalogPage,
  NewInstitutionPage,
  EditInstitutionPage,
  NewCardPage,
  EditCardPage,
  NewCardBrandPage,
  EditCardBrandPage,
  NewSubscriptionPage,
  EditSubscriptionPage,
  NewProductServicePage,
  EditProductPage
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
                path: '/categories/edit/:id',
                element: <EditCategoryPage />,
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
                path: '/planning',
                element: <PlanningPage />,
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
                path: '/budgets/:id/edit',
                element: <EditBudgetPage />,
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
                path: '/goals/:id/edit',
                element: <EditGoalPage />,
              },
              {
                path: '/analytics',
                element: <AnalyticsPage />,
              },
              {
                path: '/projections',
                element: <ProjectionsPage />,
              },
              {
                path: '/projections/:month',
                element: <ProjectionDetailPage />,
              },
              {
                path: '/projections/salary/new',
                element: <NewSalaryPage />,
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
                children: [
                  { index: true, element: <InstitutionsPage /> },
                  { path: 'institutions', element: <InstitutionsPage /> },
                  { path: 'cards', element: <CardsPage /> },
                  { path: 'categories', element: <CategoriesCatalogPage /> },
                  { path: 'subscriptions', element: <SubscriptionsPage /> },
                  { path: 'products', element: <ProductServicesPage /> },
                ],
              },
              {
                path: '/catalogs/institutions/new',
                element: <NewInstitutionPage />,
              },
              {
                path: '/catalogs/institutions/edit/:id',
                element: <EditInstitutionPage />,
              },
              {
                path: '/catalogs/cards/new',
                element: <NewCardPage />,
              },
              {
                path: '/catalogs/cards/edit/:id',
                element: <EditCardPage />,
              },
              {
                path: '/catalogs/card-brands/new',
                element: <NewCardBrandPage />,
              },
              {
                path: '/catalogs/card-brands/edit/:id',
                element: <EditCardBrandPage />,
              },

              {
                path: '/catalogs/subscriptions/new',
                element: <NewSubscriptionPage />,
              },
              {
                path: '/catalogs/subscriptions/:id/edit',
                element: <EditSubscriptionPage />,
              },
              {
                path: '/catalogs/products/new',
                element: <NewProductServicePage />,
              },
              {
                path: '/catalogs/products/:id/edit',
                element: <EditProductPage />,
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
