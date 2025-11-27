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
  ProfileDialog,
  ProfileList,
} from '../shared/components';
import { useAppSelector } from '../shared/hooks';
import { useRemoveProfileMutation } from '../shared/store/slices/profile/profileApiSlice';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';
import { Permissions } from '../shared/ts/enums';
import { DefaultApiError } from '../shared/ts/interfaces';
import { ProfileActions, ProfileRow } from '../shared/ts/types';

export const ProfilesPage = () => {
  const [openProfileDialog, setOpenProfileDialog] = useState(false);
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const userInfo = useAppSelector(selectUserInfo);
  const [profileFromAction, setProfileFromAction] = useState<ProfileRow>();
  const [profileDialogOperation, setProfileDialogOperation] = useState<
    'create' | 'edit'
  >('create');
  const [removeProfile] = useRemoveProfileMutation();

  const profileListColumns: GridColDef<ProfileRow>[] = [
    { field: 'id', headerName: 'ID' },
    {
      field: 'name',
      headerName: 'Nome',
      flex: 1,
    },
    {
      field: 'apiBaseUrl',
      headerName: 'URL base da API',
      flex: 0.4,
    },
    {
      field: 'actions',
      headerName: 'Qtd. de ações',
      type: 'number',
      valueFormatter: (value: ProfileActions) => Object.keys(value).length,
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
      field: 'rowActions',
      headerName: 'Ações',
      sortable: false,
      type: 'actions',
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          disabled={userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
          onClick={() => handleEditProfile(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          disabled={userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
          onClick={() => handleDeleteProfileConfirmationRequired(params.row)}
        />,
      ],
    },
  ];

  const handleEditProfile = (profile: ProfileRow) => {
    setProfileFromAction(profile);
    setProfileDialogOperation('edit');
    handleOpenProfileDialog();
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleDeleteProfileConfirmationRequired = (profile: ProfileRow) => {
    setProfileFromAction(profile);
    setConfirmationDialogOpen(true);
  };

  const handleDeleteProfile = async () => {
    handleCloseConfirmation();
    try {
      const removeProfileResult = await removeProfile(
        profileFromAction!.id
      ).unwrap();
      if (removeProfileResult) toast.success(removeProfileResult.message);
      handleCloseProfileDialog();
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  const handleOpenProfileDialog = () => {
    setOpenProfileDialog(true);
  };

  const handleCloseProfileDialog = () => {
    setOpenProfileDialog(false);
    setProfileFromAction(undefined);
    setProfileDialogOperation('create');
  };

  return (
    <Grid container gap={3} justifyContent="center" flexDirection="column">
      <Grid>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <Typography color="text.primary">Profiles</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid>
        {userInfo ? (
          <>
            <Paper sx={{ p: 3 }}>
              <ProfileList columns={profileListColumns} />
              <Button
                variant="contained"
                sx={{
                  width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
                  mt: 2,
                }}
                onClick={handleOpenProfileDialog}
                disabled={userInfo !== null && ![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)}
              >
                Criar profile
              </Button>
            </Paper>
            <ProfileDialog
              open={openProfileDialog}
              operation={profileDialogOperation}
              handleClose={handleCloseProfileDialog}
              originalProfileData={profileFromAction}
            />
            <ConfirmationDialog
              open={confirmationDialogOpen}
              handleClose={handleCloseConfirmation}
              handleConfirm={handleDeleteProfile}
              title="Deseja mesmo remover o profile?"
              content="Ao remover o profile, todos os dispositivos associados serão desativados."
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
