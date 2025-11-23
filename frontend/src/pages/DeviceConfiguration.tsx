import {
  Box,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Tab,
  Tabs,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
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

export const DeviceConfigurationPage = () => {
  const { networkId, deviceId } = useParams();
  const currentOrg = useAppSelector(selectCurrentOrg);

  // 1. Get Device data
  const { data: device, isLoading: isLoadingDevice } =
    useGetDeviceByIdQuery(deviceId!);

  // 2. Get Profile data (skip if device isn't loaded yet)
  const { data: profile, isLoading: isLoadingProfile } = useGetProfileByIdQuery(
    device?.profileId!,
    {
      skip: !device?.profileId,
    }
  );

  // 3. State for Tabs
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const {data: network, isLoading: isLoadingNetwork} = useGetNetworkByIdQuery(networkId || '')

  const organizationId = network?.organizationId

  // Loading state
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
        <Typography variant='h6' color='text.secondary'>Gerenciar dispositivo</Typography>
        <Typography variant='caption' color='text.secondary'>Selecione as ações de gerenciamento a serem executadas (ordenadas) e adicione os respectivos payloads.</Typography>
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
