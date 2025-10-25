import {
  Backdrop,
  Breadcrumbs,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { BreadcrumbLink, ConfigurationForm } from '../shared/components';
import { useGetDeviceByIdQuery } from '../shared/store/slices/device/deviceApiSlice';

export const DeviceConfigurationPage = () => {
  const { deviceId } = useParams();
  const { data: deviceData } = useGetDeviceByIdQuery(deviceId!, {
    skip: !deviceId,
  });
  return deviceData ? (
    <Grid container direction="column">
      <Grid size={{xs: 1}}>
        <Typography variant="h5" mb={2}>
          Configurações do dispositivo {deviceData.name}
        </Typography>
        <Breadcrumbs aria-label="breadcrumb">
          <BreadcrumbLink to="/dashboard">Home</BreadcrumbLink>
          <BreadcrumbLink to="/devices">Dispositivos</BreadcrumbLink>
          <Typography color="text.primary">{deviceData.name}</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid size={{xs: 1}}>
        <ConfigurationForm
          configId={deviceData.configId}
          deviceId={deviceId!}
        />
      </Grid>
    </Grid>
  ) : (
    <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
