import { Alert, Box, CircularProgress, Grid, Typography, useTheme } from "@mui/material"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import { useAppDispatch, useAppSelector, useNetworkMetrics } from "../../hooks"
import { selectMergedTopology } from "../../store/selectors/topologySelectors"
import { useGetDeviceCollectionByOrganizationQuery } from "../../store/slices/device/deviceApiSlice"
import { topologyActions } from "../../store/slices/topology/topologySlice"
import { NetworkData } from "../../ts/types"
import { DashboardAccordion } from "../DashboardAccordion"
import { TopologyViewer } from "../TopologyViewer"
import { ConnectedStationsStatus } from "./ConnectedStationsStatus"
import { DevicesStatus } from "./DevicesStatus"
import { DownUpStatus } from "./DownUpStatus"
import { NetworkHealthStatus } from "./NetworkHealthStatus"

interface IProps {
  organizationId: string,
  network: NetworkData,
}

export const NetworkGraphWrapper = ({ organizationId, network }: IProps) => {
  const networkMetrics = useNetworkMetrics(organizationId, network.id);
  const dispatch = useAppDispatch();
  const { data: deviceCollection, isLoading: devicesLoading } = useGetDeviceCollectionByOrganizationQuery({organizationId, networkId: network.id});
  const graph = useAppSelector(selectMergedTopology(organizationId, network.id));
  const theme = useTheme();

  useEffect(() => {
    if (deviceCollection && deviceCollection.devices) {
      dispatch(topologyActions.setInitialNetworkDevices({
        orgId: organizationId,
        networkId: network.id,
        devices: deviceCollection.devices
      }));
    }
  }, [dispatch, deviceCollection, organizationId, network.id]);

  let isLoading = !networkMetrics || !graph;

  useEffect(() => {
    isLoading = !networkMetrics || !graph;
  }, [networkMetrics, graph])

  return (network.devices.length > 0 ? (<>
      <DashboardAccordion defaultExpanded id={`general-info-${network.id}`} title="Informações gerais da rede">
        {!isLoading && <Grid container justifyContent={'center'} alignItems={'center'} spacing={1} columns={{xs: 1, sm: 2, md: 2, lg: 12}}>
          <DevicesStatus online={networkMetrics.online || 0} offline={networkMetrics.offline || 0} />
          <ConnectedStationsStatus stations={networkMetrics.stations || 0} />
          <DownUpStatus download={networkMetrics.download} upload={networkMetrics.upload} />
          <NetworkHealthStatus health={networkMetrics.health.healthScore || 0} explanation={networkMetrics.health.healthScoreExplanation} />
        </Grid>}
        {isLoading && <Box display={'flex'} height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
          <Typography mr={1}>Carregando dados da rede...</Typography>
          <CircularProgress color="primary" size={'1rem'} />
        </Box>}
      </DashboardAccordion>
      <DashboardAccordion
        defaultExpanded
        id="general-info"
        title="Topologia da rede"
      >
        {!devicesLoading && !isLoading && <Box display={'flex'} height={'35vh'} width={'100%'} mb={2}>
          <TopologyViewer graph={graph}></TopologyViewer>
        </Box>}
        {isLoading && <Box display={'flex'} height={'100%'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
          <Typography mr={1}>Carregando dados da rede...</Typography>
          <CircularProgress color="primary" size={'1rem'} />
        </Box>}
      </DashboardAccordion>
    </>): (<Alert severity="info" sx={{mt: 2, fontSize: '1rem'}}>
            Parece que essa rede não possui dispositivos adotados... Por favor,{' '}<Link to={'/profiles'} style={{color: theme.palette.info.dark}}>crie um profile</Link> e <Link to={'/devices'} style={{color: theme.palette.info.dark}}>adote um dispositivo</Link> para
            ter acesso às métricas.
          </Alert>))
}
