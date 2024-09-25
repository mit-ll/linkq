// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { ErrorBoundary } from "react-error-boundary";
import { useEffect, useState } from "react";

import { useAppSelector } from "redux/store.ts";

import { QueryGraph } from "./QueryGraph/QueryGraph.tsx";

const QueryVisualizationFallback = () => {
    return (<></>)
}

export const QueryVisualization = () => {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)

    const [key, setKey] = useState(0);

    // This should definitely debounce or something but...
    useEffect(() => {
        setKey(prevKey => prevKey + 1);
    }, [queryValue]);

    return (
        <ErrorBoundary key={key} FallbackComponent={QueryVisualizationFallback}>
            <QueryGraph/>
        </ErrorBoundary>
    )
}
