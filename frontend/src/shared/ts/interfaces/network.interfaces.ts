import { NetworkRow, NetworkUpdateData } from '../types';

export interface INetworkCreationDialogProps {
  open: boolean;
  handleClose: () => void;
  organizationId: string;
}

export interface INewNetworkPayload {
  name: string;
  network_type: string;
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
