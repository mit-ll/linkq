// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { fuzzySearchEntitiesResponse } from "./knowledgeBase/fuzzySearch"
import { getPropertiesForEntityResponse } from "./knowledgeBase/getPropertiesForEntity"
import { findTailEntitiesResponse } from "./knowledgeBase/findTailEntities"
import { ChatAPI } from "./ChatAPI"
import { 
  ENTITY_SEARCH_PREFIX, 
  INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE, 
  KG_NAME, 
  PROPERTIES_SEARCH_PREFIX, 
  QUERY_BUILDING_SYSTEM_MESSAGE,
  TAIL_SEARCH_PREFIX
} from "./knowledgeBase/prompts"


const QUERY_BUILDING_MAX_LOOPS = 20 //HARDCODED we don't want the LLM looping forever

export async function queryBuildingWorkflow(chatAPI:ChatAPI, text: string) {
  //send the initial query building message to the LLM as the system role
  let llmResponse = await chatAPI.sendMessages([
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
      stage: "Query Building",
    },
  ])

  /* Main Query Building Loop */
  //in this while loop, we let the LLM interface with the KG
  //and traverse the graph to find the necessary entity and property IDs
  let NO_FOREVER_LOOP = 0 //this counter tracks how many loop iterations we've run
  while(NO_FOREVER_LOOP < QUERY_BUILDING_MAX_LOOPS) { //don't loop forever
    NO_FOREVER_LOOP++ //increment our loop counter
    
    const responseText = llmResponse.content.trim() //trim the LLM response
    if(responseText.toUpperCase() === "STOP") { //if the LLM responded with stop
      break //break out of the while loop
    }
    //else if the LLM wants to fuzzy search for entities
    else if(responseText.includes(ENTITY_SEARCH_PREFIX)) {
      llmResponse = await handleFuzzySearchForEntity( //run the entity search function
        chatAPI,
        responseText.split(ENTITY_SEARCH_PREFIX)[1].trim(),
      )
    }
    //else if the LLM wants to search for all the properties for an entity
    else if(responseText.includes(PROPERTIES_SEARCH_PREFIX)) {
      llmResponse = await handleGetPropertiesForEntity( //run the property search function
        chatAPI,
        responseText.split(PROPERTIES_SEARCH_PREFIX)[1].trim(),
      )
    }
    //else if the LLM wants to traverse the graph to find all tail entities
    //that are connected to this head entity via a relation
    else if(responseText.startsWith(TAIL_SEARCH_PREFIX)) {
      llmResponse = await handleFindTailEntities(
        chatAPI,
        responseText.replace(TAIL_SEARCH_PREFIX,"").trim(),
      )
    }
    //else the LLM didn't give us an expected response
    else {
      llmResponse = await chatAPI.sendMessages([
        {
          content: `That was an invalid response. If you are done, just respond with STOP. Follow the specified format. ${INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE}`,
          role: "system",
          stage: "Query Building",
        }
      ])
    }
  }
  //now the LLM should have found all the IDs it needs
  
  //ask the LLM to generate a query
  return await chatAPI.sendMessages([
    {
      content: QUERY_BUILDING_SYSTEM_MESSAGE + ` Now construct a query that answers the user's question: ${text}`,
      role: "system",
      stage: "Query Building",
    }
  ])
}


async function handleFuzzySearchForEntity(chatAPI:ChatAPI, text:string) {
  //try to resolve these entities by requesting data from the KG
  const responseText = await fuzzySearchEntitiesResponse(text)

  if(!responseText) {
    return await chatAPI.sendMessages([
      {
        content: `${KG_NAME} did not resolve any entities. You may need to rephrase or simplify your entity search`,
        role: "system",
        stage: "Entity Fuzzy Searching",
      }
    ])
  }
 
  return await chatAPI.sendMessages([
    {
      content: responseText,
      role: "system",
      stage: "Entity Fuzzy Searching",
    }
  ])
}

async function handleGetPropertiesForEntity(chatAPI:ChatAPI, entityId: string) {
  const responseText = await getPropertiesForEntityResponse(entityId)

  if(!responseText) {
    return await chatAPI.sendMessages([
      {
        content: `${KG_NAME} did not resolve any properties for that entity. Are you sure that entity exists?`,
        role: "system",
        stage: "Property Search",
      }
    ])
  }

  return await chatAPI.sendMessages([
    {
      content: responseText,
      role: "system",
      stage: "Property Search",
    }
  ])
}

async function handleFindTailEntities(chatAPI:ChatAPI, text: string) {
  let split = text.split(" ")
  if(split.length !== 2) {
    split = text.split(", ")
  }
  if(split.length !== 2) {
    return await chatAPI.sendMessages([
      {
        content: "Your response did not follow the correct format. Please try again.",
        role: "system",
        stage: "Tail Search",
      }
    ])
  }

  const [entityId, propertyId] = split
  const responseText = await findTailEntitiesResponse(entityId, propertyId)

  if(!responseText) {
    return await chatAPI.sendMessages([
      {
        content: `${KG_NAME} did not resolve any entities for that entity and property. Are you sure that entity has that property?`,
        role: "system",
        stage: "Tail Search",
      }
    ])
  }

  return await chatAPI.sendMessages([
    {
      content: responseText,
      role: "system",
      stage: "Tail Search",
    }
  ])
}