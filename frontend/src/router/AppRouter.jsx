import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { DashboardPage } from '../pages/DashboardPage';
import { HealthPage } from '../pages/HealthPage';
import { LoginPage } from '../pages/LoginPage';
import { ConnectionsPage } from '../pages/ConnectionsPage';
import { SystemPage } from '../pages/SystemPage';
import { QueriesPage } from '../pages/QueriesPage';
import { TxPage } from '../pages/TxPage';
import { BackupPage } from '../pages/BackupPage';
import { ReplicationPage } from '../pages/ReplicationPage';
import { CachePage } from '../pages/CachePage';
import { AlertsPage } from '../pages/AlertsPage';
import { BiPage } from '../pages/BiPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HealthPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ConnectionsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/system"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SystemPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route path="/queries" element={<ProtectedRoute><AppLayout><QueriesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/tx" element={<ProtectedRoute><AppLayout><TxPage /></AppLayout></ProtectedRoute>} />
      <Route path="/backups" element={<ProtectedRoute><AppLayout><BackupPage /></AppLayout></ProtectedRoute>} />
      <Route path="/replication" element={<ProtectedRoute><AppLayout><ReplicationPage /></AppLayout></ProtectedRoute>} />
      <Route path="/cache" element={<ProtectedRoute><AppLayout><CachePage /></AppLayout></ProtectedRoute>} />
      <Route path="/alerts" element={<ProtectedRoute><AppLayout><AlertsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/bi" element={<ProtectedRoute><AppLayout><BiPage /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
