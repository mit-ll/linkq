// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { runQuery } from "./runQuery"

/**
 * Given the {head entity, property, tail entity} triplets format,
 * this function finds all the tail entities given the head entity and property IDs in the Wikidata
 * @param headEntityId  the head entity ID, ex Q95
 * @param propertyId    the property ID, ex 
 * @returns             all the tail entities (IDs, labels, descriptions) in Wikidata format
 */
async function findTailEntities(headEntityId:string,propertyId:string) {
const query = `SELECT ?child ?childLabel ?childDescription
WHERE {
  wd:${headEntityId} wdt:${propertyId} ?child.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`

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

  const responseText = results.results.bindings.map(b => {
    const id = b?.["child"]?.value.replace("http://www.wikidata.org/entity/","")
    const label = b?.["childLabel"]?.value
    const description = b?.["childDescription"]?.value

    return `ID: ${id}, label: ${label}, description: ${description}`
  }).join("\n")

  return responseText || null
}