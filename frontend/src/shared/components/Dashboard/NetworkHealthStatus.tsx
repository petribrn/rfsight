import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts';
import { useEffect, useState } from 'react';

interface INetworkHealthStatusProps {
  networks: Array<string>;
}

export const NetworkHealthStatus = ({
  networks,
}: INetworkHealthStatusProps) => {
  const theme = useTheme();
  console.log(networks);

  const [netHealth, setNetHealth] = useState(60);
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
    return theme.palette.primary.main;
  };

  useEffect(() => {
    setNetHealth(60);
  }, []);

  return (
    <Box justifyContent="center" alignItems="center">
      <Paper
        sx={{
          padding: { xs: 1 },
          backgroundColor: theme.palette.secondary.main,
        }}
        elevation={2}
      >
        <Typography align="center">Saúde da rede</Typography>
        <Grid container justifyContent="center">
          <Grid item>
            <Box mb={{ xs: 1 }}>
              <Gauge
                width={120}
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
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
