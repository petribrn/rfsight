import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';

interface IDeviceStatusProps {
  networks: Array<string>;
}

export const DevicesStatus = ({ networks }: IDeviceStatusProps) => {
  const theme = useTheme();
  console.log(networks);
  return (
    <Box justifyContent="center" alignItems="center">
      <Paper
        sx={{
          padding: { xs: 0.5 },
          pb: { xs: 2.8 },
          backgroundColor: theme.palette.secondary.main,
        }}
        elevation={2}
      >
        <Typography align="center" mb="1rem">
          Dispositivos
        </Typography>
        <Grid
          container
          gap={{ xs: 0.5, sm: 1 }}
          justifyContent="center"
          columns={{ xs: 12, sm: 11 }}
        >
          <Grid item xs={5} sm={5} md={5}>
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1 },
                pb: { xs: 2 },
                backgroundColor: theme.palette.success.main,
                opacity: '75%',
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
                0
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={5} sm={5} md={5}>
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1 },
                pb: { xs: 2 },
                backgroundColor: theme.palette.companyExtra.grey,
                opacity: '75%',
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
                0
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
