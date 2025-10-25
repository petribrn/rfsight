/* eslint-disable no-restricted-globals */
export enum ApiRoutes {
  Login = '/auth/login',
  Refresh = '/auth/refresh',
  Logout = '/auth/logout',
  ForgotPassword = '/auth/forgot-password',
  ResetPassword = '/auth/reset-password',
  Register = '/users/new',
  Organizations = '/organizations',
  Users = '/users',
  Networks = '/networks',
  Devices = '/devices',
  Profiles = '/profiles',
  Configurations = '/configurations',
}

const host = location.hostname;

export const backendUrl = `https://${host}/backend`;
