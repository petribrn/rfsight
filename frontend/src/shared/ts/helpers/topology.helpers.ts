import Dagre from '@dagrejs/dagre';
import { Edge, Node } from '@xyflow/react';

const DEFAULT_NODE_WIDTH = 100;
const DEFAULT_NODE_HEIGHT = 50;

type LayoutOptions = { direction?: 'TB' | 'LR' | 'RL' | 'BT' };

export const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = { direction: 'TB' }
): { nodes: Node[]; edges: Edge[] } => {
  const g = new Dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: options.direction ?? 'TB' });

  // add nodes
  nodes.forEach((n) => {
    // Dagre wants width/height numbers
    const width = (n.data && (n.data.width as number)) ?? (n.measured?.width ?? DEFAULT_NODE_WIDTH);
    const height = (n.data && (n.data.height as number)) ?? (n.measured?.height ?? DEFAULT_NODE_HEIGHT);
    g.setNode(n.id, { width, height });
  });

  // add edges only if both ends exist in the graph
  const nodeIds = new Set(nodes.map((n) => n.id));
  edges.forEach((e) => {
    if (nodeIds.has(e.source) && nodeIds.has(e.target)) {
      g.setEdge(e.source, e.target);
    }
  });

  Dagre.layout(g);

  const layoutedNodes = nodes.map((n) => {
    const dgNode = g.node(n.id);
    if (!dgNode) {
      // If dagre didn't compute position (edge case), keep original
      return n;
    }
    const x = dgNode.x - (dgNode.width ?? DEFAULT_NODE_WIDTH) / 2;
    const y = dgNode.y - (dgNode.height ?? DEFAULT_NODE_HEIGHT) / 2;

    return {
      ...n,
      position: { x, y },
      // mark position as settled so ReactFlow doesn't try to re-calc
      positionAbsolute: { x, y },
      // keep draggable true to allow user repositioning
      draggable: true,
    };
  });

  // edges remain the same structural array (ReactFlow expects edge array)
  const validEdges = edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));

  return { nodes: layoutedNodes, edges: validEdges };
}
