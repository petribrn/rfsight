import SignalWifiStatusbarConnectedNoInternet4Icon from '@mui/icons-material/SignalWifiStatusbarConnectedNoInternet4';
import { alpha, useTheme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';

export const NoNetworksAvailable = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      p={2}
      width="100%"
      justifyContent="center"
      alignItems="center"
      justifyItems="center"
    >
      <SignalWifiStatusbarConnectedNoInternet4Icon
        color="inherit"
        fontSize="large"
        sx={{ fill: alpha(theme.palette.text.primary, 0.3) }}
      />
      <Typography align="center">
        Não existem redes para monitorar no momento, experimente criar uma rede
        e adotar dispositivos.
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={() => navigate('/networks')}
      >
        Acessar o gerenciamento de redes
      </Button>
    </Box>
  );
};
