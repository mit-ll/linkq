import Graphin from "@antv/graphin";
import { useRef } from "react";

export function useGraphinRef() {
  const graphRef = useRef<Graphin>(null)
  const recenter = () => {
    if(graphRef.current) {
      const graph = graphRef.current.graph;
      graph.fitView(); // Re-centers and fits graph to view
    }
  }
  return {
    graphRef,
    recenter,
  }
}