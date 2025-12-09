import { Box, Stack, Typography } from '@mui/material';
import { formatLatency, formatThroughput, formatUptime } from '../ts/helpers';


interface IProps{
  data: any,
}

export const TopologyNodeTooltip = ({ data }: IProps) => {
  if (!data) return null;

  return (
    <Box p={1}>
      <Stack spacing={0.3}>
        {Object.entries(data).map(([key, value]) => {
          if (["label"].includes(key)) return null;
          if (["id"].includes(key)) return null;
          if (["timestamp"].includes(key)) return null;
          if (key.includes('tx_bytes') || key.includes('rx_bytes')) return null;
          if (['prev_timestamp'].includes(key)) return null;
          if (value === null || value === undefined || value === '') return null;

          if (["uptime"].includes(key)) value = formatUptime(value as number);
          if (["latency"].includes(key)) value = formatLatency(value as number);
          if (key.includes('throughput')) {
            const formattedValue = formatThroughput(value as number);
            value = `${formattedValue.value} ${formattedValue.format}`
          }

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
