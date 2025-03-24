/* eslint-disable react/no-unescaped-entities */
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
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
import { useCreateNewNetworkMutation } from '../store/slices/network/networkApiSlice';
import {
  DefaultApiError,
  INetworkCreationDialogProps,
  INewNetworkPayload,
} from '../ts/interfaces';
import {
  NetworkLocationSchema,
  NetworkNameSchema,
  NetworkSchema,
} from '../ts/validation';

const networkTypeOptions = ['Bridge'];

export const NetworkCreationDialog = ({
  open,
  handleClose,
  organizationId,
}: INetworkCreationDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewNetwork, { isLoading }] = useCreateNewNetworkMutation();

  // States
  const [name, setName] = useState('');
  const [networkType, setNetworkType] = useState(networkTypeOptions[0]);
  const [location, setLocation] = useState('');

  // Error states
  const [nameErr, setNameErr] = useState('');
  const [locationErr, setLocationErr] = useState('');
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

  const handleSelect = (event: SelectChangeEvent) => {
    setNetworkType(event.target.value as string);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    const newNetworkPayload: INewNetworkPayload = {
      name,
      network_type: networkType,
      location,
      organizationId,
    };

    const { error: validationError, value } = NetworkSchema.validate({
      ...newNetworkPayload,
    });

    if (validationError) {
      setSubmitErrMsg(validationError.message);
    }

    try {
      const createdNewNetwork =
        await createNewNetwork(newNetworkPayload).unwrap();
      if (createdNewNetwork) toast.success(createdNewNetwork.message);
      setName('');
      setLocation('');
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
        setLocation('');
        handleClose();
      }}
      onSubmit={handleSubmit}
      PaperProps={{
        component: 'form',
        sx: { p: 2, width: { xs: '80vw', sm: '80vw', md: '70vw', lg: '60vw' } },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="body1">Criar Rede</Typography>
          <Tooltip title="Fechar">
            <IconButton onClick={handleClose}>
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Preencha os dados da nova rede e clique em "Salvar".
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="name"
            label="Nome da rede"
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
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="location"
            label="Localização da rede"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                NetworkLocationSchema,
                setLocation,
                setLocationErr
              )
            }
            value={location}
            error={locationErr !== ''}
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
            {locationErr}
          </Typography>
        </Box>
        <FormControl sx={{ mt: 2, width: { xs: '50%' } }}>
          <InputLabel id="network-type-select-label" required>
            Tipo
          </InputLabel>
          <Select
            labelId="network-type-select-label"
            id="network-type-select"
            value={networkType}
            label="Tipo"
            required
            error={!networkType}
            onChange={handleSelect}
          >
            {networkTypeOptions.map((option) => (
              <MenuItem key={`${option}-select-item`} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
          disabled={!organizationId}
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
