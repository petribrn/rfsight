import { Box, Grid, Paper, Stack, Tooltip, Typography, useTheme } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import { useEffect, useState } from 'react';

interface IProps {
  health: number;
  explanation: string;
}

export const NetworkHealthStatus = ({
  health,
  explanation
}: IProps) => {
  const theme = useTheme();

  const [netHealth, setNetHealth] = useState(0);
  const maxHealth = 100;
  const getArcColor = (healthPercent: number) => {
    if (healthPercent < 30) {
      return theme.palette.error.main;
    }
    if (healthPercent < 50) {
      return theme.palette.warning.main;
    }
    if (healthPercent < 75) {
      return 'yellow';
    }
    return theme.palette.success.main;
  };

  useEffect(() => {
    setNetHealth(health)
  }, [health])

  return (
    <Grid justifyContent="center" alignItems="center" size={{xs: 1, sm: 1, md: 1, lg: 2}} height={'100%'}>
      <Tooltip title={<Box display={'flex'} flexDirection={'column'} height={'15vh'} overflow={'auto'}>
          <Typography variant='caption' style={{whiteSpace: 'pre-line'}}>{explanation}</Typography>
        </Box>}>
        <Paper
          sx={{
            padding: { xs: 1 },
            pb: { xs: 1.55, sm: 2.55, md: 1.55 },
            backgroundColor: theme.palette.secondary.main,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          elevation={2}
        >
          <Typography align="center">Saúde da rede</Typography>
          <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} direction={'row'} spacing={1} display={'flex'} useFlexGap>
            <Box mb={{ xs: 1 }}>
                <Gauge
                  width={150}
                  height={100}
                  value={netHealth}
                  startAngle={-110}
                  endAngle={110}
                  valueMin={0}
                  valueMax={maxHealth}
                  text={({ value, valueMax }) => `${value} / ${valueMax}`}
                  cornerRadius="50%"
                  sx={(tm) => ({
                    fontFamily: tm.typography.caption.fontFamily,
                    fontSize: { xs: 14, sm: 14 },
                    [`& .${gaugeClasses.valueArc}`]: {
                      fill: getArcColor(netHealth),
                    },
                  })}
                />
              </Box>
          </Stack>
        </Paper>
      </Tooltip>
    </Grid>
  );
};
