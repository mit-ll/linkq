// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import Graphin, {Components, LegendChildrenProps} from "@antv/graphin";
import {parseSparqlQuery} from "../../../utils/parseSparqlQuery.ts";
import {getEntityDataFromQuery} from "../../../utils/getEntityData.ts";
import {transformTripleQueryToGraphin} from "../../../utils/transformTripleDataToGraphin.ts";
import {useMemo} from "react";
import { Title } from '@mantine/core';
import '@antv/graphin/dist/index.css';
import { useAppSelector } from "../../../redux/store.ts";

const { Legend } = Components;

export const QueryGraph = () => {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)

    const {data: entityData} = getEntityDataFromQuery(queryValue);

    const queryGraphData = useMemo(() => {
        const semanticTriples = parseSparqlQuery(queryValue);

        return transformTripleQueryToGraphin(semanticTriples, entityData?.entities);
    }, [queryValue, entityData]);

    if(queryGraphData.nodes.length===0) return null

    return (
        <div>
            <Title style={{color:"white", marginLeft: 13, marginBottom: 7, marginTop: 7, padding: 1}} order={4}>Query Structure Graph</Title>
            <div style={{height: '400px'}}>
                <Graphin data={queryGraphData} layout={{type: 'dagre', rankdir: 'LR'}} style={{minHeight: "unset"}}>
                    <Legend bindType="node" sortKey="data.type">
                        {(renderProps: LegendChildrenProps) => {
                            return <Legend.Node {...renderProps} />;
                        }}
                    </Legend>
                </Graphin>
            </div>
        </div>
    )
}
