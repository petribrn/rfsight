import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ConfirmationDialog,
  DeviceAdoptionDialog,
  DeviceEditDialog,
  DeviceList,
} from '../shared/components';
import { BreadcrumbLink } from '../shared/components/BreadcrumbLink';
import { useAppSelector } from '../shared/hooks';
import { useRemoveDeviceMutation } from '../shared/store/slices/device/deviceApiSlice';
import { useGetFullNetworksCollectionQuery } from '../shared/store/slices/network/networkApiSlice';
import { useGetProfilesCollectionQuery } from '../shared/store/slices/profile/profileApiSlice';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';
import { Permissions } from '../shared/ts/enums';
import { formatLatency, formatUptime } from '../shared/ts/helpers';
import { DefaultApiError } from '../shared/ts/interfaces';
import { DeviceRow } from '../shared/ts/types';

export const DevicesPage = () => {
  const [openAdoptionDialog, setOpenAdoptionDialog] = useState(false);
  const [opendEditDialog, setOpenEditDialog] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [deviceFromAction, setDeviceFromAction] = useState<DeviceRow>();
  const [removeDevice] = useRemoveDeviceMutation();
  const userInfo = useAppSelector(selectUserInfo);
  const navigate = useNavigate();
  const { data: profiles, isLoading: isLoadingProfiles } =
    useGetProfilesCollectionQuery();
  const {data: networks, isLoading: isLoadingNetworks} = useGetFullNetworksCollectionQuery();

  const getProfileName = (profileId: string) => {
    return profiles ? profiles.profiles
      .filter((profile) => profile.id === profileId)
      .map((profile) => profile.name)[0] : '';
  };

  const getNetworkName = (networkId: string) => {
    return networks ? networks.networks
      .filter((net) => net.id === networkId)
      .map((net) => net.name)[0] : '';
  };

  const DeviceListColumns: GridColDef<DeviceRow>[] = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'online',
      headerName: 'Status',
      flex: 0.3,
      renderCell: (params) => (params.row.online ? (
        <Tooltip title="ONLINE" sx={{
          height: '100%',
          alignItems: 'center'
        }}>
          <RadioButtonCheckedIcon color='success'/>
        </Tooltip>
      ):(
        <Tooltip title="OFFLINE" sx={{
          height: '100%',
          alignItems: 'center'
        }}>
          <RadioButtonUncheckedIcon color='error'/>
        </Tooltip>
      )

      )
    },
    {
      field: 'uptime',
      headerName: 'Uptime',
      flex: 0.4,
      valueFormatter: (value) => formatUptime(value),
    },
    {
      field: 'latency',
      headerName: 'Latência',
      flex: 0.4,
      valueFormatter: (value) => formatLatency(value),
    },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
    },
    {
      field: 'model',
      headerName: 'Modelo',
      flex: 0.4,
    },
    {
      field: 'mac_address',
      headerName: 'MAC',
      flex: 0.4,
      valueFormatter: (value: string) =>
        `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}:${value.slice(6, 8)}:${value.slice(8, 10)}:${value.slice(10)}`,
    },
    {
      field: 'ip_address',
      headerName: 'IP',
      flex: 0.4,
    },
    {
      field: 'network',
      headerName: 'Rede',
      flex: 0.4,
      valueFormatter: (value) => getNetworkName(value),
    },
    {
      field: 'profile',
      headerName: 'Profile',
      flex: 0.4,
      valueFormatter: (value) => getProfileName(value),
    },
    {
      field: 'fw_version',
      headerName: 'Versão de firmware',
      flex: 0.4,
    },
    {
      field: 'location',
      headerName: 'Localização',
      flex: 0.4,
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
      type: 'actions',
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="configure"
          icon={<SettingsIcon />}
          label="Configurar"
          onClick={() => handleConfigure(params.row)}
          disabled={!params.row.online || (userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission))}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          disabled={userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          disabled={userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
          onClick={() => handleDeleteDeviceConfirmationRequired(params.row)}
        />,
      ],
    },
  ];

  const handleOpenAdoptionDialog = () => {
    setOpenAdoptionDialog(true);
  };

  const handleCloseAdoptionDialog = () => {
    setOpenAdoptionDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
  }

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleDeleteDeviceConfirmationRequired = (device: DeviceRow) => {
    setDeviceFromAction(device);
    setConfirmationDialogOpen(true);
  };

  const handleConfigure = (device: DeviceRow) => {
    navigate(`/devices/${device.network}/${device.id}/configure`);
  };

  const handleEdit = (device: DeviceRow) => {
    setDeviceFromAction(device);
    setOpenEditDialog(true);
  }

  const handleDeleteDevice = async () => {
    handleCloseConfirmation();
    try {
      const removeDeviceResult = await removeDevice(
        deviceFromAction!.id
      ).unwrap();
      if (removeDeviceResult) toast.success(removeDeviceResult.message);
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <Typography color="text.primary">Dispositivos</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid>
        {userInfo ? (
          <>
            <Paper sx={{ p: 3 }}>
              <DeviceList
                organizationId={userInfo.organizationId}
                columns={DeviceListColumns}
                loadingNetworks={isLoadingNetworks}
                loadingProfiles={isLoadingProfiles}
              />
              <Button
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
                  mt: 2,
                }}
                onClick={handleOpenAdoptionDialog}
                disabled={![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
              >
                Adotar dispositivo
              </Button>
            </Paper>
            <DeviceAdoptionDialog
              open={openAdoptionDialog}
              handleClose={handleCloseAdoptionDialog}
              organizationId={userInfo.organizationId}
            />
            {deviceFromAction && <DeviceEditDialog open={opendEditDialog} handleClose={handleCloseEditDialog} deviceId={deviceFromAction?.id} organizationId={userInfo.organizationId}/>}
            <ConfirmationDialog
              open={confirmationDialogOpen}
              handleClose={handleCloseConfirmation}
              handleConfirm={handleDeleteDevice}
              title="Deseja mesmo remover o dispositivo?"
              content="Ao remover o dispositivo, você perderá o acesso a configuração e atualização por meio do gerenciador."
              confirmButtonText="Remover"
              closeButtonText="Cancelar"
            />
          </>
        ) : (
          <Backdrop
            sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
            open
          >
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
      </Grid>
    </Grid>
  );
};
