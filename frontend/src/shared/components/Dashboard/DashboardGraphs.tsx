import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useGetOrganizationByIdQuery } from '../../store/slices/organization/organizationApiSlice';
import { IDashboardGraphsProps } from '../../ts/interfaces';
import { DashboardAccordion } from '../DashboardAccordion';
import { NoNetworksAvailable } from '../NoNetworksAvailable';
import { ConnectedCPEsStatus } from './ConnectedClientsStatus';
import { ConnectedCPEsChart } from './ConnectedCPEsChart';
import { DevicesStatus } from './DevicesStatus';
import { DownUpStatus } from './DownUpStatus';
import { NetworkHealthStatus } from './NetworkHealthStatus';

export const DashboardGraphs = ({ organizationId }: IDashboardGraphsProps) => {
  const { data: organizationData, isLoading } =
    useGetOrganizationByIdQuery(organizationId);

  // eslint-disable-next-line no-nested-ternary
  return !isLoading && organizationData ? (
    organizationData.networks.length > 0 ? (
      <>
        <DashboardAccordion
          defaultExpanded
          id="general-info"
          title="Informações gerais da rede"
        >
          <Grid
            container
            gap={{ xs: 1, sm: 1, md: 1 }}
            columns={{ xs: 1, sm: 1, md: 11 }}
            justifyContent="center"
          >
            <Grid item xs={1} sm={1} md={3} height="100%">
              <DevicesStatus networks={organizationData!.networks} />
            </Grid>
            <Grid item xs={1} sm={1} md={2}>
              <ConnectedCPEsStatus networks={organizationData!.networks} />
            </Grid>
            <Grid item xs={1} sm={1} md={3}>
              <DownUpStatus networks={organizationData!.networks} />
            </Grid>
            <Grid item xs={1} sm={1} md={2}>
              <NetworkHealthStatus networks={organizationData!.networks} />
            </Grid>
          </Grid>
        </DashboardAccordion>
        <DashboardAccordion
          defaultExpanded
          id="connected-cpes-chart"
          title="CPEs Conectadas"
        >
          <Grid container gap={1} justifyContent="space-evenly">
            <Grid item xs={12} height="30vh">
              <ConnectedCPEsChart />
            </Grid>
          </Grid>
        </DashboardAccordion>
      </>
    ) : (
      <NoNetworksAvailable />
    )
  ) : (
    <Backdrop sx={{ color: '#fff', zIndex: (t) => t.zIndex.drawer + 1 }} open>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};
