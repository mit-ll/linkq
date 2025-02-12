import { useRef } from "react";
import { Graph as G6Graph } from '@antv/g6';

export function useGraphinRef() {
  const graphRef = useRef<G6Graph>(null)
  const recenter = () => {
    if(graphRef.current) {
      const graph = graphRef.current;
      graph.fitView(); // Re-centers and fits graph to view
    }
  }
  return {
    graphRef,
    recenter,
  }
}
