import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';

interface IConnectedCPEsStatusProps {
  networks: Array<string>;
}

export const ConnectedCPEsStatus = ({
  networks,
}: IConnectedCPEsStatusProps) => {
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
          CPEs
        </Typography>
        <Grid container gap={2} justifyContent="center">
          <Grid item xs={10}>
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
                Conectadas
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
        </Grid>
      </Paper>
    </Box>
  );
};
