import {
  Background,
  Controls,
  Edge,
  Node,
  ReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Skeleton, useTheme } from '@mui/material';
import { useMemo } from 'react';


import { getLayoutedElements } from '../ts/helpers';
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
      (graph.links ?? []).map((l: any) => ({
        id: l.id ?? `${l.source}-${l.target}`,
        source: l.source,
        target: l.target,
        animated: !!l.animated,
        selectable: false,
      })) ?? [];

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
      <div
        style={{
          height: 450,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: 8,
          background: '#fafafa',
          color: '#777',
        }}
      >
        No topology available for this network.
      </div>
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
