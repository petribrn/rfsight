import { Grid, Paper, Stack, Typography, useTheme } from '@mui/material';

interface IDeviceStatusProps {
  online: number,
  offline: number
}

export const DevicesStatus = ({ online, offline }: IDeviceStatusProps) => {
  const theme = useTheme();
  return (
    <Grid justifyContent="center" alignItems="center" size={{xs: 1, sm: 1, md: 1, lg: 3}} height={'100%'}>
      <Paper
        sx={{
          padding: { xs: 1 },
          pb: { xs: 2.8 },
          backgroundColor: theme.palette.secondary.main,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        elevation={2}
      >
        <Typography align="center" mb="1rem">
          Dispositivos
        </Typography>
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} direction={'row'} spacing={1} display={'flex'} useFlexGap>
          <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1 },
                pb: { xs: 2 },
                backgroundColor: theme.palette.success.main,
                opacity: '75%',
                display: 'flex',
                flexDirection: 'column',
                width: '50%'
              }}
            >
              <Typography
                align="center"
                color={theme.palette.getContrastText(
                  theme.palette.success.main
                )}
              >
                On-line
              </Typography>
              <Typography
                align="center"
                variant="h6"
                fontWeight={700}
                color={theme.palette.getContrastText(
                  theme.palette.success.main
                )}
              >
                {online}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1 },
                pb: { xs: 2 },
                backgroundColor: theme.palette.companyExtra.grey,
                opacity: '75%',
                display: 'flex',
                flexDirection: 'column',
                width: '50%'
              }}
            >
              <Typography
                align="center"
                color={theme.palette.getContrastText(
                  theme.palette.companyExtra.grey
                )}
              >
                Offline
              </Typography>
              <Typography
                align="center"
                variant="h6"
                fontWeight={700}
                color={theme.palette.getContrastText(
                  theme.palette.companyExtra.grey
                )}
              >
                {offline}
              </Typography>
            </Paper>
        </Stack>
      </Paper>
    </Grid>
  );
};
