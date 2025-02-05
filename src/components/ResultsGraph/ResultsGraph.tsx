// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { useMemo } from "react";

import Graphin, { IUserEdge, IUserNode } from "@antv/graphin";

import { ActionIcon } from "@mantine/core";
import { IconFocus } from "@tabler/icons-react";

import { useGraphinRef } from "hooks/useGraphinRef";
import { useParsedQueryData } from "hooks/useParsedQueryData";

import { SparqlBindingType, SparqlResultsJsonType, SparqlValueObjectType } from "types/sparql";

import styles from "./ResultsGraph.module.scss"
import { useAppSelector } from "redux/store";

export function ResultsGraph({data}:{data: SparqlResultsJsonType}) {
  const results = useAppSelector(state => state.results.results)

  const queryGraphData = useParsedQueryData()

  const graphData = useMemo(() => {
    // const nodesMap = new Map()
    // queryGraphData.nodes.forEach((node) => {
    //   nodesMap.set(node.id, node)
    // })

    // const edgesMap = new Map()
    // queryGraphData.edges.forEach((edge) => {
    //   edgesMap.set(JSON.stringify({source:edge.source,target:edge.target}), edge)
    // })

    const actualNodes:IUserNode[] = []
    const actualEdges:IUserEdge[] = []

    const addedNodeIDsSet = new Set<string>()
    data.results.bindings.forEach((row, rowIndex) => {
      const idMap = new Map()

      queryGraphData.nodes.forEach((node) => {
        const cell = row[node.id]
        const cellLabel = row[node.id+"Label"]
        const nodeCopy:IUserNode = JSON.parse(JSON.stringify(node))
        if(cell) {
          nodeCopy.id = cell.value
          //@ts-ignore
          nodeCopy.style.label.value = cellLabel?.value || cell.value
        }
        else if(node.data.type === "Variable") {
          nodeCopy.id = `${node.id}----${rowIndex}`
          //@ts-ignore
          nodeCopy.style.label.value = `${node.id}----${rowIndex}`
        }
        if(!addedNodeIDsSet.has(nodeCopy.id)) {
          actualNodes.push(nodeCopy)
        }
        addedNodeIDsSet.add(nodeCopy.id)
        idMap.set(node.id,nodeCopy.id)
      })

      queryGraphData.edges.forEach(edge => {
        const source = row[edge.source]
        const sourceNode = queryGraphData.nodes.find(n => n.id === edge.source) as IUserNode
        const target = row[edge.target]
        const targetNode = queryGraphData.nodes.find(n => n.id === edge.target) as IUserNode
        const edgeCopy:IUserEdge = JSON.parse(JSON.stringify(edge))
        edgeCopy.source = idMap.get(sourceNode.id)
        edgeCopy.target = idMap.get(targetNode.id)
        edgeCopy.id = `${edgeCopy.source}-${edgeCopy.target}`
        actualEdges.push(edgeCopy)
      })
    })

    return {
      nodes: actualNodes,
      edges: actualEdges,
    }
  }, [data, queryGraphData])

  console.log("graphData",graphData)

  const { graphRef, recenter } = useGraphinRef()


  return (
    <div className={styles["graph-container"]}>
      <Graphin data={graphData} ref={graphRef} layout={{type: 'dagre', rankdir: 'LR'}} style={{height:1000}}>
        <ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Re-Center" onClick={() => recenter()}>
            <IconFocus/>
        </ActionIcon>
      </Graphin>
      {/* <pre>{JSON.stringify(data, undefined, 2)}</pre>
      <pre>{JSON.stringify(queryGraphData, undefined, 2)}</pre> */}
    </div>
  )
}
