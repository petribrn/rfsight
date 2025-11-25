import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MenuIcon from '@mui/icons-material/Menu';
import WifiTetheringIcon from '@mui/icons-material/WifiTethering';
import {
  AppBar,
  Divider,
  Drawer,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppThemeContext } from '../contexts';
import { useAppSelector, useLogout } from '../hooks';
import {
  selectCurrentToken,
  selectCurrentUser,
} from '../store/slices/auth/authSlice';
import { SideMenu } from './SideMenu';

const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const Header = () => {
  const { toggleTheme, themeName } = useAppThemeContext(); // theme hook to get value from context

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);

  const open = Boolean(anchorEl);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const currentToken = useAppSelector(selectCurrentToken);
  const currentUsername = useAppSelector(selectCurrentUser);
  const logout = useLogout();

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="secondary"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography
            variant="h4"
            component="div"
            display="flex"
            lineHeight={1}
            sx={{
              flexGrow: 1,
              verticalAlign: 'middle',
              fontWeight: '800',
              fontFamily: 'Bungee',
            }}
          >
            <WifiTetheringIcon
              fontSize="large"
              sx={{
                lineHeight: 1,
                textAlign: 'center',
                verticalAlign: 'center',
                mr: 1,
              }}
            />
            RF
            <Typography
              variant="h4"
              lineHeight={1.1}
              sx={{
                flexGrow: 1,
                verticalAlign: 'middle',
                fontWeight: '200',
                fontFamily: 'Contrail One',
                ml: 0.3,
                color: (theme) => theme.palette.primary.main,
              }}
            >
              Sight
            </Typography>
          </Typography>
          {currentToken ? (
            <>
              <Tooltip title="Menu de usuário" arrow>
                <IconButton
                  onClick={handleOpenMenu}
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                  size="medium"
                  sx={{ margin: 0 }}
                >
                  <AccountCircleIcon fontSize="medium" />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleCloseMenu}
                onClick={handleCloseMenu}
              >
                <MenuItem>
                  <Typography variant="body2">{`Olá, @${currentUsername}.`}</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => navigate(`/users/${currentUsername}`)}>
                  <Typography variant="body2">Minha conta</Typography>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <Typography variant="body2">Logout</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={toggleTheme}>
                  <ListItemIcon>
                    {themeName === 'dark' ? (
                      <Brightness7Icon fontSize="small" />
                    ) : (
                      <Brightness4Icon fontSize="small" />
                    )}
                  </ListItemIcon>
                  <Typography variant="body2">
                    Ativar tema {themeName === 'dark' ? 'claro' : 'escuro'}
                  </Typography>
                </MenuItem>
              </Menu>
              <IconButton
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
                sx={{
                  display: { xs: 'flex', sm: 'flex', md: 'none', lg: 'none' },
                }}
              >
                <MenuIcon fontSize="medium" />
              </IconButton>
              <Drawer
                open={sideMenuOpen}
                anchor="right"
                sx={{
                  width: '20vw',
                  display: {
                    md: 'none',
                    lg: 'none',
                  },
                }}
                onClose={() => setSideMenuOpen(false)}
                onClick={() => setSideMenuOpen(false)}
              >
                <Offset />
                <SideMenu />
              </Drawer>
            </>
          ) : (
            <Tooltip title="Trocar o tema da página." arrow>
              <IconButton onClick={toggleTheme}>
                {themeName === 'dark' ? (
                  <Brightness7Icon fontSize="medium" />
                ) : (
                  <Brightness4Icon fontSize="medium" />
                )}
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>
      <Offset />
    </>
  );
};
