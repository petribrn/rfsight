import { GridColDef } from '@mui/x-data-grid';
import { Dispatch, SetStateAction } from 'react';
import {
  ActionToEdit,
  ProfileAction,
  ProfileActions,
  ProfileRow,
  ProfileUpdateData,
} from '../types';

export interface IProfileList {
  columns: GridColDef<ProfileRow>[];
}

export interface IProfileDialogProps {
  open: boolean;
  handleClose: () => void;
  operation: 'create' | 'edit';
  originalProfileData?: ProfileRow;
}

export interface IProfileActionsListProps {
  actions: ProfileActions;
  setActions: Dispatch<SetStateAction<ProfileActions>>;
}

export interface IActionDialogProps {
  open: boolean;
  operation: 'create' | 'edit';
  actionToEdit?: ActionToEdit;
  handleClose: () => void;
  upsertAction: (
    originalName: string | undefined,
    newName: string,
    actionData: ProfileAction
  ) => void;
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
