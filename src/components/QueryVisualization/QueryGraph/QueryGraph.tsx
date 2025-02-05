// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import Graphin, {Components, LegendChildrenProps} from "@antv/graphin";
import '@antv/graphin/dist/index.css';
import { ActionIcon, Title } from '@mantine/core';

import { IconFocus } from "@tabler/icons-react";

import { useGraphinRef } from "hooks/useGraphinRef";
import { useParsedQueryData } from "hooks/useParsedQueryData";

import styles from "./QueryGraph.module.scss"

const { Legend } = Components;

export const QueryGraph = () => {
    const queryGraphData = useParsedQueryData()

    const { graphRef, recenter } = useGraphinRef()

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

                <ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Re-Center" onClick={() => recenter()}>
                    <IconFocus/>
                </ActionIcon>
            </div>
        </div>
    )
}
