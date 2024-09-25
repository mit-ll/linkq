// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

/**
 * This function is used to format a URI for rendering in the results table
 * @param uri the URI from query results
 * @returns   what we want to render as the content of an anchor tag
 */
export function formatURI(uri:string) {
  return uri.replace("http://www.wikidata.org/","")
}

/**
 * This function is used to get the href to redirect to from the URI
 * @param uri the URI from query results
 * @returns   what we want to set as the href of an anchor tag
 */
export function getHrefFromURI(uri:string) {
  return uri
}