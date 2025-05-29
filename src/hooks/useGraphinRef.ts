import { Graph as G6Graph } from '@antv/g6';
import { useRef } from "react";

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