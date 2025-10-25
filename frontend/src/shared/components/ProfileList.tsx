import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useGetProfilesCollectionQuery } from '../store/slices/profile/profileApiSlice';
import { IProfileContextMenu } from '../ts/interfaces/profile.interfaces';
import { ProfileListColumns } from '../ts/states/profiles.states';
import { ProfileRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';
import { ProfileListCustomContextMenu } from './ProfileListCustomContextMenu';

export const ProfileList = () => {
  const { data: profileCollection, isLoading } =
    useGetProfilesCollectionQuery();

  const [rows, setRows] = useState<Array<ProfileRow>>([]);
  const [contextMenu, setContextMenu] = useState<IProfileContextMenu | null>(
    null
  );

  const handleRowContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!event.currentTarget) {
      return;
    }
    const rowId = (event.currentTarget as HTMLDivElement).getAttribute(
      'data-id'
    );
    const record = rows.find((row) => row.id === rowId);

    if (!record) {
      return;
    }

    // open context menu
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX,
            mouseY: event.clientY,
            record,
            target: event.target as HTMLElement,
          }
        : null
    );
  };

  useEffect(() => {
    if (profileCollection) {
      setRows(
        profileCollection.profiles.map((profile) => ({
          id: profile.id,
          name: profile.name,
          numberOfActions: Object.keys(profile.actions).length,
          createdAt: new Date(profile.createdAt),
          updatedAt: new Date(profile.updatedAt)
        }))
      );
    }
  }, [isLoading, profileCollection]);

  console.log(rows)
  return (
    <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
      <DataGrid
        rows={rows}
        columns={ProfileListColumns}
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
            labelDisplayedRows: (paginationInfo) =>
              `${paginationInfo.from}-${paginationInfo.to} de ${paginationInfo.count}`,
          },
          row: {
            onContextMenu: handleRowContextMenu,
          },
        }}
        pageSizeOptions={[5, 10, 20, 30]}
      />
      {contextMenu && (
        <ProfileListCustomContextMenu
          mouseX={contextMenu.mouseX}
          mouseY={contextMenu.mouseY}
          rowData={contextMenu.record}
          target={contextMenu.target}
          setContextMenu={setContextMenu}
          removeConfirmationDialogProps={{
            title: `Deseja mesmo remover o profile "${contextMenu.record.name}"?`,
            content:
              'Ao remover o profile, todos os dispositivos associados serão desativados.',
            confirmButtonText: 'Remover',
            closeButtonText: 'Cancelar',
          }}
        />
      )}
    </Box>
  );
};
