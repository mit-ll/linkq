// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import {useMemo, useState} from "react";

import {EdgeData, NodeData} from "@antv/g6";

import {useParsedQueryData} from "hooks/useParsedQueryData";

import {SparqlResultsJsonType} from "types/sparql";

import styles from "./ResultsGraph.module.scss"
import {useAppSelector} from "redux/store";
import {Graphin} from "@antv/graphin";

import {ExtensionCategory, register} from '@antv/g6';
import {ReactNode} from '@antv/g6-extension-react';
import {DataGrid, GridColDef, GridRowParams} from "@mui/x-data-grid";

interface NodeTableProps {
    node: NodeData,
    hoveredRow?: string | null,
    handleOnRowEnter?: (params: GridRowParams) => void
}

register(ExtensionCategory.NODE, 'react', ReactNode);


const columns: GridColDef[] = [
    {field: 'idLabel', headerName: 'ID', width: 150},
    {field: 'uri', headerName: 'URI', width: 150},
    {field: 'label', headerName: 'Label', width: 150}
];
const NodeTable = ({node, hoveredRow, handleOnRowEnter}: NodeTableProps) => {
    // @ts-ignore
    const rows = node.data.entries.map((element, i) => {
            return {id: node.id + element.uri + i, idLabel: node.id, uri: element.uri, label: element.label, key: node.id + element.uri}
        }
    );
    return (
        <DataGrid rows={rows} columns={columns} onRowClick={handleOnRowEnter} getRowClassName={(params) => params.id === hoveredRow ? 'highlight' : ''} sx={{'& .highlight': {backgroundColor: '#d3f9d8 !important'}}}/>
    );
}

const Node = () => {

    return (
        <div>
            Test
        </div>
    );
};

export function ResultsGraph({data}: { data: SparqlResultsJsonType }) {
    const queryValue = useAppSelector(state => state.results.results?.queryValue)

    const queryGraphData = useParsedQueryData(queryValue || "")
    const [hoveredRow, setHoveredRow] = useState<string | null>(null);

    const handleOnRowEnter = (params: GridRowParams) => {
      console.log(params);
      // setHoveredRow(params.id as string)
    };

    const graphData = useMemo(() => {
        //application/sparql+json format doesn't actually have the schema
        //information we need to properly connect the nodes in the results.
        //Instead, we apply the parsed query structure to each row that
        //we get back in our results

        //will hold the results nodes and edges
        let nodes: NodeData[] = []
        let edges: EdgeData[] = []
        if (queryGraphData?.nodes?.length === 0) return {nodes: nodes, edges: edges}

        // @ts-ignore
        nodes = queryGraphData.nodes.map(n => {
            const data = {...n.data, entries: []};

            return {...n, data: data};
        })
        console.log(nodes);

        edges = JSON.parse(JSON.stringify(queryGraphData.edges));

        //loop through all the bindings, aka rows in our results
        data.results.bindings.forEach((row) => {
            //loop through all the nodes in the query
            nodes.forEach((node) => {
                //attempt to find the node as a cell from the results
                const cell = row[node.id]
                const cellLabel = row[node.id + "Label"] //HARDCODED specific to Wikidata
                if (cell) { //if the cell is present in the results
                    // @ts-ignore
                    node.data.entries.push({uri: cell.value, label: cellLabel?.value || cell.value})
                    node.type = 'react'
                    node.style = {
                        size: [500, 300],
                        component: <NodeTable node={node} hoveredRow={hoveredRow} handleOnRowEnter={handleOnRowEnter}/>,
                    }
                }
            })
        })

        return {nodes: nodes, edges: edges}
    }, [data, queryGraphData])

    // const { graphRef, recenter } = useGraphinRef()

    if (graphData.nodes.length === 0) return null
    console.log(graphData);


    return (
        <div className={styles["graph-container"]}>
            <Graphin options={{
                autoResize: true, data: graphData, layout: {type: 'force'},
                behaviors: ['drag-element', 'drag-canvas', 'zoom-canvas'],
                plugins: [{
                    type: 'legend',
                    key: 'legend',
                    nodeField: 'type',
                    edgeField: 'type',
                    itemLabelFontSize: 12,
                    position: 'right'
                },]
            }} style={{height: 700, background: "white"}}>
            </Graphin>
            {/*<ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Re-Center" onClick={() => recenter()}>*/}
            {/*  <IconFocus/>*/}
            {/*</ActionIcon>*/}
        </div>
    )
}
