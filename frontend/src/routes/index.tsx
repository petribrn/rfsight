import { Navigate, Route, Routes } from 'react-router-dom';
import {
  DashboardPage,
  DeviceConfigurationPage,
  DevicesPage,
  ForgotPasswordPage,
  NetworksPage,
  OrganizationsPage,
  ProfilesPage,
  ResetPasswordPage,
  UsersPage
} from '../pages';
import { AuthPage } from '../pages/Auth';
import { ManageUserPage } from '../pages/ManageUser';
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
      {/* <Route path="/register" element={<RegisterPage />} /> */}
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
                Permissions.Monitor,
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
            path="/profiles"
            element={
              <PageWithSideMenu
                pageContent={<ProfilesPage />}
              />
            }
          />
          <Route
            path="/users"
            element={
              <PageWithSideMenu pageContent={<UsersPage />} />
            }
          />
          <Route
            path="/organizations"
            element={
              <PageWithSideMenu
                pageContent={<OrganizationsPage />}
              />
            }
          />
        </Route>
        <Route
          element={
            <PrivateRoutes
              allowedPermissions={[
                Permissions.GuestAdmin,
                Permissions.Admin,
                Permissions.Master,
              ]}
            />
          }
        >
          <Route
            path="/devices/:networkId/:deviceId/configure"
            element={
              <PageWithSideMenu pageContent={<DeviceConfigurationPage />} />
            }
          />
          <Route
            path="/users/:username"
            element={
              <PageWithSideMenu pageContent={<ManageUserPage />} />
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/auth" />} />
    </Routes>
  );
}
