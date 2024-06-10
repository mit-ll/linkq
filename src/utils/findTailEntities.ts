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
export async function findTailEntities(headEntityId:string,propertyId:string) {
const query = `SELECT ?child ?childLabel ?childDescription
WHERE {
  wd:${headEntityId} wdt:${propertyId} ?child.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
}`

  return await runQuery(query)
}