// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { runQuery } from "./runQuery"

/**
 * Given the {head entity, property, tail entity} triplets format,
 * given the head entity and property IDs,
 * this function finds all the tail entities and qualifiers
 * @param headEntityId  the head entity ID, ex Q95
 * @param propertyId    the property ID, ex P112
 * @returns             all the tail entities and qualifiers in SPARQL format
 */
async function findTailEntities(headEntityId:string,propertyId:string) {
  //this query is based on https://stackoverflow.com/a/46385132
  const query = `SELECT ?tail ?tailLabel ?wdpq ?wdpqLabel ?qualifierValueLabel {
  VALUES (?head) {(wd:${headEntityId})}
  VALUES (?wd) {(wd:${propertyId})}

  ?head ?p ?statement .
  ?statement ?ps ?tail .

  ?wd wikibase:claim ?p.
  ?wd wikibase:statementProperty ?ps.

  OPTIONAL {
  ?statement ?pq ?qualifierValue .
  ?wdpq wikibase:qualifier ?pq .
  }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
} ORDER BY ?qualifierValueLabel ?tailLabel`

  return await runQuery(query)
}


/**
 * Calls findTailEntities and returns a formatted string response to send to the LLM
 * If there is no data, return null
 * @param headEntityId  the head entity ID, ex Q95
 * @param propertyId    the property ID, ex 
 * @returns             all the tail entities as a string, else null if there is no data
 */
export async function findTailEntitiesResponse(headEntityId:string,propertyId:string) {
  const results = await findTailEntities(headEntityId, propertyId)

  if(results.results.bindings.length > 0) {
    const heading = `Tail , Tail Label | Qualifier, Qualifier Label | Qualifier Value\n`
    return heading + results.results.bindings.map(b => {
      const tailId = b?.["tail"]?.value.replace("http://www.wikidata.org/entity/","")
      const tailLabel = b?.["tailLabel"]?.value
      const qualifierId = b?.["wdpq"]?.value.replace("http://www.wikidata.org/entity/","")
      const qualifierLabel = b?.["wdpqLabel"]?.value
      const qualifierValue = b?.["qualifierValueLabel"]?.value

      let row = `${tailId} ${tailLabel}`
      if(qualifierId) {
        row += ` | ${qualifierId}, ${qualifierLabel} | ${qualifierValue}`
      }
      return row
    }).join("\n")
  }

  return null
}