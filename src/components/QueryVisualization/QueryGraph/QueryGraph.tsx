// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT


import { useAppSelector } from "redux/store";

import { Graphin } from "@antv/graphin";

import { ActionIcon, Title } from '@mantine/core';

import { IconFocus } from "@tabler/icons-react";

import { useGraphinRef } from "hooks/useGraphinRef";
import { useParsedQueryData } from "hooks/useParsedQueryData";

import styles from "./QueryGraph.module.scss"


export const QueryGraph = () => {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)
    
    const queryGraphData = useParsedQueryData(queryValue)

    const { graphRef, recenter } = useGraphinRef()

    if(queryGraphData?.nodes?.length===0) return null

    return (
        <div>
            <Title style={{color:"white", marginLeft: 13, marginBottom: 7, marginTop: 7, padding: 1}} order={4}>Query Structure Graph</Title>
            <div id={styles["graph-container"]}>
                <Graphin options={{autoResize: true, data: queryGraphData, layout: {type: 'dagre', rankdir: 'LR', nodesep: 150, ranksep: 150},
                    behaviors: ['drag-element', 'drag-canvas', 'zoom-canvas'],
                    plugins: [{
                        type: 'legend',
                        key: 'legend',
                        nodeField: 'type',
                        edgeField: 'type',
                        itemLabelFontSize: 12,
                        position: 'right'
                    },]}} ref={graphRef} style={{minHeight: "unset", background: "white"}}>
                </Graphin>
                <ActionIcon className={styles["recenter-button"]} size="sm" variant="filled" aria-label="Re-Center" onClick={() => recenter()}>
                    <IconFocus/>
                </ActionIcon>
            </div>
        </div>
    )
}
