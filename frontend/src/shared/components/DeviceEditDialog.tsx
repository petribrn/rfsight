import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import {
  Alert,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material';
import Joi from 'joi';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useGetDeviceByIdQuery, useUpdateDeviceByIdMutation } from '../store/slices/device/deviceApiSlice';
import { useGetNetworksCollectionByOrgQuery } from '../store/slices/network/networkApiSlice';
import { useGetProfilesCollectionQuery } from '../store/slices/profile/profileApiSlice';
import { DefaultApiError } from '../ts/interfaces';
import {
  DeviceAdoptSchema,
  DeviceIpAddressSchema,
  DeviceMACAddressSchema,
  DevicePasswdSchema,
  DeviceUserSchema
} from '../ts/validation';
import { IPAddressTextMask } from './IPAddressTextMask';
import { MacAddressTextMask } from './MacAddressTextMask';

interface IProps {
  open: boolean;
  handleClose: () => void;
  deviceId: string;
  organizationId: string
}

export const DeviceEditDialog = ({ open, handleClose, deviceId, organizationId }: IProps) => {
  const theme = useTheme();
  const [updateDevice, { isLoading }] = useUpdateDeviceByIdMutation();
  const {data: device, isLoading: deviceIsLoading} = useGetDeviceByIdQuery(deviceId);

  const { data: networks } = useGetNetworksCollectionByOrgQuery(organizationId, {
    skip: !organizationId,
  });
  const { data: profiles } = useGetProfilesCollectionQuery();

  const [macAddress, setMacAddress] = useState(device ? device.mac_address : '');
  const [ipAddress, setIpAddress] = useState(device ? device.ip_address : '');
  const [user, setUser] = useState(device ? device.user : '');
  const [password, setPassword] = useState(device ? device.password : '');
  const [selectedNetwork, setSelectedNetwork] = useState(device ? device.networkId : '');
  const [selectedProfile, setSelectedProfile] = useState(device ? device.profileId : '');
  const [showPassword, setShowPassword] = useState(false);

  const [macAddressErr, setMacAddressErr] = useState('');
  const [ipAddressErr, setIpAddressErr] = useState('');
  const [userErr, setUserErr] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [editErrMsg, setEditErrMsg] = useState('');

  useEffect(() => {
    if (device) {
      setMacAddress(device.mac_address || '');
      setIpAddress(device.ip_address || '');
      setUser(device.user || '');
      setPassword(device.password || '');
      setSelectedNetwork(device.networkId || '');
      setSelectedProfile(device.profileId || '');
    }
  }, [device, open]);

  const setDefaultState = () => {
    setMacAddress('');
    setIpAddress('');
    setUser('');
    setPassword('');
    setSelectedNetwork('');
    setSelectedProfile('');
    setMacAddressErr('');
    setIpAddressErr('');
    setUserErr('');
    setPasswordErr('');
    setEditErrMsg('');
  };

  const handleFieldChange = (
      v: string,
      fieldSchema: Joi.Schema,
      setFieldValue: Dispatch<SetStateAction<string>>,
      setFieldErr: Dispatch<SetStateAction<string>>
    ) => {
      setFieldValue(v);
      if (editErrMsg) setEditErrMsg('');

      const { error, value } = fieldSchema.validate(v);

      if (error) {
        setFieldErr(error.message);
      } else {
        setFieldErr('');
      }
      return value;
    };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (editErrMsg) setEditErrMsg('');

    const payload = {
      mac_address: macAddress || null,
      ip_address: ipAddress || null,
      user,
      password,
      networkId: selectedNetwork,
      profileId: selectedProfile,
    };

    if (!payload.mac_address && !payload.ip_address) return setEditErrMsg('O endereço MAC ou IP deve ser informado.')

    const { error } = DeviceAdoptSchema.validate(payload);
    if (error) {
      setEditErrMsg(error.message);
      return;
    }

    try {
      const r = await updateDevice({ deviceId: device!.id, deviceEditData: payload }).unwrap();
      toast.success(r.message);
      setDefaultState();
      handleClose();
    } catch (error) {
      const err = error as DefaultApiError;
      setEditErrMsg(err.detail.message);
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
      slotProps={{ paper: { component: 'form', sx: { p: 2, width: '50vw' } } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body1">Editar dispositivo</Typography>
          <Tooltip title="Fechar">
            <IconButton
              onClick={() => {
                setDefaultState();
                handleClose();
              }}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>Atualize os dados do dispositivo.</DialogContentText>
        {!deviceIsLoading && device ? (
          <>
            <Box mt={2}>
              <TextField
                fullWidth
                label="Endereço MAC"
                value={macAddress}
                required={!ipAddress}
                onChange={(e) => handleFieldChange(e.target.value, DeviceMACAddressSchema, setMacAddress, setMacAddressErr)}
                error={!!macAddressErr}
                slotProps={{ input: { inputComponent: MacAddressTextMask as any } }}
              />
              <Typography color={theme.palette.error.main}>{macAddressErr}</Typography>
            </Box>

            <Box mt={2}>
              <TextField
                fullWidth
                label="Endereço IP"
                value={ipAddress}
                required={!macAddress}
                onChange={(e) => handleFieldChange(e.target.value, DeviceIpAddressSchema, setIpAddress, setIpAddressErr)}
                error={!!ipAddressErr}
                slotProps={{ input: { inputComponent: IPAddressTextMask as any } }}
              />
              <Typography color={theme.palette.error.main}>{ipAddressErr}</Typography>
            </Box>

            <Box mt={2}>
              <TextField
                fullWidth
                label="Usuário"
                required
                value={user}
                onChange={(e) => handleFieldChange(e.target.value, DeviceUserSchema, setUser, setUserErr)}
                error={!!userErr}
              />
              <Typography color={theme.palette.error.main}>{userErr}</Typography>
            </Box>

            <Box mt={2}>
              <TextField
                fullWidth
                label="Senha"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => handleFieldChange(e.target.value, DevicePasswdSchema, setPassword, setPasswordErr)}
                error={!!passwordErr}
                slotProps={{
                  input: {
                    endAdornment: (
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  ),
                  }
                }}
              />
              <Typography color={theme.palette.error.main}>{passwordErr}</Typography>
            </Box>

            <Box display="flex" gap={2} mt={2}>
              <FormControl required fullWidth>
                <InputLabel>Rede</InputLabel>
                <Select value={selectedNetwork} onChange={(e: SelectChangeEvent) => setSelectedNetwork(e.target.value)}>
                  {networks?.networks.map((n) => (
                    <MenuItem key={n.id} value={n.id}>{n.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl required fullWidth>
                <InputLabel>Profile</InputLabel>
                <Select value={selectedProfile} onChange={(e: SelectChangeEvent) => setSelectedProfile(e.target.value)}>
                  {profiles?.profiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Button fullWidth variant="contained" sx={{ mt: 3 }} type="submit">Salvar alterações</Button>

            <Alert severity="error" sx={{ mt: 2, display: editErrMsg ? 'flex' : 'none' }}>{editErrMsg}</Alert>
          </>
        ): (
          <Box height={'15vh'}>
            <Skeleton height={'100%'}/>
          </Box>
        )}
      </DialogContent>

      <Backdrop open={isLoading} sx={{ color: '#fff' }}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </Dialog>
  )
}
