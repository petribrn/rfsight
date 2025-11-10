/* eslint-disable no-nested-ternary */
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Backdrop,
  Breadcrumbs,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { GridActionsCellItem, GridColDef } from '@mui/x-data-grid';
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
  BreadcrumbLink,
  ConfirmationDialog,
  NetworkDialog,
  NetworkList,
} from '../shared/components';
import { useAppSelector } from '../shared/hooks';
import { useRemoveNetworkMutation } from '../shared/store/slices/network/networkApiSlice';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';
import { DefaultApiError } from '../shared/ts/interfaces';
import { NetworkRow } from '../shared/ts/types';

export const NetworksPage = () => {
  const [openCreationDialog, setOpenCreationDialog] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const userInfo = useAppSelector(selectUserInfo);
  const [networkFromAction, setNetworkFromAction] = useState<NetworkRow>();
    const [networkDialogOperation, setnetworkDialogOperation] = useState<
      'create' | 'edit'
    >('create');
    const [removeNetwork] = useRemoveNetworkMutation();

  const networkListColumns: GridColDef<NetworkRow>[] = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
    },
    {
      field: 'network_type',
      headerName: 'Tipo',
      flex: 0.4,
    },
    {
      field: 'network_cidr',
      headerName: 'Tipo',
      flex: 0.4,
    },
    {
      field: 'location',
      headerName: 'Localização',
      flex: 0.4,
    },
    {
      field: 'numberOfDevices',
      headerName: 'Qtd. de dispositivos',
      type: 'number',
      flex: 0.4,
    },
    {
      field: 'createdAt',
      headerName: 'Data de criação',
      valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
      flex: 0.4,
    },
    {
      field: 'updatedAt',
      headerName: 'Data de atualização',
      valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
      flex: 0.4,
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
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEditNetwork(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteNetworkConfirmationRequired(params.row)}
        />,
      ],
    },
  ];

  const handleEditNetwork = (network: NetworkRow) => {
    setNetworkFromAction(network);
    setnetworkDialogOperation('edit');
    handleOpenNetworkDialog();
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleDeleteNetworkConfirmationRequired = (network: NetworkRow) => {
    setNetworkFromAction(network);
    setConfirmationDialogOpen(true);
  };

  const handleDeleteProfile = async () => {
    handleCloseConfirmation();
    try {
      const removeNetworkResult = await removeNetwork(
        networkFromAction!.id
      ).unwrap();
      if (removeNetworkResult) toast.success(removeNetworkResult.message);
      handleCloseNetworkDialog();
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  const handleOpenNetworkDialog = () => {
    setOpenCreationDialog(true);
  };

  const handleCloseNetworkDialog = () => {
    setOpenCreationDialog(false);
    setNetworkFromAction(undefined);
    setnetworkDialogOperation('create');
  };

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <Typography color="text.primary">Redes</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid>
        {userInfo ? (
          <>
            <Paper sx={{ p: 3 }}>
              <NetworkList organizationId={userInfo.organizationId} columns={networkListColumns} />
              <Button
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
                  mt: 2,
                }}
                onClick={handleOpenNetworkDialog}
              >
                Criar rede
              </Button>
            </Paper>
            <NetworkDialog
              open={openCreationDialog}
              handleClose={handleCloseNetworkDialog}
              operation={networkDialogOperation}
              organizationId={userInfo.organizationId}
              originalNetworkData={networkFromAction}
            />
            <ConfirmationDialog
              open={confirmationDialogOpen}
              handleClose={handleCloseConfirmation}
              handleConfirm={handleDeleteProfile}
              title="Deseja mesmo remover a rede?"
              content="Ao remover a rede, todos os dispositivos associados serão removidos."
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
