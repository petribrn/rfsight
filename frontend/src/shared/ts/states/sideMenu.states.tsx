import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import WifiIcon from '@mui/icons-material/Wifi';

export const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
  },
  {
    name: 'Redes',
    path: '/networks',
    icon: <WifiIcon />,
  },
  {
    name: 'Dispositivos',
    path: '/devices',
    icon: <InboxIcon />,
  },
  {
    name: 'Clientes',
    path: '/clients',
    icon: <SmartphoneIcon />,
  },
  {
    name: 'Usuários',
    path: '/users',
    icon: <PeopleAltIcon />,
  },
  {
    name: 'Organizações',
    path: '/organizations',
    icon: <CorporateFareIcon />,
  },
];
