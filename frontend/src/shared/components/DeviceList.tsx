import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useGetDeviceCollectionByOrganizationQuery } from '../store/slices/device/deviceApiSlice';
import { IDeviceContextMenu, IDeviceListProps } from '../ts/interfaces';
import { DeviceListColumns } from '../ts/states';
import { DeviceRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';
import { DeviceListCustomContextMenu } from './DeviceListCustomContextMenu';

export const DeviceList = ({
  organizationId,
  networkId = null,
}: IDeviceListProps) => {
  const { data: deviceCollection, isLoading } =
    useGetDeviceCollectionByOrganizationQuery({
      organizationId,
      networkId,
    });

  const [rows, setRows] = useState<Array<DeviceRow>>([]);
  const [contextMenu, setContextMenu] = useState<IDeviceContextMenu | null>(
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
    if (deviceCollection) {
      setRows(
        deviceCollection.devices.map((device) => ({
          id: device.id,
          name: device.name,
          model: device.model,
          mac_address: device.mac_address,
          fw_version: device.fw_version,
          ip_address: device.ip_address,
          network: device.networkId,
          location: device.location,
          online: false,
          adoptionDate: new Date(device.createdAt),
          updatedAt: new Date(device.updatedAt),
        }))
      );
    }
  }, [deviceCollection]);

  return (
    <Box
      sx={{
        width: '100%',
        display: 'grid',
        gap: 2,
      }}
    >
      <DataGrid
        rows={rows}
        columns={DeviceListColumns}
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
        <DeviceListCustomContextMenu
          mouseX={contextMenu.mouseX}
          mouseY={contextMenu.mouseY}
          rowData={contextMenu.record}
          target={contextMenu.target}
          setContextMenu={setContextMenu}
          removeConfirmationDialogProps={{
            title: `Deseja mesmo remover o dispositivo "${contextMenu.record.name}"?`,
            content:
              'Ao remover o dispositivo, você perderá o acesso a configuração e atualização por meio do gerenciador.',
            confirmButtonText: 'Remover',
            closeButtonText: 'Cancelar',
          }}
        />
      )}
    </Box>
  );
};
