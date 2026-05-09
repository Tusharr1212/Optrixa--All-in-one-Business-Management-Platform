import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage from './pages/inventory/ProductsPage';
import ExpensesPage from './pages/expenses/ExpensesPage';
import SalesPage from './pages/sales/SalesPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import CategoriesPage from './pages/categories/CategoriesPage';
import SuppliersPage from './pages/suppliers/SuppliersPage';
import CustomersPage from './pages/customers/CustomersPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true,         element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard',   element: <DashboardPage /> },
      { path: 'inventory',   element: <ProductsPage /> },
      { path: 'expenses',    element: <ExpensesPage /> },
      { path: 'sales',       element: <SalesPage /> },
      { path: 'customers',   element: <CustomersPage /> },
      { path: 'suppliers',   element: <SuppliersPage /> },
      { path: 'categories',  element: <CategoriesPage /> },
      { path: 'reports',     element: <ReportsPage /> },
      { path: 'settings',    element: <SettingsPage /> },
    ],
  },
]);