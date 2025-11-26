import { Box, Stack, Typography } from '@mui/material';
import { formatLatency, formatUptime } from '../ts/helpers';


interface IProps{
  data: any,
}

export const TopologyNodeTooltip = ({ data }: IProps) => {
  if (!data) return null;

  console.log(`tooltip data: ${data.online}`);

  return (
    <Box p={1}>
      <Stack spacing={0.3}>
        {Object.entries(data).map(([key, value]) => {
          if (["label"].includes(key)) return null;
          if (["id"].includes(key)) return null;
          if (value === null || value === undefined || value === '') return null;

          if (["uptime"].includes(key)) value = formatUptime(value as number);
          if (["latency"].includes(key)) value = formatLatency(value as number);

          return (
            <Typography key={key} variant="caption">
              <b>{key}:</b> {String(value)}
            </Typography>
          );
        })}
      </Stack>
    </Box>
  );
};
