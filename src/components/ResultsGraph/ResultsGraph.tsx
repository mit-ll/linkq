// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { useMemo } from "react";

import Graphin, { IUserEdge, IUserNode } from "@antv/graphin";

import { ActionIcon } from "@mantine/core";
import { IconFocus } from "@tabler/icons-react";

import { useGraphinRef } from "hooks/useGraphinRef";
import { useParsedQueryData } from "hooks/useParsedQueryData";

import { SparqlResultsJsonType } from "types/sparql";

import styles from "./ResultsGraph.module.scss"
import { useAppSelector } from "redux/store";

export function ResultsGraph({data}:{data: SparqlResultsJsonType}) {
  const queryValue = useAppSelector(state => state.results.results?.queryValue)

  const queryGraphData = useParsedQueryData(queryValue || "")

  const graphData = useMemo(() => {
    //application/sparql+json format doesn't actually have the schema 
    //information we need to properly connect the nodes in the results.
    //Instead, we apply the parsed query structure to each row that
    //we get back in our results

    //will hold the results nodes and edges
    const nodes:IUserNode[] = []
    const edges:IUserEdge[] = []
    if(queryGraphData.nodes.length === 0) return { nodes, edges }

    //tracks which node IDs we have already added, so we don't duplicate
    const addedNodeIDsSet = new Set<string>()

    //loop through all the bindings, aka rows in our results
    data.results.bindings.forEach((row, rowIndex) => {
      //this tracks how we're mapping the node IDs parsed from the query,
      //vs the node IDs we're copying and adding to the results graph
      const queryToResultsNodeIDMap = new Map()

      //loop through all the nodes in the query
      queryGraphData.nodes.forEach((node) => {
        //make a deep copy of the node from the query
        const nodeCopy:IUserNode = JSON.parse(JSON.stringify(node))

        //attempt to find the node as a cell from the results
        const cell = row[node.id]
        const cellLabel = row[node.id+"Label"] //HARDCODED specific to Wikidata
        if(cell) { //if the cell is present in the results
          nodeCopy.id = cell.value //set the ID to the entity URI
          if(nodeCopy?.style?.label) { //set the entity label
            nodeCopy.style.label.value = cellLabel?.value || cell.value
          }
        }
        else if(node.data.type === "Variable") {
          nodeCopy.id = `${node.id} - ${rowIndex}` //we need to duplicate this variable node
          if(nodeCopy?.style?.label) { //set the node label
            nodeCopy.style.label.value = node.id
          }
        }
        //else this is a Term variable from the query that does not need to be modified

        //if we have not added this node yet
        if(!addedNodeIDsSet.has(nodeCopy.id)) {
          nodes.push(nodeCopy) //add the node to our results graph
        }
        addedNodeIDsSet.add(nodeCopy.id) //record that we added this node
        queryToResultsNodeIDMap.set(node.id,nodeCopy.id) //record any changes we made to the copy
      })

      //loop through the edges
      queryGraphData.edges.forEach(edge => {
        //find the original source and target node from the query
        const sourceNode = queryGraphData.nodes.find(n => n.id === edge.source)
        const targetNode = queryGraphData.nodes.find(n => n.id === edge.target)

        //if we found the original source and target node
        if(sourceNode && targetNode) {
          //make a deep copy of the edge from the query
          const edgeCopy:IUserEdge = JSON.parse(JSON.stringify(edge))

          //set this edge to connect the node copies we made earlier
          edgeCopy.source = queryToResultsNodeIDMap.get(sourceNode.id)
          edgeCopy.target = queryToResultsNodeIDMap.get(targetNode.id)
          edgeCopy.id = `${edgeCopy.source}-${edgeCopy.target}`

          //add the edge to our results graph
          edges.push(edgeCopy)
        }
      })
    })

    return { nodes, edges }
  }, [data, queryGraphData])

  const { graphRef, recenter } = useGraphinRef()

  if(graphData.nodes.length===0) return null


  return (
    <div className={styles["graph-container"]}>
      <Graphin data={graphData} ref={graphRef} layout={{type: 'graphin-force'}} style={{height:700}}>
        <ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Re-Center" onClick={() => recenter()}>
          <IconFocus/>
        </ActionIcon>
      </Graphin>
    </div>
  )
}
