import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  BreadcrumbLink,
  DeviceActionExecutor,
  PageGridCenteredContainer,
  TabPanel
} from '../shared/components';
import {
  useAppSelector,
} from '../shared/hooks';
import { useGetDeviceByIdQuery } from '../shared/store/slices/device/deviceApiSlice';
import { useGetNetworkByIdQuery } from '../shared/store/slices/network/networkApiSlice';
import { selectCurrentOrg } from '../shared/store/slices/organization/organizationSlice';
import { useGetProfileByIdQuery } from '../shared/store/slices/profile/profileApiSlice';
import { selectUserInfo } from '../shared/store/slices/user/userSlice';
import { Permissions } from '../shared/ts/enums';

export const DeviceConfigurationPage = () => {
  const { networkId, deviceId } = useParams();
  const currentOrg = useAppSelector(selectCurrentOrg);
  const userInfo = useAppSelector(selectUserInfo);

  const navigate = useNavigate();

  useEffect(() => {
    if (userInfo){
      if (![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(userInfo.permission)){
        toast.error('Permissões insuficientes!');
        navigate('/dashboard');
      }
    }
  }, [userInfo])

  const { data: device, isLoading: isLoadingDevice } =
    useGetDeviceByIdQuery(deviceId!);

  const { data: profile, isLoading: isLoadingProfile } = useGetProfileByIdQuery(
    device?.profileId!,
    {
      skip: !device?.profileId,
    }
  );

  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const {data: network, isLoading: isLoadingNetwork} = useGetNetworkByIdQuery(networkId || '')

  const organizationId = network?.organizationId

  if (isLoadingDevice || isLoadingProfile || isLoadingNetwork || !device || !profile) {
    return (
      <PageGridCenteredContainer>
        <CircularProgress />
      </PageGridCenteredContainer>
    );
  }

  return (
    <Box display={'flex'} gap={3} flexDirection={'column'} width={'100%'} height={'100%'}>
      <Grid>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
          <BreadcrumbLink to={`/organizations/${organizationId}`}>
            {currentOrg?.name}
          </BreadcrumbLink>
          <BreadcrumbLink to={'/networks'}>
            {network?.name}
          </BreadcrumbLink>
          <Typography display={'flex'} gap={1} color="text.primary">{device?.name}{' '}({(device.mac_address &&`${device.mac_address.slice(0, 2)}:${device.mac_address.slice(2, 4)}:${device.mac_address.slice(4, 6)}:${device.mac_address.slice(6, 8)}:${device.mac_address.slice(8, 10)}:${device.mac_address.slice(10)}`) || device.ip_address})</Typography>
        </Breadcrumbs>
      </Grid>

      <Grid>
        <Typography variant='h6'>Gerenciar dispositivo</Typography>
        <Typography variant='caption'>Selecione as ações de gerenciamento a serem executadas (ordenadamente) e adicione os respectivos payloads.</Typography>
      </Grid>

      <Grid>
        <Grid sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Configuração de Dispositivo">
            <Tab label="Ações" />
          </Tabs>
        </Grid>

        <TabPanel value={tabValue} index={0}>
           <DeviceActionExecutor device={device} profile={profile} />
        </TabPanel>
      </Grid>
    </Box>
  );
};
