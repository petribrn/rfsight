import LanIcon from '@mui/icons-material/Lan';
import {
  Background,
  Controls,
  Edge,
  Node,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { alpha, Box, Skeleton, Typography, useTheme } from '@mui/material';
import { useMemo } from 'react';


import { formatThroughput, getLayoutedElements } from '../ts/helpers';
import { DefaultTopologyNode, LldpTopologyNode, WifiStationTopologyNode } from './TopologyNodeTypes';

type Props = {
  graph: any
};

const nodeTypes = {
  adoptedDevice: DefaultTopologyNode,
  wifiStation: WifiStationTopologyNode,
  lldp: LldpTopologyNode
};

export const TopologyViewer = ({ graph }: Props) => {
  const theme = useTheme();

  const reactflowData = useMemo(() => {
    if (!graph) return null;

    const nodes: Node[] =
      (graph.nodes ?? []).map((n: any) => ({
        id: n.id,
        type: n.type,
        data: { ...n, online: n.online, latency: n.latency, label: n.name ?? n.label ?? n.id },
        position: { x: 0, y: 0 },
        draggable: true,
        selectable: true,
      })) ?? [];

    const edges: Edge[] =
      (graph.links ?? []).map((l: any) => {
        const sourceNode = graph.nodes.find((n: any) => n.id === l.source);
        const targetNode = graph.nodes.find((n: any) => n.id === l.target);

        const sourceOffline = sourceNode?.type === "adoptedDevice" && sourceNode?.online === false;
        const targetOffline = targetNode?.type === "adoptedDevice" && targetNode?.online === false;
        const isDegraded = sourceOffline || targetOffline;

        let label: string | undefined;

        if (sourceNode?.type === "wifiStation") {
          const dl = formatThroughput(sourceNode.throughput_rx_bps ?? 0);
          const ul = formatThroughput(sourceNode.throughput_tx_bps ?? 0);
          label = `↓ ${dl.value} ${dl.format} | ↑ ${ul.value} ${ul.format}`;
        }

        if (!label && targetNode?.type === "wifiStation") {
          const dl = formatThroughput(targetNode.throughput_rx_bps ?? 0);
          const ul = formatThroughput(targetNode.throughput_tx_bps ?? 0);
          label = `↓ ${dl.value} ${dl.format} | ↑ ${ul.value} ${ul.format}`;
        }

        const strokeColor = isDegraded ? "#d32f2f" : "#999";
        const labelBgColor = isDegraded ? "rgba(211,47,47,0.25)" : "rgba(255,255,255,0.6)";
        const labelColor = isDegraded ? "#b71c1c" : "#333";

        return {
          id: l.id ?? `${l.source}-${l.target}`,
          source: l.source,
          target: l.target,
          animated: !isDegraded && !!l.animated,
          selectable: false,
          label,
          style: {
            stroke: strokeColor,
            strokeWidth: isDegraded ? 2 : 1.4,
          },
          labelBgPadding: [6, 3],
          labelBgBorderRadius: 4,
          labelBgStyle: { fill: labelBgColor },
          labelStyle: { fontSize: "0.3rem", fontWeight: 600, fill: labelColor }
        };
      }) ?? [];

    const { nodes: laidOutNodes, edges: laidOutEdges } = getLayoutedElements(nodes, edges, {
      direction: 'TB',
    });

    return { nodes: laidOutNodes, edges: laidOutEdges };
  }, [graph]);

  if (!graph) {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        <Skeleton variant="rectangular" width="100%" height={'100%'} />
      </div>
    );
  }

  if (!graph.nodes || graph.nodes.length === 0) {
    return (
      <Box
        width={'100%'}
        height={'100%'}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        justifyContent={'center'}
        justifyItems={'center'}
      >
        <Typography
          variant="button"
          fontSize={'small'}
          color={alpha(theme.palette.text.primary, 0.5)}
        >
          Não há dados de topologia no momento
        </Typography>
        <LanIcon
          fontSize="small"
          sx={{
            fill: alpha(theme.palette.text.primary, 0.5),
          }}
        />
      </Box>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <ReactFlowProvider fitView>
        <ReactFlow
          nodes={reactflowData!.nodes}
          edges={reactflowData!.edges}
          proOptions={{hideAttribution: true}}
          nodeTypes={nodeTypes}
          fitView
          zoomOnScroll
          panOnDrag
          nodesDraggable
          colorMode={theme.palette.mode}
        >
          <Background gap={12} size={1} color="#d0d0d0" />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
};
