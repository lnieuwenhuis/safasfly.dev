import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { ErrorState } from './components/common/ErrorState';
import { LoadingState } from './components/common/LoadingState';
import { StagingAccessGate } from './components/guards/StagingAccessGate';
import { AdminLayout } from './components/layout/AdminLayout';
import { SiteLayout } from './components/layout/SiteLayout';
import { AdminAuthProvider } from './state/AdminAuthContext';
import { SiteDataProvider, useSiteData } from './state/SiteDataContext';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { InsightsPage } from './pages/InsightsPage';
import { LeadMagnetPage } from './pages/LeadMagnetPage';
import { MaintenanceAgreementPage } from './pages/MaintenanceAgreementPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';
import { TermsPage } from './pages/TermsPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

function PublicDataGate() {
  const { loading, error, refresh } = useSiteData();

  if (loading) {
    return <LoadingState label="Loading portfolio" />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return <Outlet />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicDataGate />}>
          <Route element={<SiteLayout />}>
            <Route index element={<HomePage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="free-audit" element={<LeadMagnetPage />} />
            <Route path="terms" element={<TermsPage />} />
            <Route path="privacy" element={<PrivacyPage />} />
            <Route path="maintenance-agreement" element={<MaintenanceAgreementPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        <Route element={<AdminLayout />}>
          <Route path="admin" element={<AdminLoginPage />} />
          <Route path="admin/dashboard" element={<AdminDashboardPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <StagingAccessGate>
      <AdminAuthProvider>
        <SiteDataProvider>
          <AppRouter />
        </SiteDataProvider>
      </AdminAuthProvider>
    </StagingAccessGate>
  );
}
