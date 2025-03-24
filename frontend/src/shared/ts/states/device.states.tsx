import { GridColDef } from '@mui/x-data-grid';
import { DeviceActionsMenu } from '../../components/DeviceActionsMenu';
import { DeviceRow } from '../types';

export const DeviceListColumns: GridColDef<DeviceRow>[] = [
  { field: 'id', headerName: 'ID' },
  {
    field: 'name',
    headerName: 'Nome',
    width: 150,
  },
  {
    field: 'model',
    headerName: 'Modelo',
    width: 130,
  },
  {
    field: 'mac_address',
    headerName: 'MAC',
    width: 140,
    valueFormatter: (value: string) =>
      `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}:${value.slice(6, 8)}:${value.slice(8, 10)}:${value.slice(10)}`,
  },
  {
    field: 'ip_address',
    headerName: 'IP',
    width: 130,
  },
  {
    field: 'fw_version',
    headerName: 'Versão de firmware',
    width: 130,
  },
  {
    field: 'network',
    headerName: 'Rede',
    width: 130,
  },
  {
    field: 'location',
    headerName: 'Localização',
    width: 130,
  },
  {
    field: 'online',
    headerName: 'Status',
    width: 130,
    valueFormatter: (value) => (value ? 'ONLINE' : 'OFFLINE'),
  },
  {
    field: 'adoptionDate',
    headerName: 'Data de adoção',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
  },
  {
    field: 'updatedAt',
    headerName: 'Data de atualização',
    valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
  },
  {
    field: 'actions',
    headerName: 'Ações',
    sortable: false,
    renderCell: DeviceActionsMenu,
  },
];
