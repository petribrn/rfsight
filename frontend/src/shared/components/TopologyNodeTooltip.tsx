import { Box, Stack, Typography } from '@mui/material';


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
          if (!value) return null;

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
