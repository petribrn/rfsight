import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useGetProfilesCollectionQuery } from '../store/slices/profile/profileApiSlice';
import { IProfileList } from '../ts/interfaces';
import { ProfileRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';

export const ProfileList = ({ columns }: IProfileList) => {
  const { data: profileCollection, isLoading } =
    useGetProfilesCollectionQuery();

  const [rows, setRows] = useState<Array<ProfileRow>>([]);

  useEffect(() => {
    if (profileCollection) {
      setRows(
        profileCollection.profiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
          apiBaseUrl: profile.apiBaseUrl,
          actions: profile.actions,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt),
        }))
      );
    }
  }, [isLoading, profileCollection]);

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
