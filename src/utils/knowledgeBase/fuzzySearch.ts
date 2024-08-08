// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { SearchResponse } from "wikibase-sdk"
import { handleFetchJsonResponse } from "../handleFetchJsonResponse"
import { wbk } from "./wbk"

/**
 * This function fuzzy searches Wikidata for entities by label name.
 * This fuzzy search feature is implemented by Wikidata, not us
 * @param search  the search string, ex "Google"
 * @returns       a search response of possible matching entities
 */
function fuzzySearchEntities(search: string):Promise<SearchResponse> {
  const url = wbk.searchEntities({
    search,
    limit: 5,
  })
  return fetch(url).then(handleFetchJsonResponse)
}

/**
 * Calls fuzzySearchEntities and returns a formatted string response to send to the LLM
 * If there is no data, return null
 * @param search  the search string, ex "Google"
 * @returns       all possible matching entities as a string, else null if there is no data
 */
export async function fuzzySearchEntitiesResponse(search: string) {
  const entities = (await fuzzySearchEntities(search)).search

  return entities.map(
    e => `ID: ${e.id}, label: ${e.label}, description: ${e.description}`
  ).join("\n") || null
}





// /**
//  * This function fuzzy searches Wikidata for properties by label name.
//  * This fuzzy search feature is implemented by Wikidata, not us
//  * @param search  the search string, ex "winner"
//  * @returns       a search response of possible matching properties
//  */
// function fuzzySearchProperties(search: string):Promise<SearchResponse> {
//   const url = wbk.searchEntities({
//     search,
//     limit: 5,
//     type: 'property',
//   })
//   return fetch(url).then(handleFetchJsonResponse)
// }