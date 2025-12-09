import { GridColDef } from '@mui/x-data-grid';
import { NetworksActionsMenu } from '../../components/NetworkActionsMenu';
import { NetworkRow } from '../types';

export const NetworkListColumns: GridColDef<NetworkRow>[] = [
  { field: 'id', headerName: 'ID' },
  {
    field: 'name',
    headerName: 'Nome',
    width: 150,
  },
  {
    field: 'network_type',
    headerName: 'Tipo',
    width: 130,
  },
  {
    field: 'network_cidr',
    headerName: 'Tipo',
    width: 130,
  },
  {
    field: 'location',
    headerName: 'Localização',
    width: 130,
  },
  {
    field: 'numberOfDevices',
    headerName: 'Qtd. de dispositivos',
    type: 'number',
    width: 150,
  },
  {
    field: 'createdAt',
    headerName: 'Data de criação',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
  },
  {
    field: 'actions',
    headerName: 'Ações',
    sortable: false,
    renderCell: NetworksActionsMenu,
  },
];
