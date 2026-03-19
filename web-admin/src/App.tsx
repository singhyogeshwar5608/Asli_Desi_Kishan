import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/dashboard-layout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { MembersPage } from './pages/members/MembersPage';
import { ProductsPage } from './pages/products/ProductsPage';
import { OrdersPage } from './pages/orders/OrdersPage';
import { CouponsPage } from './pages/coupons/CouponsPage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { ProtectedRoute } from './routes/ProtectedRoute';
import CategoryPage from './pages/categories/CategoryPage';
import BinaryTreePage from './pages/binary-tree/BinaryTree';
import { EventMediaPage } from './pages/event-media/EventMediaPage';
import { AdkEventsPage } from './pages/adk-events/AdkEventsPage';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/event-media" element={<EventMediaPage />} />
          <Route path="/adk-events" element={<AdkEventsPage />} />
          <Route path="/binary-tree" element={<BinaryTreePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default App;
