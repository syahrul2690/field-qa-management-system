import { Routes, Route, Navigate } from 'react-router-dom';
import { useInitAuth } from './hooks/useAuth';
import { AuthGuard } from './components/guards/AuthGuard';
import { RoleGuard } from './components/guards/RoleGuard';
import { AppLayout } from './components/layout/AppLayout';
import { Toast } from './components/ui/Toast';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { PendingApprovalPage } from './features/auth/PendingApprovalPage';

import { UserManagementPage } from './features/admin/UserManagementPage';
import { InstitutionManagementPage } from './features/admin/InstitutionManagementPage';

import { ProjectListPage } from './features/projects/ProjectListPage';
import { ProjectDetailPage } from './features/projects/ProjectDetailPage';
import { ProjectFormPage } from './features/projects/ProjectFormPage';
import { ProjectEditPage } from './features/projects/ProjectEditPage';

import { BoqTreePage } from './features/boq/BoqTreePage';

import { ReviewDashboard } from './features/reviews/ReviewDashboard';
import { ReviewDetailPage } from './features/reviews/ReviewDetailPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { DashboardPage } from './features/dashboard/DashboardPage';

export default function App() {
  useInitAuth();

  return (
    <>
      <Toast />
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />

        {/* Protected */}
        <Route path="/" element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Projects */}
          <Route path="projects" element={<ProjectListPage />} />
          <Route path="projects/new" element={
            <RoleGuard roles={['PIC_PROJECT', 'ADMIN']}><ProjectFormPage /></RoleGuard>
          } />
          <Route path="projects/:id" element={<ProjectDetailPage />} />
          <Route path="projects/:id/edit" element={
            <RoleGuard roles={['PIC_PROJECT', 'ADMIN']}><ProjectEditPage /></RoleGuard>
          } />
          <Route path="projects/:id/boq" element={<BoqTreePage />} />

          {/* Reviews — only roles that participate in the review workflow */}
          <Route path="reviews" element={
          <RoleGuard roles={['REVIEWER', 'CHECKER', 'APPROVER', 'PIC_CONSULTANT', 'PIC_ENGINEER']}>
              <ReviewDashboard />
            </RoleGuard>
          } />
          <Route path="reviews/:reviewId" element={
          <RoleGuard roles={['REVIEWER', 'CHECKER', 'APPROVER', 'PIC_CONSULTANT', 'PIC_ENGINEER']}>
              <ReviewDetailPage />
            </RoleGuard>
          } />

          {/* Profile */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Admin */}
          <Route path="admin/users" element={
            <RoleGuard roles={['ADMIN']}><UserManagementPage /></RoleGuard>
          } />
          <Route path="admin/institutions" element={
            <RoleGuard roles={['ADMIN']}><InstitutionManagementPage /></RoleGuard>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
