/* eslint-disable react/jsx-props-no-spreading */

import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import MiscellaneousServicesIcon from '@mui/icons-material/MiscellaneousServices';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import WifiIcon from '@mui/icons-material/Wifi';
import { Tooltip, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent, useState } from 'react';
import { ScrollSnapper } from '../ScrollSnapper';
import { TabPanel } from '../TabPanel';
import { NetworkConfigTab } from './NetworkConfigTab';
import { ServiceConfigTab } from './ServiceConfigTab';
import { SystemConfigTab } from './SystemConfigTab';
import { TrafficConfigTab } from './TrafficConfigTab';
import { WirelessConfigTab } from './WirelessConfigTab';

export const ConfigurationTabs = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();

  const handleChange = (_event: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setValue(index - 1);
  };

  const a11yProps = (index: number) => {
    return {
      id: `tab-${index}`,
      'aria-controls': `tabpanel-${index}`,
    };
  };

  return (
    <Box sx={{ width: '100%', display: 'grid', height: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mt={2}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="configuration tabs"
        >
          <Tooltip title="Configurações da wireless">
            <Tab
              label="Wireless"
              sx={{ fontSize: '0.8rem' }}
              {...a11yProps(0)}
              icon={<WifiIcon fontSize="small" />}
            />
          </Tooltip>
          <Tooltip title="Configurações da rede">
            <Tab
              label="Rede"
              sx={{ fontSize: '0.8rem' }}
              {...a11yProps(1)}
              icon={<LanOutlinedIcon fontSize="small" />}
            />
          </Tooltip>
          <Tooltip title="Gerência de tráfego">
            <Tab
              label="Tráfego"
              sx={{ fontSize: '0.8rem' }}
              {...a11yProps(2)}
              icon={<SyncAltOutlinedIcon fontSize="small" />}
            />
          </Tooltip>
          <Tooltip title="Configurações de serviço">
            <Tab
              label="Serviço"
              sx={{ fontSize: '0.8rem' }}
              {...a11yProps(3)}
              icon={<MiscellaneousServicesIcon fontSize="small" />}
            />
          </Tooltip>
          <Tooltip title="Configurações de sistema">
            <Tab
              label="Sistema"
              sx={{ fontSize: '0.8rem' }}
              {...a11yProps(4)}
              icon={<TuneOutlinedIcon fontSize="small" />}
            />
          </Tooltip>
        </Tabs>
      </Box>
      <ScrollSnapper index={value} onIndexChange={handleChangeIndex}>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <WirelessConfigTab />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <NetworkConfigTab />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <TrafficConfigTab />
        </TabPanel>
        <TabPanel value={value} index={3} dir={theme.direction}>
          <ServiceConfigTab />
        </TabPanel>
        <TabPanel value={value} index={4} dir={theme.direction}>
          <SystemConfigTab />
        </TabPanel>
      </ScrollSnapper>
    </Box>
  );
};
