import Box from '@mui/material/Box';
import { gridClasses } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid/DataGrid';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks';
import { useGetDeviceCollectionByOrganizationQuery } from '../store/slices/device/deviceApiSlice';
import { monitorSelectors } from '../store/slices/monitor/monitorSlice';
import { IDeviceListProps } from '../ts/interfaces';
import { DeviceRow } from '../ts/types';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';

export const DeviceList = ({
  organizationId,
  networkId = null,
  columns,
  loadingNetworks,
  loadingProfiles
}: IDeviceListProps) => {
  const { data: deviceCollection, isLoading } =
    useGetDeviceCollectionByOrganizationQuery({
      organizationId,
      networkId,
    });
  const monitorData = useAppSelector(monitorSelectors.selectEntities);

  const [rows, setRows] = useState<Array<DeviceRow>>([]);

  useEffect(() => {
    if (!deviceCollection) return;

    const mapped = deviceCollection.devices.map((device) => {
      const ws = monitorData ? monitorData[device.id] : null;
      const stats = ws?.stats || null;

      const isOnline = ws?.online ?? false;

      return {
        id: device.id,
        name: stats?.name || device.name,
        model: stats?.model || device.model,
        mac_address: device.mac_address,
        fw_version: stats?.fw_version || device.fw_version,
        ip_address: device.ip_address,
        network: device.networkId,
        profile: device.profileId,
        location: stats?.location || device.location,
        online: isOnline,
        latency: isOnline ? ws?.latency ?? undefined : undefined,
        uptime: isOnline ? stats?.uptime ?? 0 : 0,
        adoptionDate: new Date(device.createdAt),
        updatedAt: ws?.timestamp
          ? new Date(ws.timestamp)
          : new Date(device.updatedAt),
      };
    });

    setRows(mapped);
  }, [deviceCollection, monitorData]);

  useEffect(() => {
    if (!monitorData) return;

    setRows((prevRows) =>
      prevRows.map((row) => {
        const ws = monitorData[row.id];
        if (!ws) return row;

        const isOnline = ws.online ?? false;
        const stats = ws.stats || null;

        if (!isOnline) {
          return {
            ...row,
            online: false,
            latency: undefined,
            updatedAt: ws.timestamp ? new Date(ws.timestamp) : row.updatedAt,
          };
        }

        return {
          ...row,
          online: true,

          name: stats?.name || row.name,
          model: stats?.model || row.model,
          fw_version: stats?.fw_version || row.fw_version,
          location: stats?.location || row.location,

          latency: ws.latency ?? row.latency,
          uptime: stats?.uptime ?? row.uptime,

          updatedAt: ws.timestamp ? new Date(ws.timestamp) : row.updatedAt,
        };
      })
    );
  }, [monitorData]);

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
        columns={columns}
        autoHeight
        rowSelection={false}
        disableRowSelectionOnClick
        disableMultipleRowSelection
        disableColumnMenu
        disableColumnSelector
        loading={isLoading || loadingNetworks || loadingProfiles}
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
