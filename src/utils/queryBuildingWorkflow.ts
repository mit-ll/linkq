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
import { StageType } from "redux/stageSlice"
import { reduxSendMessages, reduxHandleLLMResponse, reduxSetStage } from "redux/reduxUtils"


const QUERY_BUILDING_MAX_LOOPS = 20 //HARDCODED we don't want the LLM looping forever

export async function queryBuildingWorkflow(
  chatAPI:ChatAPI,
  question: string,
) {
  //send the initial query building message to the LLM as the system role
  setTimeout(() => {
    reduxSetStage({
      mainStage: "KG Exploration",
      subStage: "System enumerates KG APIs",
    })
  })
  let llmResponse = await reduxSendMessages(chatAPI,[
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
      stage: {
        mainStage: "KG Exploration",
        subStage: "System enumerates KG APIs",
      },
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
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "Query Generation",
        subStage: "System gives SPARQL few-shot training", //this is slightly inaccurate, but how we've decided to display the stages
      })
      break //break out of the while loop
    }
    //else if the LLM wants to fuzzy search for entities
    else if(responseText.includes(ENTITY_SEARCH_PREFIX)) {
      const fuzzySearchString = responseText.split(ENTITY_SEARCH_PREFIX)[1].trim()
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "KG Exploration",
        subStage: "LLM fuzzy searches for entity",
        description: `Entity Fuzzy Search: ${fuzzySearchString}`
      })
      //run the entity search function
      llmResponse = await handleFuzzySearchForEntity({
        chatAPI,
        fuzzySearchString,
        question,
      })
    }
    //else if the LLM wants to search for all the properties for an entity
    else if(responseText.includes(PROPERTIES_SEARCH_PREFIX)) {
      const entityId = responseText.split(PROPERTIES_SEARCH_PREFIX)[1].trim()
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "KG Exploration",
        subStage: "LLM searches for properties",
        description: `Property Search: ${entityId}`,
      })
      //run the property search function
      llmResponse = await handleGetPropertiesForEntity({
        chatAPI,
        entityId,
        question,
      })
    }
    //else if the LLM wants to traverse the graph to find all tail entities
    //that are connected to this head entity via a relation
    else if(responseText.startsWith(TAIL_SEARCH_PREFIX)) {
      const pair = responseText.replace(TAIL_SEARCH_PREFIX,"").trim()
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "KG Exploration",
        subStage: "LLM searches for tail entities",
        description: `Tail Searching: ${pair}`
      })
      llmResponse = await handleFindTailEntities({
        chatAPI,
        pair,
        question,
      })
    }
    //else the LLM didn't give us an expected response
    else {
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "KG Exploration",
        subStage: "System enumerates KG APIs", //this is slightly inaccurate, but how we've decided to display the stages
      })
      llmResponse = await reduxSendMessages(chatAPI,[
        {
          content: `That was an invalid response. If you are done, just respond with STOP. Follow the specified format. ${INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE}`,
          role: "system",
          stage: {
            mainStage: "KG Exploration",
            subStage: "System enumerates KG APIs",
          },
        }
      ])
    }
  }
  //now the LLM should have found all the IDs it needs
  
  //ask the LLM to generate a query
  reduxSetStage({
    mainStage: "Query Generation",
    subStage: "System gives SPARQL few-shot training",
  })
  setTimeout(() => {
    reduxSetStage({
      mainStage: "Query Generation",
      subStage: "LLM generates query",
    })
  }, 2000)
  return await reduxSendMessages(chatAPI,[
    {
      content: QUERY_BUILDING_SYSTEM_MESSAGE + ` Now construct a query that answers the user's question: ${question}`,
      role: "system",
      stage: {
        mainStage: "Query Generation",
        subStage: "System gives SPARQL few-shot training",
      },
    }
  ])
}


async function handleFuzzySearchForEntity({
  chatAPI, fuzzySearchString, question,
}:{
  chatAPI:ChatAPI, fuzzySearchString:string, question:string,
}) {
  //try to resolve these entities by requesting data from the KG
  const responseText = await fuzzySearchEntitiesResponse(fuzzySearchString)

  const stage: StageType = {
    mainStage: "KG Exploration",
    subStage: "LLM fuzzy searches for entity",
    description: `Entity Fuzzy Search: ${fuzzySearchString}`,
  }
  if(!responseText) {
    return await reduxSendMessages(chatAPI,[
      {
        content: `${KG_NAME} did not resolve any entities. You may need to rephrase or simplify your entity search`,
        role: "system",
        stage,
      }
    ])
  }

  //TODO this could be farmed out to a separate LLM
  //TODO only do this if there are multiple entities
  const filteredResponse = await reduxSendMessages(chatAPI,[
    {
      content: responseText + `\n\nWhich entity (or entities) is most relevant to the question '${question}'?`,
      role: "system",
      stage,
    }
  ])
  reduxHandleLLMResponse(filteredResponse, stage)
 
  return await reduxSendMessages(chatAPI,[
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
      stage,
    }
  ])
}

async function handleGetPropertiesForEntity({
  chatAPI, entityId, question,
}:{
  chatAPI:ChatAPI, entityId: string, question: string,
}) {
  const responseText = await getPropertiesForEntityResponse(entityId)

  const stage: StageType = {
    mainStage: "KG Exploration",
    subStage: "LLM searches for properties",
    description: `Property Search: ${entityId}`,
  }
  if(!responseText) {
    return await reduxSendMessages(chatAPI,[
      {
        content: `${KG_NAME} did not resolve any properties for that entity. Are you sure that entity exists?`,
        role: "system",
        stage,
      }
    ])
  }

  //TODO this could be farmed out to a separate LLM
  //TODO only do this if there are multiple properties
  const filteredResponse = await reduxSendMessages(chatAPI,[
    {
      content: responseText + `\n\nWhich property (or properties) is most relevant to the question '${question}'?`,
      role: "system",
      stage,
    }
  ])
  reduxHandleLLMResponse(filteredResponse, stage)

  return await reduxSendMessages(chatAPI,[
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
      stage,
    }
  ])
}

async function handleFindTailEntities({
  chatAPI, pair, question,
}:{
  chatAPI:ChatAPI, pair: string, question: string,
}) {
  let split = pair.split(" ")
  if(split.length !== 2) {
    split = pair.split(", ")
  }

  const stage: StageType = {
    mainStage: "KG Exploration",
    subStage: "LLM searches for tail entities",
    description: `Tail Search: ${pair}`,
  }

  if(split.length !== 2) {
    return await reduxSendMessages(chatAPI,[
      {
        content: "Your response did not follow the correct format. Please try again.",
        role: "system",
        stage,
      }
    ])
  }

  const [entityId, propertyId] = split
  const responseText = await findTailEntitiesResponse(entityId, propertyId)

  if(!responseText) {
    return await reduxSendMessages(chatAPI,[
      {
        content: `${KG_NAME} did not resolve any entities for that entity and property. Are you sure that entity has that property?`,
        role: "system",
        stage,
      }
    ])
  }

  //TODO this could be farmed out to a separate LLM
  //TODO only do this if there are multiple tail entities
  const filteredResponse = await reduxSendMessages(chatAPI,[
    {
      content: responseText + `\n\nWhich property (or properties) is most relevant to the question '${question}'?`,
      role: "system",
      stage,
    }
  ])
  reduxHandleLLMResponse(filteredResponse, stage)


  return await reduxSendMessages(chatAPI,[
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
      stage,
    }
  ])
}