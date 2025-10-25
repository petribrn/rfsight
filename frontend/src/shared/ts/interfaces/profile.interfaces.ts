import { ProfileActions, ProfileRow, ProfileUpdateData } from '../types';

export interface IProfileCreationDialogProps {
  open: boolean;
  handleClose: () => void;
}

export interface INewProfilePayload {
  name: string;
  actions: ProfileActions;
}

export interface IProfileUpdatePayload {
  id: string;
  newProfileData: ProfileUpdateData;
}

export interface IProfileContextMenu {
  mouseX: number;
  mouseY: number;
  record: ProfileRow;
  target: HTMLElement;
}
