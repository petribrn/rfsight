/* eslint-disable react/no-unescaped-entities */
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme
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
import { useChangeOrganizationNameMutation, useCreateNewOrganizationMutation } from '../store/slices/organization/organizationApiSlice';
import {
  DefaultApiError,
  INewOrganizationPayload,
  IOrganizationDialogProps,
  IOrgUpdate
} from '../ts/interfaces';
import {
  NetworkNameSchema,
  OrganizationSchema,
  OrganizationUpdateSchema
} from '../ts/validation';

export const OrganizationDialog = ({
  open,
  handleClose,
  operation,
  originalOrganizationData
}: IOrganizationDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewOrg, { isLoading }] = useCreateNewOrganizationMutation();
  const [editOrg, { isLoading: isLoadingUpdate }] =
      useChangeOrganizationNameMutation();

  // States
  const [name, setName] = useState(originalOrganizationData ? originalOrganizationData.name : '');
  // Error states
  const [nameErr, setNameErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  useEffect(() => {
      if (originalOrganizationData) {
        setName(originalOrganizationData.name ?? '');
      }
    }, [originalOrganizationData, open]);

  const setDefaultState = () => {
    setName('');
    setNameErr('');
    setSubmitErrMsg('');
  }

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
      const organizationPayload: INewOrganizationPayload = {
        name,
        users: [],
        networks: [],
      };

      const { error: validationError, value } = OrganizationSchema.validate({
        ...organizationPayload,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const createdNewOrg =
          await createNewOrg(organizationPayload).unwrap();
        if (createdNewOrg) toast.success('Organização criada.');
        setDefaultState();
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    } else if (operation === 'edit') {
      const organizationPayload: IOrgUpdate = {
        organizationId: originalOrganizationData!.id,
        name
      };

      const { error: validationError, value } = OrganizationUpdateSchema.validate(organizationPayload);

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const editedOrg =
          await editOrg(organizationPayload).unwrap();
        if (editedOrg) toast.success(editedOrg.message);
        setDefaultState();
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
        setDefaultState();
        handleClose();
      }}
      onSubmit={handleSubmit}
      slotProps={{paper: {
        component: 'form',
        sx: { p: 2, width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' } },
      }}}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">{operation === 'create' ? 'Criar' : 'Editar'} Organização</Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={() => {
              setDefaultState();
              handleClose();
            }}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
        {operation === 'create'
            ? 'Preencha os dados da nova organização'
            : 'Altere os dados da organização'}{' '} e clique em "Salvar".
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="name"
            label="Nome da organização"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                NetworkNameSchema,
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
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
          disabled={!name}
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
