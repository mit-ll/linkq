// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import SparqlJs, { BgpPattern, SelectQuery } from "sparqljs";
import {SemanticTriple} from "../types/semanticTypes.ts";

const PREFIXES = `PREFIX bd: <bd:>
PREFIX cc: <http://creativecommons.org/ns#>
PREFIX dct: <http://purl.org/dc/terms/>
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>
PREFIX owl: <http://www.w3.org/2002/07/owl#>
PREFIX p: <http://www.wikidata.org/prop/>
PREFIX pq: <http://www.wikidata.org/prop/qualifier/>
PREFIX pqn: <http://www.wikidata.org/prop/qualifier/value-normalized/>
PREFIX pqv: <http://www.wikidata.org/prop/qualifier/value/>
PREFIX pr: <http://www.wikidata.org/prop/reference/>
PREFIX prn: <http://www.wikidata.org/prop/reference/value-normalized/>
PREFIX prov: <http://www.w3.org/ns/prov#>
PREFIX prv: <http://www.wikidata.org/prop/reference/value/>
PREFIX ps: <http://www.wikidata.org/prop/statement/>
PREFIX psn: <http://www.wikidata.org/prop/statement/value-normalized/>
PREFIX psv: <http://www.wikidata.org/prop/statement/value/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX schema: <http://schema.org/>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
PREFIX wd: <http://www.wikidata.org/entity/>
PREFIX wdata: <http://www.wikidata.org/wiki/Special:EntityData/>
PREFIX wdno: <http://www.wikidata.org/prop/novalue/>
PREFIX wdref: <http://www.wikidata.org/reference/>
PREFIX wds: <http://www.wikidata.org/entity/statement/>
PREFIX wdt: <http://www.wikidata.org/prop/direct/>
PREFIX wdtn: <http://www.wikidata.org/prop/direct-normalized/>
PREFIX wdv: <http://www.wikidata.org/value/>
PREFIX wikibase: <http://wikiba.se/ontology#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>`

const isBGP = (pattern: SparqlJs.Pattern): pattern is BgpPattern => {
    return pattern.type === 'bgp';
}

const isNonPathTriple = (triple: SparqlJs.Triple): triple is SemanticTriple => {
    return "termType" in triple.predicate
}

// const isVariable = (argument: SelectQuery["variables"][number]): argument is VariableTerm => {
//     return "termType" in argument && argument.termType==="Variable"
// }

export const parseSparqlQuery = (query: string): SemanticTriple[] => {
    const parser = new SparqlJs.Parser(); //{skipValidation: true}

    const parsedQuery = parser.parse(PREFIXES + query) as SelectQuery //TODO what about Update and ConstructQuery types?

    // We only support bgp nodes. https://www.w3.org/TR/sparql11-query/#sparqlQuery
    const bgpNodes = parsedQuery.where?.filter(isBGP) || [];

    // Not sure if multiple BGPNodes are possible, but this is safe
    const triples = bgpNodes.map(d => d.triples).flat();

    // We do not follow property paths. https://www.w3.org/TR/sparql11-query/#propertypaths
    const nonPathTriples = triples.filter(isNonPathTriple);

    // Don't know what aggregations are, so they are filtered out...
    // const variableStrings = parsedQuery.variables?.filter(isVariable) || [];

    return nonPathTriples
}
