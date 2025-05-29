// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import {EdgeData, NodeData} from "@antv/g6";

import {SemanticTriple} from "types/semanticTypes.ts";

import {SPARQLItemType} from "./transformTripleDataToGraphin.ts";

const getColor = (itemType: SPARQLItemType) => {
    switch (itemType) {
        case SPARQLItemType.Variable:
            return '#c44601';
        case SPARQLItemType.Term:
            return '#8babf1';
        default:
            return 'red';
    }
}

const createGraphinLabel = (id: string, termLabel?: string): string => {
    return termLabel ? `${id}\n${termLabel}` : id.split("/").at(-1)||"";
}

export const createNode = (id: string, itemType: SPARQLItemType, termLabel?: string): NodeData => {
    const color = getColor(itemType);

    return (
        {
            id: id,
            type: "circle",
            data: {
                type: itemType,
            },
            style: {
                labelText: createGraphinLabel(parseNameFromWikidataUrl(id), termLabel),
                fill: color,
                stroke: color,
                fillOpacity: 0.1,
                size: 30,
                lineWidth: 1
            }
        }
    )
}

export const createEdge = (triple: SemanticTriple, itemType: SPARQLItemType, termLabel?: string): EdgeData => {
    return (
        {
            // If you add an ID the graph will automatically filter out duplicates.
            // I think it's actually beneficial to show duplications to catch weird queries.
            // id: `${triple.subject}-${triple.predicate}-${triple.object}`,
            source: triple.subject.value,
            target: triple.object.value,
            style: {
                labelText: createGraphinLabel(parseNameFromWikidataUrl(triple.predicate.value), termLabel),
                keyshape: {
                    stroke: getColor(itemType),
                    lineWidth: 2
                }
            }
        }
    )
}

export const parseNameFromWikidataUrl = (url:string) => url.split("/").at(-1)||""