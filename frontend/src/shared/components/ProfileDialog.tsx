/* eslint-disable react/no-unescaped-entities */
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Joi from 'joi';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  useCreateNewProfileMutation,
  useEditProfileByIdMutation,
} from '../store/slices/profile/profileApiSlice';
import {
  DefaultApiError,
  INewProfilePayload,
  IProfileDialogProps,
  IProfileUpdatePayload,
} from '../ts/interfaces';
import { ProfileActions } from '../ts/types';
import {
  ProfileNameSchema,
  ProfileSchema,
  ProfileUpdateSchema,
} from '../ts/validation';
import { ProfileActionsList } from './ProfileActionsList';

export const ProfileDialog = ({
  open,
  handleClose,
  operation,
  originalProfileData,
}: IProfileDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewProfile, { isLoading }] = useCreateNewProfileMutation();
  const [editProfile, { isLoading: isLoadingUpdate }] =
    useEditProfileByIdMutation();

  // States
  const [name, setName] = useState(
    originalProfileData ? originalProfileData.name : ''
  );
  const [actions, setActions] = useState<ProfileActions>(
    originalProfileData ? originalProfileData.actions : {}
  );

  // Error states
  const [nameErr, setNameErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  useEffect(() => {
    if (originalProfileData) {
      setName(originalProfileData.name);
      setActions(originalProfileData.actions);
    }
  }, [originalProfileData, open]);

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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();

    if (operation === 'create') {
      const profilePayload: INewProfilePayload = {
        name,
        actions,
      };

      const { error: validationError, value } = ProfileSchema.validate({
        ...profilePayload,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const createdNewProfile =
          await createNewProfile(profilePayload).unwrap();
        if (createdNewProfile) toast.success(createdNewProfile.message);
        setName('');
        setNameErr('');
        setActions({});
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    } else if (operation === 'edit') {
      const profilePayload: IProfileUpdatePayload = {
        id: originalProfileData!.id,
        newProfileData: {
          name,
          actions,
        },
      };

      const { error: validationError, value } = ProfileUpdateSchema.validate({
        ...profilePayload.newProfileData,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const editedProfile = await editProfile(profilePayload).unwrap();
        if (editedProfile) toast.success(editedProfile.message);
        setName('');
        setNameErr('');
        setActions({});
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setName('');
        setActions({});
        setNameErr('');
        handleClose();
      }}
      onSubmit={handleSubmit}
      slotProps={{
        paper: {
          component: 'form',
          sx: {
            p: 2,
            width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' },
          },
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">
            {operation === 'create' ? 'Criar' : 'Editar'} Profile
          </Typography>
          <Tooltip title="Fechar">
            <IconButton
              onClick={() => {
                setName('');
                setActions({});
                setNameErr('');
                handleClose();
              }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {operation === 'create'
            ? 'Preencha os dados do novo profile'
            : 'Altere os dados do profile'}{' '}
          e clique em "Salvar".
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="name"
            label="Nome do profile"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                ProfileNameSchema,
                setName,
                setNameErr
              )
            }
            value={name}
            error={nameErr !== ''}
            required
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {nameErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <ProfileActionsList actions={actions} setActions={setActions} />
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
          disabled={!name || !(Object.keys(actions).length > 0)}
        >
          Salvar
        </Button>
        <Alert
          severity="error"
          variant="outlined"
          sx={{ marginTop: '1rem', display: submitErrMsg ? 'flex' : 'none' }}
        >
          {submitErrMsg}
        </Alert>
      </DialogContent>
      <Backdrop
        sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }}
        open={isLoading || isLoadingUpdate}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};
