// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { EntityId, Item } from "wikibase-sdk";
import { wbk } from "./wbk.ts";
import {useQuery, UseQueryResult} from "@tanstack/react-query";

import { handleFetchJsonResponse } from "utils/handleFetchJsonResponse.ts";

import { IDTableEntitiesType } from "types/idTable.ts";


interface EntityDictionary {
  [key: string]: Item;
}

/**
 * This function queries Wikidata for all data associated for an array of entity IDs
 * @param ids array of entity IDs
 * @returns   the data for each entity that we can display in the graph and table
 */
export async function getEntityData(ids: EntityId[]):Promise<IDTableEntitiesType[]> {
  //use the wikibase SDK to help us generate the right URL
  const url = wbk.getEntities({
    ids,
    languages: ["en"],
    format: "json",
  })

  const entityData = await fetch(url).then(handleFetchJsonResponse) as {entities: EntityDictionary}

  //convert the entity data into the format the ID table expects
  const idTableEntities:IDTableEntitiesType[] = Object.entries(entityData.entities).map(([id,value]) => ({
    id,
    label: value.labels?.en?.value || "",
    description: value.descriptions?.en?.value || "",
  }))
  return idTableEntities
}

function parseIdsFromQuery(query:string) {
  //this magical regex parses the entity and property IDs from the query
  return query.match(/(?:wd|wdt|ps|pq):[QP]\d+/g);
}


export async function getEntityDataFromQuery(query:string) {
  const parsedIds = parseIdsFromQuery(query)
  if (parsedIds) { //if we parsed any IDs from the query
    //get the data for the IDs
    const idTableEntities = await getEntityData(
      parsedIds.map(str => str.split(":")[1]) as EntityId[]
    )

    return idTableEntities
  }
  return null
}



/**
 * This function parses a query and wraps getEntityData with useQuery
 * @param query the query string from the editor
 * @returns     useQuery outputs (ie data, isLoading, etc)
 */
export const useQueryGetIDTableEntitiesFromQuery = (query: string):UseQueryResult<IDTableEntitiesType[] | null, Error> => {
  //this magical regex parses the entity and property IDs from the query
  const parsedIds = parseIdsFromQuery(query)
  return useQuery({
    queryKey: [`entity-ids-${parsedIds?.join(", ")}`],
    queryFn: () => getEntityDataFromQuery(query)
  });
}