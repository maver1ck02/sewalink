import { Navigate, Route, Routes } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import DashLayout from './layouts/DashLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProviderPage from './pages/ProviderPage';
import RequestPage from './pages/RequestPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPage from './pages/ForgotPage';
import ResetPage from './pages/ResetPage';
import VerifyPage from './pages/VerifyPage';
import BecomeProviderPage from './pages/BecomeProviderPage';
import ComparePage from './pages/ComparePage';
import CustomerHome from './pages/customer/CustomerHome';
import BookingsList from './pages/customer/BookingsList';
import BookingDetail from './pages/customer/BookingDetail';
import FavoritesPage from './pages/customer/FavoritesPage';
import MessagesPage from './pages/customer/MessagesPage';
import NotificationsPage from './pages/customer/NotificationsPage';
import ProfilePage from './pages/customer/ProfilePage';
import ProviderHome from './pages/provider/ProviderHome';
import ProviderServices from './pages/provider/ProviderServices';
import ProviderPortfolio from './pages/provider/ProviderPortfolio';
import ProviderProfileManage from './pages/provider/ProviderProfileManage';
import {
  AdminHome,
  AdminUsers,
  AdminProviders,
  AdminCategories,
  AdminServices,
  AdminBookings,
  AdminReviews,
  AdminReports,
  AdminAnalytics,
  AdminAudit,
  AdminSettings,
} from './pages/admin/AdminPages';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/providers/:id" element={<ProviderPage />} />
        <Route path="/request/:providerId" element={<RequestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPage />} />
        <Route path="/reset-password" element={<ResetPage />} />
        <Route path="/verify-email" element={<VerifyPage />} />
        <Route path="/become-provider" element={<BecomeProviderPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={['customer']} />}>
        <Route element={<DashLayout role="customer" />}>
          <Route path="/app" element={<CustomerHome />} />
          <Route path="/app/bookings" element={<BookingsList />} />
          <Route path="/app/bookings/:id" element={<BookingDetail />} />
          <Route path="/app/favorites" element={<FavoritesPage />} />
          <Route path="/app/messages" element={<MessagesPage />} />
          <Route path="/app/notifications" element={<NotificationsPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/settings" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['provider']} />}>
        <Route element={<DashLayout role="provider" />}>
          <Route path="/provider" element={<ProviderHome />} />
          <Route path="/provider/requests" element={<BookingsList />} />
          <Route path="/provider/requests/:id" element={<BookingDetail />} />
          <Route path="/provider/services" element={<ProviderServices />} />
          <Route path="/provider/portfolio" element={<ProviderPortfolio />} />
          <Route path="/provider/messages" element={<MessagesPage />} />
          <Route path="/provider/notifications" element={<NotificationsPage />} />
          <Route path="/provider/profile" element={<ProviderProfileManage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashLayout role="admin" />}>
          <Route path="/admin" element={<AdminHome />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/providers" element={<AdminProviders />} />
          <Route path="/admin/verifications" element={<AdminProviders verificationOnly />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/services" element={<AdminServices />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/audit" element={<AdminAudit />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
