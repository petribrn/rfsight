import { Typography } from '@mui/material';
import { Navigate, Route, Routes } from 'react-router-dom';
import {
  DashboardPage,
  DeviceConfigurationPage,
  DevicesPage,
  ForgotPasswordPage,
  NetworksPage,
  RegisterPage,
  ResetPasswordPage,
} from '../pages';
import { AuthPage } from '../pages/Auth';
import {
  PageWithSideMenu,
  PersistLogin,
  PrivateRoutes,
} from '../shared/components';
import { Permissions } from '../shared/ts/enums';

/**
 * Exports all app routes to components, defining url endpoints
 */

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password/" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<PersistLogin />}>
        <Route
          element={
            <PrivateRoutes
              allowedPermissions={[
                Permissions.Guest,
                Permissions.GuestAdmin,
                Permissions.GuestMonitor,
                Permissions.Admin,
                Permissions.Master,
              ]}
            />
          }
        >
          <Route
            path="/dashboard"
            element={<PageWithSideMenu pageContent={<DashboardPage />} />}
          />
          <Route
            path="/networks"
            element={<PageWithSideMenu pageContent={<NetworksPage />} />}
          />
          <Route
            path="/devices"
            element={<PageWithSideMenu pageContent={<DevicesPage />} />}
          />
          <Route
            path="/templates"
            element={
              <PageWithSideMenu
                pageContent={<Typography>Templates</Typography>}
              />
            }
          />
          <Route
            path="/users"
            element={
              <PageWithSideMenu pageContent={<Typography>Users</Typography>} />
            }
          />
          <Route
            path="/organizations"
            element={
              <PageWithSideMenu
                pageContent={<Typography>Organizations</Typography>}
              />
            }
          />
          <Route
            path="/devices/:deviceId/configure"
            element={
              <PageWithSideMenu pageContent={<DeviceConfigurationPage />} />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
