import { Box } from '@mui/material';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useGetAllOrganizationsQuery } from '../store/slices/organization/organizationApiSlice';
import { OrganizationRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';

interface IProps {
  columns: GridColDef<OrganizationRow>[]
}

export const OrganizationList = ({ columns }: IProps) => {
  const { data: organizationCollection, isLoading } =
    useGetAllOrganizationsQuery();

  const [rows, setRows] = useState<Array<OrganizationRow>>([]);

  useEffect(() => {
    if (organizationCollection) {
      setRows(organizationCollection.organizations.map((org) => ({
        id: org.id,
        name: org.name,
        numberOfUsers: org.users.length,
        numberOfNetworks: org.networks.length,
        createdAt: new Date(org.createdAt),
        updatedAt: new Date(org.updatedAt),
      })))
    }
  }, [isLoading, organizationCollection])

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
}
