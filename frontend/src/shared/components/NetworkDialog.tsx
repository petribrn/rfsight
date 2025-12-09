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
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCreateNewNetworkMutation, useEditNetworkByIdMutation } from '../store/slices/network/networkApiSlice';
import {
  DefaultApiError,
  INetworkDialogProps,
  INetworkUpdatePayload,
  INewNetworkPayload,
} from '../ts/interfaces';
import {
  NetworkCidrSchema,
  NetworkLocationSchema,
  NetworkNameSchema,
  NetworkSchema,
  NetworkUpdateSchema,
} from '../ts/validation';

const networkTypeOptions = ['Bridge'];

export const NetworkDialog = ({
  open,
  handleClose,
  operation,
  organizationId,
  originalNetworkData
}: INetworkDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [createNewNetwork, { isLoading }] = useCreateNewNetworkMutation();
  const [editNetwork, { isLoading: isLoadingUpdate }] =
      useEditNetworkByIdMutation();

  // States
  const [name, setName] = useState(originalNetworkData ? originalNetworkData.name : '');
  const [networkCidr, setNetworkCidr] = useState(originalNetworkData ? originalNetworkData.network_cidr : '');
  const [networkType, setNetworkType] = useState(originalNetworkData ? originalNetworkData.network_type : networkTypeOptions[0]);
  const [location, setLocation] = useState(originalNetworkData ? originalNetworkData.location : '');

  // Error states
  const [nameErr, setNameErr] = useState('');
  const [networkCidrErr, setNetworkCidrErr] = useState('');
  const [locationErr, setLocationErr] = useState('');
  const [submitErrMsg, setSubmitErrMsg] = useState('');

  useEffect(() => {
      if (originalNetworkData) {
        setName(originalNetworkData.name ?? '');
        setNetworkCidr(originalNetworkData.network_cidr ?? '');
        setNetworkType(originalNetworkData.network_type ?? networkTypeOptions[0]);
        setLocation(originalNetworkData.location ?? '');
      }
    }, [originalNetworkData, open]);

  const setDefaultState = () => {
    setName('');
    setLocation('');
    setNetworkCidr('');
    setSubmitErrMsg('');
    setNameErr('');
    setLocationErr('');
    setNetworkCidrErr('');
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

  const handleSelect = (event: SelectChangeEvent) => {
    setNetworkType(event.target.value as string);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();

    if (operation === 'create') {
      const networkPayload: INewNetworkPayload = {
        name,
        network_type: networkType,
        network_cidr: networkCidr,
        location,
        organizationId,
      };

      const { error: validationError, value } = NetworkSchema.validate({
        ...networkPayload,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const createdNewNetwork =
          await createNewNetwork(networkPayload).unwrap();
        if (createdNewNetwork) toast.success(createdNewNetwork.message);
        setDefaultState();
        handleClose();
        return value;
      } catch (error) {
        const err = error as DefaultApiError;
        setSubmitErrMsg(err.detail.message);
        return false;
      }
    } else if (operation === 'edit') {
      const networkPayload: INetworkUpdatePayload = {
        id: originalNetworkData!.id,
        newNetworkData: {
          name,
          network_type: networkType,
          network_cidr: networkCidr,
          location,
          organizationId,
        }
      };

      const { error: validationError, value } = NetworkUpdateSchema.validate({
        ...networkPayload.newNetworkData,
      });

      if (validationError) {
        setSubmitErrMsg(validationError.message);
        return false;
      }

      try {
        const editedNetwork =
          await editNetwork(networkPayload).unwrap();
        if (editedNetwork) toast.success(editedNetwork.message);
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
          <Typography variant="body1">{operation === 'create' ? 'Criar' : 'Editar'} Rede</Typography>
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
            ? 'Preencha os dados da nova rede'
            : 'Altere os dados da rede'}{' '} e clique em "Salvar".
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
            id="cidr"
            label="CIDR da Rede"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                NetworkCidrSchema,
                setNetworkCidr,
                setNetworkCidrErr
              )
            }
            value={networkCidr}
            error={networkCidrErr !== ''}
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
            {networkCidrErr}
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
          disabled={!organizationId || !name || !networkCidr || !location || !networkType}
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
