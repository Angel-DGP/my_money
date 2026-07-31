import { RouteObject } from 'react-router-dom';
import { ProtectedRoute } from '../../features/auth/ui/ProtectedRoute';
import { PublicRoute } from './public';
import { MainLayout } from '../layouts/MainLayout';
import { ErrorPage } from '../../pages/error/ui/ErrorPage';
import { NotFoundPage } from '../../pages/not-found/ui/NotFoundPage';
import { AccountsPage } from '../../pages/accounts/ui/AccountsPage';
import { CategoriesPage } from '../../pages/categories/ui/CategoriesPage';
import { TransactionsPage } from '../../pages/transactions/ui/TransactionsPage';

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
            element: <div>Login Page (To be implemented)</div>,
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
                element: <div>Dashboard (To be implemented)</div>,
              },
              {
                path: '/accounts',
                element: <AccountsPage />,
              },
              {
                path: '/categories',
                element: <CategoriesPage />,
              },
              {
                path: '/transactions',
                element: <TransactionsPage />,
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
