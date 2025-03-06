// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT


import {useAppSelector} from "redux/store";

import {Graphin} from "@antv/graphin";

import {Title} from '@mantine/core';

import {useGraphinRef} from "hooks/useGraphinRef";
import {useParsedQueryData} from "hooks/useParsedQueryData";

import styles from "./QueryGraph.module.scss"
import {useEffect} from "react";
import {Fullscreen} from "@antv/g6";


export const QueryGraph = () => {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)

    const queryGraphData = useParsedQueryData(queryValue)

    const {graphRef, recenter} = useGraphinRef()

    useEffect(() => {
        setTimeout(() => {
            recenter()
        },1000)
    }, [queryGraphData])

    if (queryGraphData?.nodes?.length === 0) return null

    return (
        <div>
            <Title style={{color: "white", marginLeft: 13, marginBottom: 7, marginTop: 7, padding: 1}} order={4}>Query
                Structure Graph</Title>
            <div id={styles["graph-container"]}>
                <Graphin options={{
                    autoResize: true,
                    data: queryGraphData,
                    layout: {type: 'dagre', rankdir: 'LR', nodesep: 150, ranksep: 150},
                    behaviors: ['drag-element', 'drag-canvas', 'zoom-canvas'],
                    plugins: [{
                        type: 'legend',
                        key: 'legend',
                        nodeField: 'type',
                        edgeField: 'type',
                        itemLabelFontSize: 12,
                        position: 'top-right,'
                    }, {
                        type: 'fullscreen',
                        key: 'fullscreen',
                    }, {
                        type: 'toolbar',
                        key: 'toolbar',
                        position: 'top-left',
                        onClick: (item: string) => {
                            const fullscreenPlugin = graphRef?.current?.getPluginInstance<Fullscreen>('fullscreen');
                            if (fullscreenPlugin) {
                                if (item === 'request-fullscreen') {
                                    fullscreenPlugin.request();
                                }
                                if (item === 'exit-fullscreen') {
                                    fullscreenPlugin.exit();
                                }
                            }
                            if (item === 'auto-fit') {
                                recenter();
                            }
                        },
                        getItems: () => {
                            return [
                                {id: 'request-fullscreen', value: 'request-fullscreen'},
                                {id: 'exit-fullscreen', value: 'exit-fullscreen'},
                                {id: 'auto-fit', value: 'auto-fit'},
                            ];
                        },
                    }]
                }} ref={graphRef} style={{minHeight: "unset", background: "white"}}>
                </Graphin>
            </div>
        </div>
    )
}
