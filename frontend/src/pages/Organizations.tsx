import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Breadcrumbs, Button, Grid, Paper, Typography } from "@mui/material";
import { GridActionsCellItem, GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { toast } from "react-toastify";
import { BreadcrumbLink, ConfirmationDialog, OrganizationList } from "../shared/components";
import { OrganizationDialog } from "../shared/components/OrganizationDialog";
import { useRemoveOrganizationMutation } from "../shared/store/slices/organization/organizationApiSlice";
import { DefaultApiError } from "../shared/ts/interfaces";
import { OrganizationRow } from "../shared/ts/types";


export const OrganizationsPage = () => {

  const [organizationDialogOpen, setOrganizationDialogOpen] = useState(false);
  const [orgFromAction, setOrgFromAction] = useState<OrganizationRow>();
  const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
  const [orgDialogOperation, setOrgDialogOperation] = useState<'create' | 'edit'>('create');
  const [removeOrganization] = useRemoveOrganizationMutation();

  const handleOpenOrganizationDialog = () => {
    setOrganizationDialogOpen(true);
  }

  const columns: GridColDef<OrganizationRow>[] = [
    { field: 'id', headerName: 'ID', flex: 0.4 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'numberOfUsers', headerName: 'Users', flex: 0.4 },
    { field: 'numberOfNetworks', headerName: 'Networks', flex: 0.4 },
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
          key="edit"
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEditOrg(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteOrgConfirmationRequired(params.row)}
        />,
      ],
    },
  ];

  const handleEditOrg = (organization: OrganizationRow) => {
    setOrgFromAction(organization);
    setOrgDialogOperation('edit');
    handleOpenOrgDialog();
  };

  const handleCloseConfirmation = () => {
    setConfirmationDialogOpen(false);
  };

  const handleDeleteOrgConfirmationRequired = (organization: OrganizationRow) => {
    setOrgFromAction(organization);
    setConfirmationDialogOpen(true);
  };

  const handleDeleteOrg = async () => {
    handleCloseConfirmation();
    try {
      const removeOrgResult = await removeOrganization(
        orgFromAction!.id
      ).unwrap();
      if (removeOrgResult) toast.success(removeOrgResult.message);
      handleCloseOrgDialog();
      return true;
    } catch (error) {
      const err = error as DefaultApiError;
      toast.error(err.detail.message);
      return false;
    }
  };

  const handleOpenOrgDialog = () => {
    setOrganizationDialogOpen(true);
  };

  const handleCloseOrgDialog = () => {
    setOrganizationDialogOpen(false);
    setOrgFromAction(undefined);
    setOrgDialogOperation('create');
  };

  return <Grid container gap={3} justifyContent="center" flexDirection="column">
    <Grid>
      <Breadcrumbs aria-label="breadcrumb">
        <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
        <Typography color="text.primary">Organizações</Typography>
      </Breadcrumbs>
    </Grid>
    <Grid>
      <Paper sx={{ p: 3 }}>
        <OrganizationList columns={columns}/>
        <OrganizationDialog
          open={organizationDialogOpen}
          handleClose={handleCloseOrgDialog}
          operation={orgDialogOperation}
          originalOrganizationData={orgFromAction}
        />
        <ConfirmationDialog
          open={confirmationDialogOpen}
          handleClose={handleCloseConfirmation}
          handleConfirm={handleDeleteOrg}
          title="Deseja mesmo remover a organização?"
          content="Ao remover a organização, todos as redes e dispositivos associados serão removidos."
          confirmButtonText="Remover"
          closeButtonText="Cancelar"
        />
        <Button
          variant="contained"
          sx={{
            width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
            mt: 2,
          }}
          onClick={handleOpenOrganizationDialog}
        >
          Criar organização
        </Button>
      </Paper>
    </Grid>
  </Grid>
}
