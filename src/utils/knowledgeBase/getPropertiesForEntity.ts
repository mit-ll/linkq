// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { runQuery } from "./runQuery"

/**
 * This function finds all the properties associated with an entity
 * @param entityId  the entity ID
 * @returns         all the properties (IDs, labels, descriptions) connected to this entity
 */
async function getPropertiesForEntity(entityId:string) {
  const query = `SELECT DISTINCT ?wd ?wdLabel ?wdDescription
  WHERE {
    VALUES (?item) {(wd:${entityId})}
    ?item ?p ?statement .   ?statement ?ps ?ps_ .    ?wd wikibase:claim ?p.   ?wd wikibase:statementProperty ?ps.   SERVICE wikibase:label {
      bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".    
    }         
  }`

  return await runQuery(query)
}

/**
 * Calls getPropertiesForEntity and returns a formatted string response to send to the LLM
 * If there is no data, return null
 * @param entityId  the entity ID
 * @returns         all the properties as a string, else null if there is no data
 */
export async function getPropertiesForEntityResponse(entityId: string) {
  const propertiesResponse = await getPropertiesForEntity(entityId)

  //convert the response into an array of string arrays, ex
  //[
  //  ["P31", "instance of", "that class of which..."],
  //  ...
  //]
  const properties = propertiesResponse.results.bindings.map(b => {
    return propertiesResponse.head.vars.map(v => b[v]?.value?.replace("http://www.wikidata.org/entity/","") || "")
  })
  
  //craft the list of properties we will send to the LLM
  return properties.map(
    p => `ID: ${p[0]}, label: ${p[1]}, description: ${p[2]}`
  ).join("\n") || null
}