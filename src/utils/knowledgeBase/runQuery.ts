// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { handleFetchJsonResponse } from "utils/handleFetchJsonResponse";

import { SparqlResultsJsonType } from "types/sparql";

/**
 * This function runs a SPARQL query on Wikidata
 * @param query the SPARQL query in string form
 * @returns     the Wikidata results
 */
export function runQuery(query: string) {
  return fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`,{
    headers: {
      'Accept': 'application/sparql-results+json',
    }
  }).then(handleFetchJsonResponse) as Promise<SparqlResultsJsonType>
}
