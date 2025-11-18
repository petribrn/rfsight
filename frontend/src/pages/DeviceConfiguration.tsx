// frontend/src/pages/DeviceConfiguration.tsx

import {
  Box,
  Breadcrumbs,
  CircularProgress,
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
  if (isLoadingDevice || isLoadingProfile || !device || !profile) {
    return (
      <PageGridCenteredContainer>
        <CircularProgress />
      </PageGridCenteredContainer>
    );
  }

  return (
    <PageGridCenteredContainer>
      <Box width={'100%'}>
        <Typography variant="h5">{device?.name}</Typography>
      </Box>
      <Box width={'100%'}>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/">Dashboard</BreadcrumbLink>
          <BreadcrumbLink to={`/organizations/${organizationId}`}>
            {currentOrg?.name}
          </BreadcrumbLink>
          <BreadcrumbLink to={`/organizations/${organizationId}/networks/${networkId}`}>
            {network?.name}
          </BreadcrumbLink>
          <Typography color="text.primary">{device?.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* --- TABS --- */}
      <Box width={'100%'}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Configuração de Dispositivo">
            <Tab label="Ações" />
            <Tab label="Configuração (Legado)" />
          </Tabs>
        </Box>

        {/* --- TAB 1: NEW ACTION EXECUTOR --- */}
        <TabPanel value={tabValue} index={0}>
           <DeviceActionExecutor device={device} profile={profile} />
        </TabPanel>

        {/* --- TAB 2: OLD CONFIGURATION FORM --- */}
        {/* <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>Configuração (Legado)</Typography>
          <ConfigurationForm />
        </TabPanel> */}
      </Box>
    </PageGridCenteredContainer>
  );
};
