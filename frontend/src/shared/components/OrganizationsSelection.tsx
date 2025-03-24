import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks';
import { useGetAllOrganizationsQuery } from '../store/slices/organization/organizationApiSlice';
import { useUpdateUserMutation } from '../store/slices/user/userApiSlice';
import { setUserInfo } from '../store/slices/user/userSlice';
import { DefaultApiError } from '../ts/interfaces';
import { OrganizationSelectionColumns } from '../ts/states';
import { OrganizationRow, UserInfo } from '../ts/types';
import { OrganizationIdSchema } from '../ts/validation';
import { CustomNoResultsOverlay } from './CustomNoResultsOverlay';
import { CustomNoRowsOverlay } from './CustomNoRowsOverlay';
import { DataGridToolbar } from './DataGridToolbar';

interface OrganizationSelectionProps {
  currentUserInfo: UserInfo;
}

export const OrganizationsSelection = ({
  currentUserInfo,
}: OrganizationSelectionProps) => {
  // Hooks
  const { data: organizationCollection, isLoading } =
    useGetAllOrganizationsQuery();
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();

  // States / consts
  const [rows, setRows] = useState<Array<OrganizationRow>>([]);
  const [selectedOrg, setSelectedOrg] = useState<string | undefined>(undefined);
  const [submitErrMsg, setSubmitErrMsg] = useState('');
  const buttonSaveText = 'Salvar organização';

  useEffect(() => {
    if (rows && rows.length > 0) setSelectedOrg(rows[0].id);
  }, [rows]);

  useEffect(() => {
    if (!isLoading) {
      if (organizationCollection) {
        setRows(
          organizationCollection.organizations.map((org) => ({
            id: org.id,
            name: org.name,
            numberOfUsers: org.users.length,
            numberOfNetworks: org.networks.length,
            createdAt: new Date(org.createdAt),
          }))
        );
      }
    }
  }, [isLoading, organizationCollection]);

  const handleSelectOrg = async (e: React.MouseEvent) => {
    e.preventDefault();

    const { error: validationError, value } =
      OrganizationIdSchema.validate(selectedOrg);

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      // Change user organization to the newly created (auto updates organization user list in backend)
      await updateUser({
        id: currentUserInfo.id,
        updateUserData: { organizationId: selectedOrg },
      }).unwrap();

      // Update user slice state in store
      dispatch(
        setUserInfo({
          ...currentUserInfo,
          organizationId: value,
        })
      );
      toast.success(`Organização criada e usuário atualizado.`);
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  return currentUserInfo ? (
    <Box sx={{ width: '100%', display: 'grid', gap: 2 }}>
      <Typography>
        Selecione uma organização abaixo para entrar e clique em{' '}
        {`"${buttonSaveText}"`}.
      </Typography>
      <DataGrid
        rows={rows}
        columns={OrganizationSelectionColumns}
        autoHeight
        disableMultipleRowSelection
        disableColumnMenu
        rowSelectionModel={selectedOrg}
        onRowSelectionModelChange={(rowSelectionModel) => {
          if (rowSelectionModel.length > 0) {
            setSelectedOrg(rowSelectionModel[0].toString());
          }
        }}
        localeText={{
          footerRowSelected: (count) => `${count} organização selecionada`,
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
        }}
        pageSizeOptions={[5, 10, 20, 30]}
        checkboxSelection
      />
      <Button
        variant="contained"
        sx={{
          width: { xs: '100%', sm: '40%', md: '35%', lg: '25%' },
        }}
        disabled={!(rows.length > 0) || !selectedOrg}
        onClick={handleSelectOrg}
      >
        {buttonSaveText}
      </Button>
      <Alert
        severity="error"
        variant="outlined"
        sx={{ marginTop: '1rem', display: submitErrMsg ? 'flex' : 'none' }}
      >
        {submitErrMsg}
      </Alert>
    </Box>
  ) : (
    <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
