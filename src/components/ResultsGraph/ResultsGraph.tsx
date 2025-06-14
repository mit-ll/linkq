import {useCallback, useEffect, useRef, useState} from 'react';
import {EdgeData, ExtensionCategory, Fullscreen, Graph as G6Graph, GraphData, NodeData, register} from '@antv/g6';
import {isTableNodeType, NodeTable} from "./TableNode.tsx";
import {useAppSelector} from "../../redux/store.ts";
import {useParsedQueryData} from "../../hooks/useParsedQueryData.ts";
import {GridRowParams} from "@mui/x-data-grid";
import {SparqlResultsJsonType} from "../../types/sparql.ts";
import {ReactNode} from "@antv/g6-extension-react";

register(ExtensionCategory.NODE, 'react', ReactNode);

interface CreateDataProps {
    queryGraphData: GraphData,
    data: SparqlResultsJsonType,
    selectedRow?: number | null,
    handleRowSelection?: (params: GridRowParams) => void
}

const createData = ({queryGraphData, data, selectedRow, handleRowSelection}: CreateDataProps) => {
    let nodes: NodeData[] = []
    let edges: EdgeData[] = []
    if (queryGraphData?.nodes && queryGraphData?.nodes?.length !== 0) {

        nodes = queryGraphData.nodes.map(n => {
            const data = {...n.data, rows: []};

            return {...n, data: data};
        })

        edges = JSON.parse(JSON.stringify(queryGraphData.edges));

        //loop through all the bindings, aka rows in our results
        data.results.bindings.forEach((row) => {
            //loop through all the nodes in the query
            nodes.forEach((node) => {
                //attempt to find the node as a cell from the results
                const cell = row[node.id]
                const cellLabel = row[node.id + "Label"] //HARDCODED specific to Wikidata
                if (cell) { //if the cell is present in the results
                    if (isTableNodeType(node)) {
                        node.data.rows.push({
                            cell,
                            cellLabel,
                        })
                    }
                }
            })
        })

        nodes.forEach((node) => {
            if (isTableNodeType(node) && node.data.rows.length>0) {
                node.type = 'react'
                node.style = {
                    size: [500, 400],
                    component: (
                        <NodeTable
                            node={node}
                            selectedRow={selectedRow}
                            handleRowSelection={handleRowSelection}
                        />
                    ),
                }
            }
        })
    }
    return {nodes: nodes, edges: edges};
}

export const ResultsGraph = ({data}: { data: SparqlResultsJsonType }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const graphRef = useRef<G6Graph>();

    const queryValue = useAppSelector(state => state.results.results?.queryValue)

    const queryGraphData = useParsedQueryData(queryValue || "");

    const [selectedRow, setSelectedRow] = useState<number | null>(null);

    queryGraphData.nodes = queryGraphData?.nodes?.map(d => {
        const type = d.id === 'statement' ? "Statement" : d?.data?.type;
        return {...d, data: {...d.data, type: type}}
    });

    const handleRowSelection = useCallback((params: GridRowParams) => {
        const rowIdx = params.row.index as number;
        setSelectedRow(rowIdx)
    }, []);


    useEffect(() => {
        const graphData = createData({queryGraphData, data, selectedRow, handleRowSelection});

        const graph = new G6Graph({
            container: containerRef.current || undefined,
            data: graphData,
            layout: {type: 'dagre', rankdir: 'LR'},
            behaviors: [{
                type: 'drag-element',
                key: 'drag-element',
            }, {
                type: 'zoom-canvas',
                key: 'zoom-canvas',
                preventDefault: true,
            }, {
                type: 'drag-canvas',
                key: 'drag-canvas',
            }],
            plugins: [{
                type: 'legend',
                key: 'legend',
                nodeField: 'type',
                edgeField: 'type',
                itemLabelFontSize: 12,
                position: 'top-right'
            }, {
                type: 'fullscreen',
                key: 'fullscreen',
            },],
        });
        graphRef.current = graph;

        graph.setPlugins((prev) => [
            ...prev,
            {
                type: 'toolbar',
                key: 'toolbar',
                position: 'top-left',
                onClick: (item: string) => {
                    const fullscreenPlugin = graph.getPluginInstance<Fullscreen>('fullscreen');
                    if (item === 'request-fullscreen') {
                        fullscreenPlugin.request();
                    }
                    if (item === 'exit-fullscreen') {
                        fullscreenPlugin.exit();
                    }
                    if (item === 'auto-fit') {
                        graph.fitView();
                    }
                },
                getItems: () => {
                    return [
                        {id: 'request-fullscreen', value: 'request-fullscreen'},
                        {id: 'exit-fullscreen', value: 'exit-fullscreen'},
                        {id: 'auto-fit', value: 'auto-fit'},
                    ];
                },
            },
        ]);

        graph.render().then(() => graph.render()).then(() => graph.fitView());

        return () => {
            const graph = graphRef.current;
            if (graph) {
                graph.destroy();
                graphRef.current = undefined;
            }
        };
    }, []);

    useEffect(() => {
        if (graphRef.current) {
            const graph = graphRef.current;

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === 'Shift') {
                    graph.updateBehavior({
                        key: 'drag-element',
                        enable: false,
                    });
                }
            };

            const handleKeyUp = (e: KeyboardEvent) => {
                if (e.key === 'Shift') {
                    graph.updateBehavior({
                        key: 'drag-element',
                        enable: true,
                    });
                }
            };

            window.addEventListener('keydown', handleKeyDown);
            window.addEventListener('keyup', handleKeyUp);

            return () => {
                window.removeEventListener('keydown', handleKeyDown);
                window.removeEventListener('keyup', handleKeyUp);
            };
        }
    }, []);

    useEffect(() => {
        const graphData = createData({queryGraphData, data, selectedRow, handleRowSelection});

        if (graphRef.current) {
            const graph = graphRef.current;
            graph.updateData(graphData);
            graph.draw();
        }
    }, [data, queryGraphData, selectedRow]);

    return (<div style={{width: '100%', height: '100%', background: 'white'}} ref={containerRef}/>);
};