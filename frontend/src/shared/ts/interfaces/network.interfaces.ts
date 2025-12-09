import { GridColDef } from '@mui/x-data-grid';
import { NetworkRow, NetworkUpdateData } from '../types';

export interface INetworkListProps {
  organizationId: string;
  columns: GridColDef<NetworkRow>[];
}

export interface INetworkDialogProps {
  open: boolean;
  handleClose: () => void;
  operation: 'create' | 'edit';
  organizationId: string;
  originalNetworkData?: NetworkRow;
}

export interface INewNetworkPayload {
  name: string;
  network_type: string;
  network_cidr: string;
  location: string;
  devices?: Array<string>;
  organizationId: string;
}

export interface INetworkUpdatePayload {
  id: string;
  newNetworkData: NetworkUpdateData;
}

export interface INetworkContextMenu {
  mouseX: number;
  mouseY: number;
  record: NetworkRow;
  target: HTMLElement;
}
