// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import {SemanticTriple, SemanticTripleQueryData} from "../types/semanticTypes.ts";
import {GraphinData, Utils} from "@antv/graphin";
import {EntityDictionary} from "../types/wikidata.ts";
import {createEdge, createNode} from "./graphin.ts";

export enum SPARQLItemType {
    Term = "Term",
    Variable = "Variable"
}

const isSPARQLVariable = (str: string): boolean => {
    return str.startsWith("?");
}

const getSPARQLItemType = (str: string): SPARQLItemType => {
    return isSPARQLVariable(str) ? SPARQLItemType.Variable : SPARQLItemType.Term;
}

const extractUniqueEntitiesFromTriples = (triples: SemanticTriple[]): string[] => {
    const entities = new Set<string>();
    triples.forEach(d => {
        entities.add(d.subject);
        entities.add(d.object);
    })
    return [...entities];
}

const getTermLabel = (id: string, data?: EntityDictionary) => {
    return data && data[id]?.labels?.en?.value;
}

export const transformTripleQueryToGraphin = ({triples}: SemanticTripleQueryData, data?: EntityDictionary): GraphinData => {
    const entities = extractUniqueEntitiesFromTriples(triples);

    const nodes = entities.map(d => {
        return (createNode(d, getSPARQLItemType(d), getTermLabel(d, data)));
    });

    const edges = Utils.processEdges(triples.map(d => {
        return (createEdge(d, getSPARQLItemType(d.predicate), getTermLabel(d.predicate, data)));
    }), { poly: 50 });

    return {nodes: nodes, edges: edges}
}
