import { GridColDef } from '@mui/x-data-grid/models/colDef/gridColDef';
import { IOrganizationState } from '../interfaces';
import { OrganizationRow } from '../types';

export const InitialOrganizationState: IOrganizationState = {
  organization: null,
};

export const OrganizationSelectionColumns: GridColDef<OrganizationRow>[] = [
  { field: 'id', headerName: 'ID' },
  {
    field: 'name',
    headerName: 'Nome',
    width: 150,
  },
  {
    field: 'numberOfUsers',
    headerName: 'Qtd. de usuários',
    type: 'number',
    width: 130,
  },
  {
    field: 'numberOfNetworks',
    headerName: 'Qtd. de redes',
    type: 'number',
    width: 130,
  },
  {
    field: 'createdAt',
    headerName: 'Data de criação',
    width: 450,
  },
];
