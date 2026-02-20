import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { UserRole } from './types';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HomePage from './pages/customer/HomePage';
import SearchPage from './pages/customer/SearchPage';
import HallDetailPage from './pages/customer/HallDetailPage';
import BookingPage from './pages/customer/BookingPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import DashboardPage from './pages/owner/DashboardPage';
import HallRegistrationPage from './pages/owner/HallRegistrationPage';
import HallsListPage from './pages/owner/HallsListPage';
import VenueManagementPage from './pages/owner/VenueManagementPage';
import BookingManagementPage from './pages/owner/BookingManagementPage';
import StaffManagementPage from './pages/owner/StaffManagementPage';
import OwnerBookingsPage from './pages/owner/OwnerBookingsPage';
import ReportsPage from './pages/owner/ReportsPage';
import SettingsPage from './pages/owner/SettingsPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import HallApprovalsPage from './pages/admin/HallApprovalsPage';
import UsersPage from './pages/admin/UsersPage';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/halls/:id" element={<HallDetailPage />} />

        {/* Customer routes */}
        <Route
          path="/book/:venueId"
          element={
            <ProtectedRoute roles={[UserRole.CUSTOMER]}>
              <BookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute roles={[UserRole.CUSTOMER]}>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />

        {/* Owner routes */}
        <Route
          path="/owner/dashboard"
          element={
            <ProtectedRoute roles={[UserRole.OWNER]}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/halls"
          element={
            <ProtectedRoute roles={[UserRole.OWNER]}>
              <HallsListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/halls/new"
          element={
            <ProtectedRoute roles={[UserRole.OWNER]}>
              <HallRegistrationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/halls/:hallId/venues"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.MANAGER]}>
              <VenueManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/halls/:hallId/bookings"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.MANAGER]}>
              <BookingManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/halls/:hallId/staff"
          element={
            <ProtectedRoute roles={[UserRole.OWNER]}>
              <StaffManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/bookings"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.MANAGER]}>
              <OwnerBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/reports"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.MANAGER]}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/owner/settings"
          element={
            <ProtectedRoute roles={[UserRole.OWNER, UserRole.MANAGER]}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <HallApprovalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <UsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={[UserRole.ADMIN]}>
              <AdminSettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
