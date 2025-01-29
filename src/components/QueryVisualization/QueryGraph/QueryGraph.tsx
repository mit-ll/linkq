// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import {useMemo, useRef} from "react";

import Graphin, {Components, LegendChildrenProps} from "@antv/graphin";
import '@antv/graphin/dist/index.css';
import { ActionIcon, Title } from '@mantine/core';

import { useAppSelector } from "redux/store.ts";

import { parseSparqlQuery } from "utils/parseSparqlQuery.ts";
import { transformTripleQueryToGraphin } from "utils/transformTripleDataToGraphin.ts";
import { useQueryGetIDTableEntitiesFromQuery } from "utils/knowledgeBase/getEntityData.ts";
import { IconFocus } from "@tabler/icons-react";

import styles from "./QueryGraph.module.scss"

const { Legend } = Components;

export const QueryGraph = () => {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)

    const {data: idTableEntities} = useQueryGetIDTableEntitiesFromQuery(queryValue);

    const queryGraphData = useMemo(() => {
        const semanticTriples = parseSparqlQuery(queryValue);

        return transformTripleQueryToGraphin(semanticTriples, idTableEntities||undefined);
    }, [queryValue, idTableEntities]);

    const graphRef = useRef<Graphin>(null)
    const center = () => {
        if(graphRef.current) {
            const graph = graphRef.current.graph;
            graph.fitView(); // Re-centers and fits graph to view
        }
    }


    if(queryGraphData.nodes.length===0) return null

    return (
        <div>
            <Title style={{color:"white", marginLeft: 13, marginBottom: 7, marginTop: 7, padding: 1}} order={4}>Query Structure Graph</Title>
            <div id={styles["graph-container"]}>
                <Graphin data={queryGraphData} ref={graphRef} layout={{type: 'dagre', rankdir: 'LR'}} style={{minHeight: "unset"}}>
                    <Legend bindType="node" sortKey="data.type">
                        {(renderProps: LegendChildrenProps) => {
                            return <Legend.Node {...renderProps} />;
                        }}
                    </Legend>
                </Graphin>

                <ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Center" onClick={() => center()}>
                    <IconFocus/>
                </ActionIcon>
            </div>
        </div>
    )
}
