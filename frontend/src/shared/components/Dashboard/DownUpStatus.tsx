import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';

interface IDownUpStatusProps {
  networks: Array<string>;
}

export const DownUpStatus = ({ networks }: IDownUpStatusProps) => {
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
          Throughput agregado
        </Typography>
        <Grid
          container
          gap={{ xs: 1, sm: 1, md: 1 }}
          columns={{ xs: 12 }}
          justifyContent="center"
        >
          <Grid item xs={6} sm={3} md={6}>
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1, sm: 1, md: 0.5, lg: 0.5 },
                backgroundColor: theme.palette.companyExtra.light,
                opacity: '75%',
              }}
            >
              <Box>
                <Typography
                  align="center"
                  color={theme.palette.getContrastText(
                    theme.palette.companyExtra.light
                  )}
                >
                  Download
                </Typography>
                <Typography
                  align="center"
                  variant="body1"
                  fontWeight={800}
                  color={theme.palette.getContrastText(
                    theme.palette.companyExtra.light
                  )}
                >
                  123
                </Typography>
                <Typography
                  align="center"
                  variant="body1"
                  color={theme.palette.getContrastText(
                    theme.palette.companyExtra.light
                  )}
                >
                  Mbps
                </Typography>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={5} sm={3} md={6}>
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1, sm: 1, md: 0.5, lg: 0.5 },
                backgroundColor: theme.palette.companyExtra.light,
                opacity: '75%',
              }}
            >
              <Typography
                align="center"
                color={theme.palette.getContrastText(
                  theme.palette.companyExtra.light
                )}
              >
                Upload
              </Typography>
              <Typography
                align="center"
                variant="body1"
                fontWeight={800}
                color={theme.palette.getContrastText(
                  theme.palette.companyExtra.light
                )}
              >
                123
              </Typography>
              <Typography
                align="center"
                variant="body1"
                color={theme.palette.getContrastText(
                  theme.palette.companyExtra.light
                )}
              >
                Mbps
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
