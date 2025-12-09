import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useGetNetworksCollectionByOrgQuery } from '../store/slices/network/networkApiSlice';
import { INetworkListProps } from '../ts/interfaces';
import { NetworkRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';



export const NetworkList = ({ organizationId, columns }: INetworkListProps) => {
  const { data: networkCollection, isLoading } =
    useGetNetworksCollectionByOrgQuery(organizationId);

  const [rows, setRows] = useState<Array<NetworkRow>>([]);

  useEffect(() => {
    if (networkCollection) {
      setRows(
        networkCollection.networks.map((net) => ({
          id: net.id,
          name: net.name,
          network_type: net.network_type,
          network_cidr: net.network_cidr,
          location: net.location,
          numberOfDevices: net.devices.length,
          createdAt: new Date(net.createdAt),
          updatedAt: new Date(net.updatedAt),
        }))
      );
    }
  }, [isLoading, networkCollection]);

  return (
    <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        autoHeight
        rowSelection={false}
        disableRowSelectionOnClick
        disableMultipleRowSelection
        disableColumnMenu
        disableColumnSelector
        loading={isLoading}
        sx={{
          [`& .${gridClasses.cell}:focus, & .${gridClasses.cell}:focus-within`]:
            {
              outline: 'none',
            },
          [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
            {
              outline: 'none',
            },
        }}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
        }}
        slots={{
          toolbar: DataGridToolbar,
          noResultsOverlay: CustomNoResultsOverlay,
          noRowsOverlay: CustomNoRowsOverlay,
        }}
        slotProps={{
          pagination: {
            labelDisplayedRows: ({
              from,
              to,
              count,
            }: {
              from: number;
              to: number;
              count: number;
            }) => `${from}-${to} de ${count}`,
          },
        }}
        pageSizeOptions={[5, 10, 20, 30]}
      />
    </Box>
  );
};
