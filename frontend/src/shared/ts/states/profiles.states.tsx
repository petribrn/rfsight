import { GridColDef } from '@mui/x-data-grid';
import { ProfileActionsMenu } from '../../components';
import { ProfileRow } from '../types';

export const ProfileListColumns: GridColDef<ProfileRow>[] = [
  { field: 'id', headerName: 'ID' },
  {
    field: 'name',
    headerName: 'Nome',
    flex: 1
  },
  {
    field: 'numberOfActions',
    headerName: 'Qtd. de ações',
    type: 'number',
    flex: 0.4
  },
  {
    field: 'createdAt',
    headerName: 'Data de criação',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
    flex: 0.4
  },
  {
    field: 'updatedAt',
    headerName: 'Data de atualização',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
    flex: 0.4
  },
  {
    field: 'actions',
    headerName: 'Ações',
    sortable: false,
    renderCell: ProfileActionsMenu,
  },
];
