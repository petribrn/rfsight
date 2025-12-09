import { Permissions } from "../enums";

export const PermissionLabels: Record<Permissions, string> = {
  [Permissions.Guest]: 'Guest',
  [Permissions.GuestMonitor]: 'Guest Monitor',
  [Permissions.GuestAdmin]: 'Guest Admin',
  [Permissions.Monitor]: 'Monitor',
  [Permissions.Admin]: 'Admin',
  [Permissions.Master]: 'Master',
};
