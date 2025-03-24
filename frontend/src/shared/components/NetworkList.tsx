import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useGetNetworksCollectionByOrgQuery } from '../store/slices/network/networkApiSlice';
import { INetworkContextMenu } from '../ts/interfaces';
import { NetworkListColumns } from '../ts/states';
import { NetworkRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';
import { NetworkListCustomContextMenu } from './NetworkListCustomContextMenu';

interface Props {
  organizationId: string;
}

export const NetworkList = ({ organizationId }: Props) => {
  const { data: networkCollection, isLoading } =
    useGetNetworksCollectionByOrgQuery(organizationId);

  const [rows, setRows] = useState<Array<NetworkRow>>([]);
  const [contextMenu, setContextMenu] = useState<INetworkContextMenu | null>(
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
    if (networkCollection) {
      setRows(
        networkCollection.networks.map((net) => ({
          id: net.id,
          name: net.name,
          network_type: net.network_type,
          location: net.location,
          numberOfDevices: net.devices.length,
          createdAt: new Date(net.createdAt),
        }))
      );
    }
  }, [isLoading, networkCollection]);

  return (
    <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
      <DataGrid
        rows={rows}
        columns={NetworkListColumns}
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
        <NetworkListCustomContextMenu
          mouseX={contextMenu.mouseX}
          mouseY={contextMenu.mouseY}
          rowData={contextMenu.record}
          target={contextMenu.target}
          setContextMenu={setContextMenu}
          removeConfirmationDialogProps={{
            title: `Deseja mesmo remover a rede "${contextMenu.record.name}"?`,
            content:
              'Ao remover a rede, a gerência de todos os dispositivos adotados nessa rede será perdida.',
            confirmButtonText: 'Remover',
            closeButtonText: 'Cancelar',
          }}
        />
      )}
    </Box>
  );
};
