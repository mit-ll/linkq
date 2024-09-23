// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
/**
 * This function tries to parse out a SPARQL query from the LLM text response
 * @param text  the LLM response
 * @returns     the parsed query as { pre:string, query:string, post:string }, else null
 */
export function tryParsingOutQuery(text: string) {
  let split = text.split("```sparql")
  if(split.length === 2) {
    const [query, post] = split[1].split("```")
    return {pre: split[0], query, post}
  }
  
  split = text.split("```\nSELECT")
  if(split.length === 2) {
    const [queryWithoutSelect, post] = split[1].split("```")
    return {pre: split[0], query: "SELECT" + queryWithoutSelect, post}
  }

  split = text.split("SELECT")
  if(split.length === 2) {
    const [queryWithoutSelect, post] = split[1].split("\n\n")
    return {pre: split[0], query: "SELECT" + queryWithoutSelect, post}
  }
  
  return null
}