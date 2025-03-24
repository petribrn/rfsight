import { Permissions } from '../enums';

export type UserPermission =
  | Permissions.Guest
  | Permissions.GuestMonitor
  | Permissions.GuestAdmin
  | Permissions.Monitor
  | Permissions.Admin
  | Permissions.Master;

export type DefaultResponse = {
  success: boolean;
  message: string;
};
