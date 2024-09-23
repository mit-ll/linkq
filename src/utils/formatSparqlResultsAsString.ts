// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { SparqlResultsJsonType } from "../types/sparql";

/**
 * This function turns SPARQL results into essentially a delimiter separated values string
 * @param results SPARQL results
 * @returns       human readable delimiter separated string
 */
export function formatSparqlResultsAsString(results: SparqlResultsJsonType) {
  const heading = results.head.vars.reduce((acc, v, i) => {
    return `${acc}${i===0?"":" | "}${v}`
  }, "")

  const rows = results.results.bindings.map(binding => {
    return results.head.vars.reduce((acc, v, i) => {
      const value = binding[v].value
      return `${acc}${i===0?"":" | "}${value}`
    }, "")
  }).join("\n")

  return `${heading}\n${rows}`
}

// Example of what SPARQL results could look like
// {
//   "head": {
//     "vars": [
//       "birthPlace",
//       "birthPlaceLabel"
//     ]
//   },
//   "results": {
//     "bindings": [
//       {
//         "birthPlace": {
//           "type": "uri",
//           "value": "http://www.wikidata.org/entity/Q1628403"
//         },
//         "birthPlaceLabel": {
//           "xml:lang": "en",
//           "type": "literal",
//           "value": "Horncastle"
//         }
//       }
//     ]
//   }
// }