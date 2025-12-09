import { FormControl, InputLabel, MenuItem, Paper, Select, SelectChangeEvent } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect, useState } from 'react';
import { useGetDetailedOrganizationByIdQuery } from '../../store/slices/organization/organizationApiSlice';
import { IDashboardGraphsProps } from '../../ts/interfaces';
import { NoNetworksAvailable } from '../NoNetworksAvailable';
import { NetworkGraphWrapper } from './NetworkGraphWrapper';

export const DashboardGraphs = ({ organizationId }: IDashboardGraphsProps) => {
  const { data: organizationData, isLoading } =
    useGetDetailedOrganizationByIdQuery(organizationId);
  const [selectedNetwork, setSelectedNetwork] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if(organizationData && organizationData.networks.length > 0) setSelectedNetwork(organizationData.networks[0].id);
    }
  }, [isLoading, organizationData])

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedNetwork(event.target.value as string);
  };

  // eslint-disable-next-line no-nested-ternary
  return !isLoading && organizationData ? (
    organizationData.networks.length > 0 && selectedNetwork ? (
      <>
        <Paper sx={{p: 2}}>
          <FormControl variant='outlined'>
            <InputLabel id="select-network-label">Rede</InputLabel>
            <Select
              labelId="select-network-label"
              id="select-network"
              value={selectedNetwork}
              label="Rede"
              onChange={handleChange}
              size='small'
            >
              {organizationData.networks.map((net, index) => <MenuItem key={net.id} value={net.id}>{net.name}</MenuItem>)}
            </Select>
          </FormControl>
        </Paper>
        <NetworkGraphWrapper organizationId={organizationData.id} network={organizationData.networks.filter((net) => net.id === selectedNetwork)[0]}></NetworkGraphWrapper>
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
