import { GridColDef } from '@mui/x-data-grid';
import { DeviceRow } from '../types';

export interface ActionExecutionPayload {
  action_name: string;
  payload: Record<string, any> | null;
}

export interface ActionSequencePayload {
  actions: ActionExecutionPayload[];
}

export interface ActionSequenceResponse {
  action: string;
  status: 'success' | 'failed';
  message: string;
  data?: any;
}

export interface ExecuteActionSequencePayload { deviceId: string; sequence: ActionSequencePayload }

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
  profileId: string;
}

export interface IDeviceListProps {
  organizationId: string;
  networkId?: string | null;
  columns: GridColDef<DeviceRow>[];
  loadingProfiles: boolean;
  loadingNetworks: boolean;
}

export interface IDeviceContextMenu {
  mouseX: number;
  mouseY: number;
  record: DeviceRow;
  target: HTMLElement;
}
