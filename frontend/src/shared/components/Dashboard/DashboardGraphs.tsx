import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import { useGetOrganizationByIdQuery } from '../../store/slices/organization/organizationApiSlice';
import { IDashboardGraphsProps } from '../../ts/interfaces';
import { DashboardAccordion } from '../DashboardAccordion';
import { NoNetworksAvailable } from '../NoNetworksAvailable';
import { ConnectedCPEsChart } from './ConnectedCPEsChart';
import { ConnectedCPEsStatus } from './ConnectedCPEsStatus';
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
          <Grid container justifyContent={'center'} alignItems={'center'} spacing={1} columns={{xs: 1, sm: 2, md: 2, lg: 12}}>
            <DevicesStatus networks={organizationData!.networks} />
            <ConnectedCPEsStatus networks={organizationData!.networks} />
            <DownUpStatus networks={organizationData!.networks} />
            <NetworkHealthStatus networks={organizationData!.networks} />
          </Grid>
          {/* <Stack spacing={1} justifyContent={'center'} alignItems={'center'} direction={'row'} useFlexGap sx={{flexWrap: 'wrap'}}>
            <DevicesStatus networks={organizationData!.networks} />
            <ConnectedCPEsStatus networks={organizationData!.networks} />
            <DownUpStatus networks={organizationData!.networks} />
            <NetworkHealthStatus networks={organizationData!.networks} />
          </Stack> */}
        </DashboardAccordion>
        <DashboardAccordion
          defaultExpanded
          id="connected-cpes-chart"
          title="CPEs Conectadas"
        >
          <Grid container size={12} gap={1} justifyContent="space-evenly">
            <Grid size={{xs: 12}} height="30vh">
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
