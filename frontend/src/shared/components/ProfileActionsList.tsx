import AddIcon from '@mui/icons-material/Add';
import LayersIcon from '@mui/icons-material/Layers';
import {
  alpha,
  Button,
  Card,
  CardContent,
  Typography,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import { ProfileActions } from '../ts/types';

interface Props {
  actions: ProfileActions;
}

export const ProfileActionsList = ({ actions }: Props) => {
  const theme = useTheme();

  return (
    <Box>
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
        mb={1.5}
      >
        <Typography variant="button">Ações</Typography>
        <Button variant="outlined" startIcon={<AddIcon />} color="success">
          Nova ação
        </Button>
      </Box>

      <Card
        variant="outlined"
        sx={{
          p: 1.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          maxHeight: '20vh',
        }}
      >
        <CardContent sx={{ overflow: 'auto', width: '100%', p: 1 }}>
          {Object.keys(actions).length > 0 ? (
            <Typography>Test</Typography>
          ) : (
            <Box
              height={'15vh'}
              display={'flex'}
              flexDirection={'column'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <Typography
                variant="button"
                fontSize={'small'}
                color={alpha(theme.palette.text.primary, 0.5)}
              >
                Ações adicionadas aparecerão aqui
              </Typography>
              <LayersIcon
                fontSize="small"
                sx={{ fill: alpha(theme.palette.text.primary, 0.5) }}
              />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
