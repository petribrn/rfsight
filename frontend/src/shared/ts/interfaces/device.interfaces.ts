import { DeviceRow } from '../types';

export interface IGetDeviceCollectionPayload {
  organizationId: string;
  networkId: string | null;
}

export interface IDeviceAdoptionDialogProps {
  open: boolean;
  handleClose: () => void;
  organizationId: string;
}

export interface IAdoptDevicePayload {
  mac_address: string | null;
  ip_address: string | null;
  user: string;
  password: string;
  networkId: string;
}

export interface IDeviceListProps {
  organizationId: string;
  networkId?: string | null;
}

export interface IDeviceContextMenu {
  mouseX: number;
  mouseY: number;
  record: DeviceRow;
  target: HTMLElement;
}
