// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { EntityId } from "wikibase-sdk";
import { handleFetchJsonResponse } from "./handleFetchJsonResponse";
import { wbk } from "./wbk";
import {useQuery} from "@tanstack/react-query";
import {EntityDictionary} from "../types/wikidata.ts";

/**
 * This function queries Wikidata for all data associated for an array of entity IDs
 * @param ids array of entity IDs
 * @returns   the data for each entity that we can display in the graph and table
 */
export async function getEntityData(ids: EntityId[]):Promise<{entities: EntityDictionary}> {
  //use the wikibase SDK to help us generate the right URL
  const url = wbk.getEntities({
    ids,
    languages: ["en"],
    format: "json",
  })

  return await fetch(url).then(handleFetchJsonResponse)
}

/**
 * This function parses a query and wraps getEntityData with useQuery
 * @param query the query string from the editor
 * @returns     useQuery outputs (ie data, isLoading, etc)
 */
export const getEntityDataFromQuery = (query: string) => {
  //this magical regex parses the entity and property IDs from the query
  const IDs = query.match(/(?:wd|wdt|ps|pq):[QP]\d+/g);
  return useQuery({
    queryKey: [`entity-ids-${IDs?.join(", ")}`],
    queryFn: async () => {
      console.log("IDs",IDs)
      if (IDs) { //if we parsed any IDs from the query
        //get the data for the IDs
        return await getEntityData(IDs.map(str => {
          return str.split(":")[1]
        }) as EntityId[])
      }
      return null
    }
  });
}
