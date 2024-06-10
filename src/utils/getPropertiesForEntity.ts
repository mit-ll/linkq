// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { runQuery } from "./runQuery"

/**
 * This function finds all the properties associated with an entity
 * @param entityId  the entity ID
 * @returns         all the properties (IDs, labels, descriptions) connected to this entity
 */
export async function getPropertiesForEntity(entityId:string) {
  const query = `SELECT DISTINCT ?wd ?wdLabel ?wdDescription
  WHERE {
    VALUES (?item) {(wd:${entityId})}
    ?item ?p ?statement .   ?statement ?ps ?ps_ .    ?wd wikibase:claim ?p.   ?wd wikibase:statementProperty ?ps.   SERVICE wikibase:label {
      bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en".    
    }         
  }`

  return await runQuery(query)
}