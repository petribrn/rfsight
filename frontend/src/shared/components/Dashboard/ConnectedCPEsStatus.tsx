import { Grid, Paper, Stack, Typography, useTheme } from '@mui/material';

interface IConnectedCPEsStatusProps {
  networks: Array<string>;
}

export const ConnectedCPEsStatus = ({
  networks,
}: IConnectedCPEsStatusProps) => {
  const theme = useTheme();
  console.log(networks);
  return (
    <Grid justifyContent="center" alignItems="center" size={{xs: 1, sm: 1, md: 1, lg: 2}} height={'100%'}>
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
          CPEs
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
                width: '70%'
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
        </Stack>
      </Paper>
    </Grid>
  );
};
