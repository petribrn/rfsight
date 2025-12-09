import { Box } from '@mui/material';
import { DataGrid, gridClasses, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useGetAllUsersQuery } from '../store/slices/user/userApiSlice';
import { UserRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';

interface IProps {
  columns: GridColDef<UserRow>[]
}

export const UserList = ({ columns }: IProps) => {
  const { data: users, isLoading } =
    useGetAllUsersQuery();

  const [rows, setRows] = useState<Array<UserRow>>([]);

  useEffect(() => {
    if (users) {
      setRows(users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        permission: user.permission,
        organizationInfo: user.organizationInfo,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      })))
    }
  }, [isLoading, users])

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
