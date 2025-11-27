/* eslint-disable react/jsx-props-no-spreading */

import { useTheme } from '@mui/material';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { SyntheticEvent, useState } from 'react';
import { Permissions } from '../../ts/enums';
import { UserInfo } from '../../ts/types';
import { OrganizationCreation } from '../OrganizationCreation';
import { OrganizationsSelection } from '../OrganizationsSelection';
import { ScrollSnapper } from '../ScrollSnapper';
import { TabPanel } from '../TabPanel';

interface OrganizationTabsProps {
  currentUserInfo: UserInfo;
}

export const OrganizationTabs = ({
  currentUserInfo,
}: OrganizationTabsProps) => {
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
    <Box sx={{ width: '100%', display: 'grid' }}>
      <Alert severity="info">
        Parece que você não está em uma organização... Por favor, crie ou
        selecione uma organização para continuar.
      </Alert>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }} mt={2}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="organization tabs"
        >
          <Tab label="Selecionar" {...a11yProps(0)} />
          <Tab
            label="Criar"
            {...a11yProps(1)}
            disabled={![Permissions.Admin, Permissions.GuestAdmin, Permissions.Master].includes(currentUserInfo.permission)}
          />
        </Tabs>
      </Box>
      <ScrollSnapper index={value} onIndexChange={handleChangeIndex}>
        <TabPanel value={value} index={0} dir={theme.direction}>
          <OrganizationsSelection currentUserInfo={currentUserInfo} />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          <OrganizationCreation currentUserInfo={currentUserInfo} />
        </TabPanel>
      </ScrollSnapper>
    </Box>
  );
};
