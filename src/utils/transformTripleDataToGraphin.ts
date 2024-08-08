// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import {SemanticTriple} from "../types/semanticTypes.ts";
import {GraphinData, Utils} from "@antv/graphin";
import {createEdge, createNode, parseNameFromWikidataUrl} from "./graphin.ts";
import { IDTableEntitiesType } from "../types/idTable.ts";

export enum SPARQLItemType {
    Term = "Term",
    Variable = "Variable"
}

type TermType = (SemanticTriple['subject'] | SemanticTriple["predicate"] | SemanticTriple['object'])["termType"]

const isSPARQLVariable = (termType: TermType): boolean => termType === "Variable"

const getSPARQLItemType = (termType: TermType): SPARQLItemType => (
    isSPARQLVariable(termType) ? SPARQLItemType.Variable : SPARQLItemType.Term
)

/**
 * This function uses JSON.stringify and a string Set to return a unique array of SemanticTriple subjects and objects
 * @param triples   all the SemanticTriples, including duplicates
 * @returns         unique array of SemanticTriple subjects and objects
 */
const extractUniqueEntitiesFromTriples = (triples: SemanticTriple[]): (SemanticTriple['subject'] | SemanticTriple['object'])[] => {
    const entities = new Set<string>();
    triples.forEach(d => {
        //stringify the subject and object and add them to the set
        entities.add(JSON.stringify(d.subject));
        entities.add(JSON.stringify(d.object));
    })

    //convert the set back into SemanticTriple subjects and objects
    return Array.from(entities).map(s => JSON.parse(s) as SemanticTriple['subject'] | SemanticTriple['object']);
}

/**
 * This function tries to get the label of the ID from the entity dictionary.
 * @param id                The entity or proeprty id, ex "P166"
 * @param idTableEntities   The array of entities for the ID table
 * @returns                 The label for the id if it exists in the dictionary, ex "award received"
 */
const getTermLabel = (id: string, idTableEntities?: IDTableEntitiesType[]) => idTableEntities?.find(e => e.id===id)?.label

export const transformTripleQueryToGraphin = (triples: SemanticTriple[], idTableEntities?: IDTableEntitiesType[]): GraphinData => {
    //create the nodes for the graph
    const uniqueEntities = extractUniqueEntitiesFromTriples(triples);
    const nodes = uniqueEntities.map(entity => (
        createNode(
            entity.value,
            getSPARQLItemType(entity.termType),
            getTermLabel(entity.value.split("/").at(-1)||"", idTableEntities)
        )
    ));

    //create the edges for the graph
    const edges = Utils.processEdges(triples.map(triple => (
        createEdge(
            triple, 
            getSPARQLItemType(triple.predicate.termType), 
            getTermLabel(parseNameFromWikidataUrl(triple.predicate.value), idTableEntities)
        )
    )), { poly: 50 });

    return {nodes, edges}
}
