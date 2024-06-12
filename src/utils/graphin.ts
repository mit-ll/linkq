// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import {IUserEdge, IUserNode} from "@antv/graphin";
import {SemanticTriple} from "../types/semanticTypes.ts";
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

export const createNode = (id: string, itemType: SPARQLItemType, termLabel?: string): IUserNode => {
    const color = getColor(itemType);

    return (
        {
            id: id,
            type: "graphin-circle",
            data: {
                type: itemType,
            },
            style: {
                label: {value: createGraphinLabel(parseNameFromWikidataUrl(id), termLabel)},
                keyshape: {
                    fill: color,
                    stroke: color,
                    fillOpacity: 0.1,
                    size: 30,
                    lineWidth: 1
                }
            }
        }
    )
}

export const createEdge = (triple: SemanticTriple, itemType: SPARQLItemType, termLabel?: string): IUserEdge => {
    return (
        {
            // If you add an ID the graph will automatically filter out duplicates.
            // I think it's actually beneficial to show duplications to catch weird queries.
            // id: `${triple.subject}-${triple.predicate}-${triple.object}`,
            source: triple.subject.value,
            target: triple.object.value,
            style: {
                label: {value: createGraphinLabel(parseNameFromWikidataUrl(triple.predicate.value), termLabel), fill: 'black'},
                keyshape: {
                    stroke: getColor(itemType),
                    lineWidth: 2
                }
            }
        }
    )
}

export const parseNameFromWikidataUrl = (url:string) => url.split("/").at(-1)||""