import CorporateFareIcon from '@mui/icons-material/CorporateFare';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import InboxIcon from '@mui/icons-material/Inbox';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import WifiIcon from '@mui/icons-material/Wifi';
import { UserInfo } from '../types';

export const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    disabled: (userInfo: UserInfo | null) => false,
    icon: <DashboardIcon />,
  },
  {
    name: 'Redes',
    path: '/networks',
    disabled: (userInfo: UserInfo | null) => !userInfo?.organizationId,
    icon: <WifiIcon />,
  },
  {
    name: 'Configurar',
    path: '/configure',
    disabled: (userInfo: UserInfo | null) => !userInfo?.organizationId,
    icon: <SettingsIcon />,
  },
  {
    name: 'Dispositivos',
    path: '/devices',
    disabled: (userInfo: UserInfo | null) => !userInfo?.organizationId,
    icon: <InboxIcon />,
  },
  {
    name: 'Profiles',
    path: '/profiles',
    disabled: (userInfo: UserInfo | null) => false,
    icon: <EditDocumentIcon />,
  },
  {
    name: 'Usuários',
    path: '/users',
    disabled: (userInfo: UserInfo | null) => false,
    icon: <PeopleAltIcon />,
  },
  {
    name: 'Organizações',
    path: '/organizations',
    disabled: (userInfo: UserInfo | null) => false,
    icon: <CorporateFareIcon />,
  },
];
