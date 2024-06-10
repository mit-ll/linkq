// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { SearchResponse } from "wikibase-sdk"
import { handleFetchJsonResponse } from "./handleFetchJsonResponse"
import { wbk } from "./wbk"

/**
 * This function fuzzy searches Wikidata for entities by label name.
 * This fuzzy search feature is implemented by Wikidata, not us
 * @param search  the search string, ex "Google"
 * @returns       a search response of possible matching entities
 */
export function fuzzySearchEntities(search: string):Promise<SearchResponse> {
  const url = wbk.searchEntities({
    search,
    limit: 5,
  })
  return fetch(url).then(handleFetchJsonResponse)
}

/**
 * This function fuzzy searches Wikidata for properties by label name.
 * This fuzzy search feature is implemented by Wikidata, not us
 * @param search  the search string, ex "winner"
 * @returns       a search response of possible matching properties
 */
export function fuzzySearchProperties(search: string):Promise<SearchResponse> {
  const url = wbk.searchEntities({
    search,
    limit: 5,
    type: 'property',
  })
  return fetch(url).then(handleFetchJsonResponse)
}