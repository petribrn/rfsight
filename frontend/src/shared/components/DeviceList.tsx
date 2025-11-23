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
}: IDeviceListProps) => {
  const { data: deviceCollection, isLoading } =
    useGetDeviceCollectionByOrganizationQuery({
      organizationId,
      networkId,
    });
  const monitorData = useAppSelector(monitorSelectors.selectEntities);

  const [rows, setRows] = useState<Array<DeviceRow>>([]);

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
          profile: device.profileId,
          location: device.location,
          online: false,
          adoptionDate: new Date(device.createdAt),
          updatedAt: new Date(device.updatedAt),
        }))
      );
    }
  }, [deviceCollection]);

  useEffect(() => {
    if (!monitorData) return;

    setRows((prevRows) =>
      prevRows.map((row) => {
        const ws = monitorData[row.id];
        if (!ws) return row;

        return {
          ...row,
          online: ws.online,
          latency: ws.latency,
          updatedAt: ws.timestamp ? new Date(ws.timestamp) : row.updatedAt,
          // IP might also be in stats (depends on backend)
          ip_address: row.ip_address,
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
