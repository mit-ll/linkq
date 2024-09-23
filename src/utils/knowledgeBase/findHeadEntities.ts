// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { runQuery } from "./runQuery"

/**
 * Given the {head entity, property, tail entity} triplets format,
 * this function finds all the head entities and properties given the tail entity
 * @param tailEntityId  the tail entity ID, ex Q95
 * @returns             all the head entities (IDs, labels, descriptions) in SPARQL format
 */
async function findHeadEntities(tailEntityId:string) {
  const query = `SELECT ?headEntity ?headEntityLabel ?property ?propertyLabel
WHERE {
  ?headEntity ?property wd:${tailEntityId}.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`

  return await runQuery(query)
}


/**
 * Calls findHeadEntities and returns a formatted string response to send to the LLM
 * If there is no data, return null
 * @param headEntityId  the tail entity ID, ex Q95
 * @returns             all the head entities as a string, else null if there is no data
 */
export async function findHeadEntitiesResponse(tailEntityId:string) {
  const results = await findHeadEntities(tailEntityId)

  const responseText = results.results.bindings.map(b => {
    const headEntity = b?.["headEntity"]?.value
    const headEntityLabel = b?.["headEntityLabel"]?.value
    const property = b?.["property"]?.value
    const propertyLabel = b?.["propertyLabel"]?.value

    return `Head entity: ${headEntity}, ${headEntityLabel} | property: ${property}, ${propertyLabel}`
  }).join("\n")

  return responseText || null
}