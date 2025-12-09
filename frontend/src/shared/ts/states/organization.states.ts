import { GridColDef } from '@mui/x-data-grid';
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
    flex: 1
  },
  {
    field: 'numberOfUsers',
    headerName: 'Qtd. de usuários',
    type: 'number',
    flex: 0.4
  },
  {
    field: 'numberOfNetworks',
    headerName: 'Qtd. de redes',
    type: 'number',
    flex: 0.4
  },
  {
    field: 'createdAt',
    headerName: 'Data de criação',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
    flex: 0.4,
  },
  {
    field: 'updatedAt',
    headerName: 'Data de atualização',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
    flex: 0.4,
  },
];
