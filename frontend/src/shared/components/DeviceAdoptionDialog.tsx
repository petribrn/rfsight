/* eslint-disable react/no-unescaped-entities */
import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Backdrop,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
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
import { useAdoptDeviceMutation } from '../store/slices/device/deviceApiSlice';
import { useGetNetworksCollectionByOrgQuery } from '../store/slices/network/networkApiSlice';
import { useGetProfilesCollectionQuery } from '../store/slices/profile/profileApiSlice';
import {
  DefaultApiError,
  IAdoptDevicePayload,
  IDeviceAdoptionDialogProps,
} from '../ts/interfaces';
import {
  DeviceAdoptSchema,
  DeviceIpAddressSchema,
  DeviceMACAddressSchema,
  DevicePasswdSchema,
  DeviceUserSchema,
} from '../ts/validation';
import { IPAddressTextMask } from './IPAddressTextMask';
import { MacAddressTextMask } from './MacAddressTextMask';

export const DeviceAdoptionDialog = ({
  open,
  handleClose,
  organizationId,
}: IDeviceAdoptionDialogProps) => {
  // Hooks
  const theme = useTheme();
  const [adoptDevice, { isLoading }] = useAdoptDeviceMutation();
  const { data: networks, isLoading: isLoadingOrgNetworks } =
    useGetNetworksCollectionByOrgQuery(organizationId, {
      skip: !organizationId,
    });
  const { data: profiles, isLoading: isLoadingProfiles } =
    useGetProfilesCollectionQuery();

  // States
  const [macAddress, setMacAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [useIpAddress, setUseIpAddress] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedProfile, setSelectedProfile] = useState('');

  // Error states
  const [macAddressErr, setMacAddressErr] = useState('');
  const [ipAddressErr, setIpAddressErr] = useState('');
  const [userErr, setUserErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [adoptErrMsg, setAdoptErrMsg] = useState('');

  useEffect(() => {
    if (!isLoadingOrgNetworks) {
      if (networks && networks.networks.length > 0 ) {
        setSelectedNetwork(networks.networks[0].id);
      }
    }
    if (!isLoadingProfiles) {
      if (profiles && profiles.profiles.length > 0) {
        setSelectedProfile(profiles.profiles[0].id);
      }
    }
  }, [isLoadingOrgNetworks, isLoadingProfiles, networks, profiles]);


  const setDefaultState = () => {
    setMacAddress('');
    setIpAddress('');
    setUser('');
    setPassword('');
    setUseIpAddress(false);
    setSelectedNetwork('');
    setSelectedProfile('');
  }

  // Handlers
  const handleFieldChange = (
    v: string,
    fieldSchema: Joi.Schema,
    setFieldValue: Dispatch<SetStateAction<string>>,
    setFieldErr: Dispatch<SetStateAction<string>>
  ) => {
    setFieldValue(v);
    if (adoptErrMsg) setAdoptErrMsg('');

    const { error, value } = fieldSchema.validate(v);

    if (error) {
      setFieldErr(error.message);
    } else {
      setFieldErr('');
    }
    return value;
  };

  const handleSelectNetwork = (event: SelectChangeEvent) => {
    setSelectedNetwork(event.target.value as string);
  };

  const handleSelectProfile = (event: SelectChangeEvent) => {
    setSelectedProfile(event.target.value as string);
  };

  const handleUseIpAddress = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseIpAddress(event.target.checked);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement | HTMLDivElement>
  ) => {
    e.preventDefault();

    if (adoptErrMsg) setAdoptErrMsg('');

    const adoptDevicePayload: IAdoptDevicePayload = {
      mac_address: macAddress === '' ? null : macAddress.toUpperCase(),
      ip_address: ipAddress === '' ? null : ipAddress,
      user,
      password,
      networkId: selectedNetwork,
      profileId: selectedProfile,
    };

    const { error: validationError, value } = DeviceAdoptSchema.validate({
      ...adoptDevicePayload,
    });

    if (!macAddress && !useIpAddress) {
      setAdoptErrMsg('É necessário informar um Endereço MAC ou IP.');
      setMacAddressErr('Defina um endereço MAC ou um endereço IP abaixo.');
      return false;
    }
    if (useIpAddress && !ipAddress) {
      setAdoptErrMsg('É necessário informar um IP.');
      setIpAddressErr('Defina um endereço IP.');
      return false;
    }

    if (validationError) {
      setAdoptErrMsg(validationError.message);
      return false;
    }

    try {
      const adoptDeviceResult = await adoptDevice(adoptDevicePayload).unwrap();
      if (adoptDeviceResult) toast.success(adoptDeviceResult.message);
      setDefaultState();
      handleClose();
      return value;
    } catch (error) {
      const err = error as DefaultApiError;
      setAdoptErrMsg(err.detail.message);
      return false;
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
          <Typography variant="body1">Adotar dispositivo</Typography>
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
          Preencha os dados do dispositivo e clique em "Adotar".
        </DialogContentText>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="macAddress"
            label="Endereço MAC"
            variant="outlined"
            fullWidth
            autoFocus
            autoComplete="new-password"
            type="text"
            required={!useIpAddress}
            placeholder="Ex.: 12:31:23:12:31:23"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                DeviceMACAddressSchema,
                setMacAddress,
                setMacAddressErr
              )
            }
            slotProps={{
              input: {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                inputComponent: MacAddressTextMask as any,
              },
            }}
            value={macAddress}
            error={macAddressErr !== ''}
          />
          <Typography
            variant="caption"
            color={theme.palette.error.main}
            m={0}
            fontSize="small"
            width="100%"
            align="left"
          >
            {macAddressErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <FormControlLabel
            control={
              <Checkbox checked={useIpAddress} onChange={handleUseIpAddress} />
            }
            label="Utilizar Endereço IP?"
          />
        </Box>
        {useIpAddress && (
          <Box display="flex" flexDirection="column" mt={2}>
            <TextField
              id="ipAddress"
              label="Endereço IP"
              variant="outlined"
              fullWidth
              autoComplete="new-password"
              type="text"
              required={useIpAddress}
              placeholder="Ex.: 192.168.6.100"
              onChange={(e) =>
                handleFieldChange(
                  e.target.value,
                  DeviceIpAddressSchema,
                  setIpAddress,
                  setIpAddressErr
                )
              }
              slotProps={{
                input: {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  inputComponent: IPAddressTextMask as any,
                },
              }}
              value={ipAddress}
              error={ipAddressErr !== ''}
            />
            <Typography
              variant="caption"
              color={theme.palette.error.main}
              m={0}
              fontSize="small"
              width="100%"
              align="left"
            >
              {ipAddressErr}
            </Typography>
          </Box>
        )}
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="user"
            label="Usuário do dispositivo"
            variant="outlined"
            fullWidth
            autoComplete="new-password"
            type="text"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                DeviceUserSchema,
                setUser,
                setUserErr
              )
            }
            value={user}
            error={userErr !== ''}
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
            {userErr}
          </Typography>
        </Box>
        <Box display="flex" flexDirection="column" mt={2}>
          <TextField
            id="password"
            label="Senha do dispositivo"
            variant="outlined"
            fullWidth
            autoComplete="new-password"
            type="password"
            onChange={(e) =>
              handleFieldChange(
                e.target.value,
                DevicePasswdSchema,
                setPassword,
                setPasswordErr
              )
            }
            value={password}
            error={passwordErr !== ''}
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
            {passwordErr}
          </Typography>
        </Box>
        <Box display={'flex'} gap={1} flexDirection={'row'}>
          {!isLoadingOrgNetworks && networks ? (
            <FormControl required sx={{ mt: 2, width: { xs: '50%' } }}>
              <InputLabel id="network-type-select-label" disabled={networks.networks.length < 1} required>
                Rede
              </InputLabel>
              <Select
                labelId="network-type-select-label"
                id="network-type-select"
                value={selectedNetwork}
                label="Rede"
                required
                disabled={networks.networks.length < 1}
                onChange={handleSelectNetwork}
              >
                {networks.networks.map((option) => (
                  <MenuItem key={`${option.id}-select-item`} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Skeleton />
          )}
          {!isLoadingProfiles && profiles ? (
            <FormControl required sx={{ mt: 2, width: { xs: '50%' } }}>
              <InputLabel id="profile-select-label" disabled={profiles.profiles.length < 1} required>
                Profile
              </InputLabel>
              <Select
                labelId="profile-select-label"
                id="profile-select"
                value={selectedProfile}
                label="Profile"
                required
                disabled={profiles.profiles.length < 1}
                onChange={handleSelectProfile}
              >
                {profiles.profiles.map((option) => (
                  <MenuItem key={`${option.id}-select-item`} value={option.id}>
                    {option.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <Skeleton />
          )}
        </Box>
        <Button
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          sx={{ marginTop: '1rem' }}
          disabled={!networks || !profiles || isLoadingOrgNetworks || isLoading}
        >
          Adotar
        </Button>
        <Alert
          severity="error"
          variant="outlined"
          sx={{ marginTop: '1rem', display: adoptErrMsg ? 'flex' : 'none' }}
        >
          {adoptErrMsg}
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
