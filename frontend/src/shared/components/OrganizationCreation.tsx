import { Backdrop, CircularProgress, useTheme } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Joi from 'joi';
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
import { useAppDispatch } from '../hooks';
import { useCreateNewOrganizationMutation } from '../store/slices/organization/organizationApiSlice';
import { useUpdateUserMutation } from '../store/slices/user/userApiSlice';
import { setUserInfo } from '../store/slices/user/userSlice';
import { DefaultApiError, INewOrganizationPayload } from '../ts/interfaces';
import { UserInfo } from '../ts/types';
import { OrganizationNameSchema, OrganizationSchema } from '../ts/validation';

interface OrganizationCreationProps {
  currentUserInfo: UserInfo;
}

export const OrganizationCreation = ({
  currentUserInfo,
}: OrganizationCreationProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewOrganization] = useCreateNewOrganizationMutation();
  const [updateUser] = useUpdateUserMutation();
  const dispatch = useAppDispatch();

  // States / Consts
  const [newOrgName, setNewOrgName] = useState('');
  const buttonCreateText = 'Criar organização';
  // Error states
  const [newOrgNameErr, setNewOrgNameErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  // Handlers
  const handleFieldChange = (
    v: string,
    fieldSchema: Joi.Schema,
    setFieldValue: Dispatch<SetStateAction<string>>,
    setFieldErr: Dispatch<SetStateAction<string>>
  ) => {
    setFieldValue(v);
    if (submitErrMsg) setSubmitErrMsg('');

    const { error, value } = fieldSchema.validate(v);

    if (error) {
      setFieldErr(error.message);
    } else {
      setFieldErr('');
    }
    return value;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newOrgPayload: INewOrganizationPayload = {
      name: newOrgName,
      users: [],
      networks: [],
    };

    const { error: validationError, value } =
      OrganizationSchema.validate(newOrgPayload);

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      // Create new organization
      const createdNewOrganization =
        await createNewOrganization(newOrgPayload).unwrap();

      // Change user organization to the newly created (auto updates organization user list in backend)
      await updateUser({
        id: currentUserInfo.id,
        updateUserData: {
          organizationId: createdNewOrganization.organizationId,
        },
      }).unwrap();

      // Update user slice state in store
      dispatch(
        setUserInfo({
          ...currentUserInfo,
          organizationId: createdNewOrganization.organizationId,
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
    <Box
      component="form"
      sx={{ width: '100%', display: 'grid', gap: 2 }}
      onSubmit={handleSubmit}
    >
      <Typography variant="body1">
        Preencha o nome da nova organização e clique em{' '}
        {`"${buttonCreateText}"`}.
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        width={{ xs: '100%', sm: '70%', md: '50%', lg: '40%' }}
      >
        <TextField
          id="newOrganizationName"
          label="Nome da organização"
          variant="outlined"
          autoFocus
          type="text"
          required
          size="small"
          onChange={(e) =>
            handleFieldChange(
              e.target.value,
              OrganizationNameSchema,
              setNewOrgName,
              setNewOrgNameErr
            )
          }
          value={newOrgName}
          error={newOrgNameErr !== ''}
        />
        <Typography
          variant="caption"
          color={theme.palette.error.main}
          m={0}
          fontSize="small"
          width="100%"
          align="left"
        >
          {newOrgNameErr}
        </Typography>
      </Box>
      <Button
        variant="contained"
        size="small"
        type="submit"
        sx={{
          width: { xs: '100%', sm: '40%', md: '30%', lg: '25%' },
        }}
        disabled={newOrgNameErr !== '' || !newOrgName}
      >
        Criar organização
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
