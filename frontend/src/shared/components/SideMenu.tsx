import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { menuItems } from '../ts/states';

export const SideMenu = () => {
  const theme = useTheme();

  const navigate = useNavigate();

  const isActive = (itemPathTo: string) => {
    return window.location.pathname.includes(itemPathTo);
  };

  const getBackGroundColor = (itemPathTo: string) => {
    return isActive(itemPathTo)
      ? alpha(theme.palette.primary.main, 0.7)
      : 'none';
  };

  const getContrastText = (itemPathTo: string) => {
    return isActive(itemPathTo)
      ? theme.palette.primary.contrastText
      : theme.typography.body1.color;
  };

  return (
    <Box
      height="100%"
      width={{ xs: '40vw', sm: '28vw', md: '100%', lg: '100%' }}
      sx={{
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.name
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')}
            disablePadding
            sx={{
              backgroundColor: getBackGroundColor(item.path),
            }}
          >
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  marginRight: { xs: 2 },
                  color: getContrastText(item.path),
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.name}
                primaryTypographyProps={{
                  fontSize: { xs: 10, sm: 12, md: 14, lg: 16 },
                  fontWeight: isActive(item.path) ? 800 : 50,
                  color: getContrastText(item.path),
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
