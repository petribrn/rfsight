import CellTowerIcon from '@mui/icons-material/CellTower';
import LanIcon from '@mui/icons-material/Lan';
import RouterIcon from '@mui/icons-material/Router';
import { alpha, Badge, Box, Tooltip, Typography, useTheme } from "@mui/material";
import { BadgeProps } from '@mui/material/Badge';
import { styled } from '@mui/material/styles';
import { Handle, Position } from "@xyflow/react";
import { TopologyNodeTooltip } from './TopologyNodeTooltip';

const baseStyle = {
  padding: '6px 8px',
  borderRadius: 4,
  border: '1px solid #ddd',
  minWidth: 60,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
};

const StyledBadge = styled(Badge)<BadgeProps>(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: 4,
    top: 6,
    border: `1px solid ${theme.palette.mode === 'dark' ? 'white': 'black'}`,
  },
}));

export const DefaultTopologyNode = ({ data }: any) => {
  const theme = useTheme();
  return (
    <Tooltip title={<TopologyNodeTooltip data={data}/>} placement='right'>
      <StyledBadge variant='dot' color={data.online ? 'success':'error'}>
        <Box className="custom-node" display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} sx={{...baseStyle, background: alpha(theme.palette.primary.main, 0.7), color: theme.palette.primary.contrastText, border: `1px solid ${theme.palette.mode === 'dark' ? '#ddd': '#000'}`,}}>
          <CellTowerIcon fontSize='small'/>
          <Typography width={'100%'} variant="caption" fontSize={'0.5rem'}>{data.label}</Typography>
          <Handle type="source" position={Position.Bottom} />
          <Handle type="target" position={Position.Top} />
        </Box>
      </StyledBadge>
    </Tooltip>
  );
};

export const WifiStationTopologyNode = ({ data }: any) => {
  const theme = useTheme();
  return (
    <Tooltip title={<TopologyNodeTooltip data={data}/>} placement='right'>
      <Box className="custom-node" display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} sx={{...baseStyle, background: alpha(theme.palette.background.default, 0.7), border: `1px solid ${theme.palette.mode === 'dark' ? '#ddd': '#000'}`}}>
        <RouterIcon fontSize='small' />
        <Typography width={'100%'} variant="caption" fontSize={'0.5rem'}>{data.label}</Typography>
        <Handle type="source" position={Position.Bottom} />
        <Handle type="target" position={Position.Top} />
      </Box>
    </Tooltip>
  );
};

export const LldpTopologyNode = ({ data }: any) => {
  const theme = useTheme();
  return(
    <Tooltip title={<TopologyNodeTooltip data={data}/>} placement='right'>
    <Box className="custom-node" display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'} sx={{...baseStyle, background: alpha(theme.palette.background.default, 0.7), border: `1px solid ${theme.palette.mode === 'dark' ? '#ddd': '#000'}`}}>
      <LanIcon fontSize='small'/>
      <Typography width={'100%'} variant="caption" fontSize={'0.5rem'}>{data.label}</Typography>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </Box>
    </Tooltip>
  );
};
