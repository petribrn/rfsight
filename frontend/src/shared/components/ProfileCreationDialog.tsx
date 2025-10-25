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
import { Dispatch, SetStateAction, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateNewProfileMutation } from '../store/slices/profile/profileApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import {
  INewProfilePayload,
  IProfileCreationDialogProps,
} from '../ts/interfaces/profile.interfaces';
import { ProfileActions } from '../ts/types';
import { NetworkSchema, ProfileNameSchema } from '../ts/validation';
import { ProfileActionsList } from './ProfileActionsList';

export const ProfileCreationDialog = ({
  open,
  handleClose,
}: IProfileCreationDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewProfile, { isLoading }] = useCreateNewProfileMutation();

  // States
  const [name, setName] = useState('');
  const [actions, setActions] = useState<ProfileActions>({});

  // Error states
  const [nameErr, setNameErr] = useState('');
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

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    const newNetworkPayload: INewProfilePayload = {
      name,
      actions,
    };

    const { error: validationError, value } = NetworkSchema.validate({
      ...newNetworkPayload,
    });

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      const createdNewProfile =
        await createNewProfile(newNetworkPayload).unwrap();
      if (createdNewProfile) toast.success(createdNewProfile.message);
      setName('');
      handleClose();
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setSubmitErrMsg(err.detail.message);
      return false;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setName('');
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
          <Typography variant="body1">Criar Profile</Typography>
          <Tooltip title="Fechar">
            <IconButton
              onClick={() => {
                setName('');
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
          Preencha os dados do novo profile e clique em "Salvar".
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
          <ProfileActionsList actions={actions} />
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
        open={isLoading}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  );
};
