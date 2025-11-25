import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Breadcrumbs, Button, Grid, Paper, Typography } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BreadcrumbLink, ConfirmationDialog, UserCreationDialog, UserList } from "../shared/components";
import { useRemoveUserMutation } from '../shared/store/slices/user/userApiSlice';
import { DefaultApiError } from '../shared/ts/interfaces';
import { UserRow } from "../shared/ts/types";


export const UsersPage = () => {

  const [userCreationDialogOpen, setUserCreationDialogOpen] = useState(false);
  const [userFromAction, setUserFromAction] = useState<UserRow>();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [removeUser] = useRemoveUserMutation();

  const navigate = useNavigate();

  const columns: GridColDef<UserRow>[] = [
    { field: 'id', headerName: 'ID', flex: 0.4 },
    { field: 'username', headerName: 'Usuário', flex: 0.6 },
    { field: 'email', headerName: 'E-mail', flex: 1 },
    { field: 'firstName', headerName: 'Nome', flex: 0.6 },
    { field: 'lastName', headerName: 'Sobrenome', flex: 0.6 },
    { field: 'permission', headerName: 'Permissão', flex: 0.4 },
    {
      field: 'organizationInfo',
      headerName: 'Organização',
      valueFormatter: (value: {name: string, organizationId: string}) => value?.name ?? '-',
      flex: 1,
    },
    {
      field: 'createdAt',
      headerName: 'Data de criação',
      valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
      flex: 0.6,
    },
    {
      field: 'updatedAt',
      headerName: 'Data de atualização',
      valueFormatter: (value: Date) => value.toLocaleString('pt-BR'),
      flex: 0.6,
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      type: 'actions',
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEditUser(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteUserConfirmationRequired(params.row)}
        />,
      ],
    },
  ];

  const handleEditUser = (user: UserRow) => {
    navigate(`/users/${user.username}`);
  }

  const handleOpenUserCreationDialog = () => {
    setUserCreationDialogOpen(true);
  }

  const handleCloseUserCreationDialog = () => {
    setUserCreationDialogOpen(false);
  }

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleDeleteUserConfirmationRequired = (user: UserRow) => {
    setUserFromAction(user);
    setConfirmationDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    handleCloseConfirmation();
    try {
      const removeUserResult = await removeUser(
        userFromAction!.id
      ).unwrap();
      if (removeUserResult) toast.success(removeUserResult.message);
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  return <Grid container gap={3} justifyContent="center" flexDirection="column">
    <Grid>
      <Breadcrumbs aria-label="breadcrumb">
        <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
        <Typography color="text.primary">Usuários</Typography>
      </Breadcrumbs>
    </Grid>
    <Grid>
      <Paper sx={{ p: 3 }}>
        <UserList columns={columns}/>
        <UserCreationDialog
          open={userCreationDialogOpen}
          handleClose={handleCloseUserCreationDialog}
        />
        <ConfirmationDialog
          open={confirmationDialogOpen}
          handleClose={handleCloseConfirmation}
          handleConfirm={handleDeleteUser}
          title="Deseja mesmo remover o usuário?"
          content="Ao remover o usuário, suas credenciais não terão mais acesso ao RFSight."
          confirmButtonText="Remover"
          closeButtonText="Cancelar"
        />
        <Button
          variant="contained"
          sx={{
            width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
            mt: 2,
          }}
          onClick={handleOpenUserCreationDialog}
        >
          Novo usuário
        </Button>
      </Paper>
    </Grid>
  </Grid>
}
