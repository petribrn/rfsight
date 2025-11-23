import { Box, Grid, Paper, Stack, Typography, useTheme } from '@mui/material';

interface IProps {
  download: number,
  upload: number
}

export const DownUpStatus = ({ download, upload }: IProps) => {
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
          Throughput agregado
        </Typography>
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} direction={'row'} spacing={1} display={'flex'} useFlexGap>
          <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1, sm: 1, md: 0.5, lg: 0.5 },
                backgroundColor: theme.palette.companyExtra.light,
                opacity: '75%',
                display: 'flex',
                flexDirection: 'column',
                width: '50%'
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
                  {download}
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
            <Paper
              variant="outlined"
              sx={{
                padding: { xs: 1, sm: 1, md: 0.5, lg: 0.5 },
                backgroundColor: theme.palette.companyExtra.light,
                opacity: '75%',
                display: 'flex',
                flexDirection: 'column',
                width: '50%'
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
                {upload}
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
        </Stack>
      </Paper>
    </Grid>
  );
};
