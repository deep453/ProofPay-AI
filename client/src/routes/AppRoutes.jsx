import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout
import AppLayout from '../components/layout/AppLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Client Pages
import ClientDashboard from '../pages/client/ClientDashboard';
import ClientMilestones from '../pages/client/Milestones';
import CreateMilestone from '../pages/client/CreateMilestone';
import MilestoneDetails from '../pages/client/MilestoneDetails';
import VerificationReview from '../pages/client/VerificationReview';
import ClientInvoices from '../pages/client/Invoices';
import ClientPayments from '../pages/client/Payments';

// Developer Pages
import DeveloperDashboard from '../pages/developer/DeveloperDashboard';
import AssignedMilestones from '../pages/developer/AssignedMilestones';
import SubmitWork from '../pages/developer/SubmitWork';
import VerificationResults from '../pages/developer/VerificationResults';
import DeveloperInvoices from '../pages/developer/Invoices';
import PaymentHistory from '../pages/developer/PaymentHistory';

// Shared Pages
import AuditHistory from '../pages/AuditHistory';
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Index Route Redirects to Current Role Dashboard */}
          <Route
            path="/"
            element={<Navigate to={`/${role}/dashboard`} replace />}
          />

          {/* Shared Pages */}
          <Route path="/audit" element={<AuditHistory />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />

          {/* Client Role Sub-routes */}
          <Route element={<RoleRoute allowedRole="client" />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/milestones" element={<ClientMilestones />} />
            <Route path="/client/milestones/create" element={<CreateMilestone />} />
            <Route path="/client/milestones/:id" element={<MilestoneDetails />} />
            <Route path="/client/verifications" element={<VerificationReview />} />
            <Route path="/client/invoices" element={<ClientInvoices />} />
            <Route path="/client/payments" element={<ClientPayments />} />
          </Route>

          {/* Developer Role Sub-routes */}
          <Route element={<RoleRoute allowedRole="developer" />}>
            <Route path="/developer/dashboard" element={<DeveloperDashboard />} />
            <Route path="/developer/milestones" element={<AssignedMilestones />} />
            <Route path="/developer/milestones/:id" element={<MilestoneDetails />} />
            <Route path="/developer/submit" element={<SubmitWork />} />
            <Route path="/developer/verifications" element={<VerificationResults />} />
            <Route path="/developer/invoices" element={<DeveloperInvoices />} />
            <Route path="/developer/payments" element={<PaymentHistory />} />
          </Route>
        </Route>
      </Route>

      {/* 404 Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
