// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { fuzzySearchEntities } from "./fuzzySearch"
import { getPropertiesForEntity } from "./getPropertiesForEntity"
import { findTailEntities } from "./findTailEntities"
import { ChatGPTAPI } from "./ChatGPTAPI"

//these prefixes are defined as constants here, so we can modify them in one place
const ENTITY_SEARCH_PREFIX = "ENTITY SEARCH:"
const PROPERTIES_SEARCH_PREFIX = "PROPERTIES SEARCH:"
const ENTITY_PROPERTY_SEARCH_PREFIX = "ENTITY PROPERTY SEARCH:"

//this is the system message that we send to the LLM to tell it how to use our query building workflow
const INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE = `Your goal is to find the necessary entity and property IDs to construct a SPARQL query that answers the user's question. Do not respond with a trailing period. Do not assume you already know the correct entity and property IDs; you should search for them. Make sure to filter the IDs for the ones that are most relevant to the question. Respond in one of these ways:
- To fuzzy search for an entity, start the response with '${ENTITY_SEARCH_PREFIX}', followed by an entity name you want to search for. The system will respond with possible entity resolutions in Wikidata. 
- To get all the properties for an entity, start the response with '${PROPERTIES_SEARCH_PREFIX}', followed by the ID of the entity. The user will respond with all the properties associated with that entity.
- To find what entities are connected to the original entity via a property, start the response with '${ENTITY_PROPERTY_SEARCH_PREFIX}', followed by the entity ID then the property ID. Ex: '${ENTITY_PROPERTY_SEARCH_PREFIX} Q123 P456'
- Respond with 'STOP' if and only if you have searched for and successfully identified all necessary IDs from Wikidata to construct the query.`

const QUERY_BUILDING_MAX_LOOPS = 20 //HARDCODED we don't want the LLM looping forever

//this is the few shot training system message we give the LLM to prompt it to generate a query
const QUERY_BUILDING_SYSTEM_MESSAGE = `You are an expert at generating SPARQL queries for the Wikidata Knowledge Graph from natural language. 
Entity IDs are prepended with 'wd' and property IDs are prepended with 'wdt'. 
Your task is to convert the natural language instruction into a SPARQL query.
The following are four examples in which I am showcasing a natural language instruction (NLI) and the converted SPARQL Query. 
  NLI: Who are creators of Apple and what are their birthdates?
  SPARQL Query:
    SELECT ?founder ?founderLabel ?birthdate
      WHERE {
        wd:Q312 wdt:P112 ?founder.   # Q312 represents Apple and P112 represents founder
        ?founder wdt:P569 ?birthdate. # P569 represents date of birth
        
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
    }
  NLI: Who are the current heads of state for all countries in the world? 
  SPARQL Query: 
    SELECT ?country ?countryLabel ?headOfState ?headOfStateLabel 
      WHERE { 
        ?country wdt:P31 wd:Q6256;     # Instance of: country 
        p:P35 ?statement.    # has head of government statement 
        ?statement ps:P35 ?headOfState;   # head of government property 
        pq:P580 ?startDate.   # start date of the term 
        FILTER NOT EXISTS { ?statement pq:P582 ?endDate }  # Ensure current head of state 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } 
      } 
      ORDER BY ?countryLabel 
  NLI: What are the top five tallest mountains in the world and their respective heights? 
  SPARQL Query: 
    SELECT ?mountain ?mountainLabel ?height 
      WHERE { 
        ?mountain wdt:P31 wd:Q8502;         # Instance of: mountain 
        wdt:P2044 ?height.       # Height property 
        FILTER (?height >= 8000)           # Minimum height of 8000 meters 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } 
      } 
    ORDER BY DESC(?height) 
    LIMIT 5 
  NLI: Which symphonies were composed by Ludwig van Beethoven? 
  SPARQL Query: 
    SELECT ?composition (SAMPLE(?compositionLabel) as ?compositionLabel) 
      WHERE { 
        ?composition wdt:P31 wd:Q105543609;         # Instance of: Beethoven's symphonies 
        wdt:P86 wd:Q255;               # Composer: Ludwig van Beethoven 
        rdfs:label ?compositionLabel. 
        FILTER(CONTAINS(LCASE(?compositionLabel), "symphony")) 
        SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". } 
      }  
    GROUP BY ?composition 
  Start the SPARQL query with \`\`\`sparql and end the query with \`\`\`. After you generate a SPARQL query, you briefly explain, as concisely as possible, to the user why the query addresses their original question. Keep your explanation as short as possible and only further explain when asked.`


export async function queryBuildingWorkflow(chatGPT:ChatGPTAPI, text: string) {
  //send the initial query building message to the LLM as the system role
  let llmResponse = await chatGPT.sendMessages([
    {
      content: INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE,
      role: "system",
    },
  ])

  /* Main Query Building Loop */
  //in this while loop, we let the LLM interface with the KG
  //and traverse the graph to find the necessary entity and property IDs
  let NO_FOREVER_LOOP = 0 //this counter tracks how many loop iterations we've run
  while(NO_FOREVER_LOOP < QUERY_BUILDING_MAX_LOOPS) { //don't loop forever
    NO_FOREVER_LOOP++ //increment our loop counter
    
    const responseText = llmResponse.trim() //trim the LLM response
    if(responseText.toUpperCase() === "STOP") { //if the LLM responded with stop
      break //break out of the while loop
    }
    //else if the LLM wants to fuzzy search for entities
    else if(responseText.includes(ENTITY_SEARCH_PREFIX)) {
      llmResponse = await handleFuzzySearchForEntity( //run the entity search function
        chatGPT,
        responseText.split(ENTITY_SEARCH_PREFIX)[1].trim(),
      )
    }
    //else if the LLM wants to search for all the properties for an entity
    else if(responseText.includes(PROPERTIES_SEARCH_PREFIX)) {
      llmResponse = await handleGetPropertiesForEntity( //run the property search function
        chatGPT,
        responseText.split(PROPERTIES_SEARCH_PREFIX)[1].trim(),
      )
    }
    //else if the LLM wants to traverse the graph to find all tail entities
    //that are connected to this head entity via a relation
    else if(responseText.startsWith(ENTITY_PROPERTY_SEARCH_PREFIX)) {
      llmResponse = await handleFindTailEntities(
        chatGPT,
        responseText.replace(ENTITY_PROPERTY_SEARCH_PREFIX,"").trim(),
      )
    }
    //else the LLM didn't give us an expected response
    else {
      llmResponse = await chatGPT.sendMessages([
        {
          content: `That was an invalid response. If you are done, just respond with STOP. Follow the specified format. ${INITIAL_QUERY_BUILDING_SYSTEM_MESSAGE}`,
          role: "system",
        }
      ])
    }
  }
  //now the LLM should have found all the IDs it needs
  
  //ask the LLM to generate a query
  return await chatGPT.sendMessages([
    {
      content: QUERY_BUILDING_SYSTEM_MESSAGE + ` Now construct a query that answers the user's question: ${text}`,
      role: "system",
    }
  ])
}


async function handleFuzzySearchForEntity(chatGPT:ChatGPTAPI, text:string) {
  //try to resolve these entities by requesting data from the KG
  const entities = (await fuzzySearchEntities(text)).search

  const candidateEntitiesText = entities.map(
    e => `ID: ${e.id}, label: ${e.label}, description: ${e.description}`
  ).join("\n")
  console.log("candidateEntitiesText",candidateEntitiesText)
  if(entities.length === 0) {
    return await chatGPT.sendMessages([
      {
        content: "Wikidata did not resolve any entities. You may need to rephrase or simplify your entity search",
        role: "system",
      }
    ])
  }
 
  return await chatGPT.sendMessages([
    {
      content: candidateEntitiesText,
      role: "system",
    }
  ])
}

async function handleGetPropertiesForEntity(chatGPT:ChatGPTAPI, entityId: string) {
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
  const propertiesMessageText = properties.map(
    p => `ID: ${p[0]}, label: ${p[1]}, description: ${p[2]}`
  ).join("\n")
  console.log("propertiesMessageText",propertiesMessageText)
  if(properties.length === 0) {
    return await chatGPT.sendMessages([
      {
        content: "Wikidata did not resolve any properties for that entity. Are you sure that entity exists?",
        role: "system",
      }
    ])
  }

  return await chatGPT.sendMessages([
    {
      content: propertiesMessageText,
      role: "system",
    }
  ])
}

async function handleFindTailEntities(chatGPT:ChatGPTAPI, text: string) {
  let split = text.split(" ")
  if(split.length !== 2) {
    split = text.split(", ")
  }
  if(split.length !== 2) {
    return await chatGPT.sendMessages([
      {
        content: "Your response did not follow the correct format. Please try again.",
        role: "system",
      }
    ])
  }

  const [entityId, propertyId] = split
  const results = await findTailEntities(entityId, propertyId)
  const propertiesMessageText = results.results.bindings.map(b => {
    const id = b?.["child"]?.value.replace("http://www.wikidata.org/entity/","")
    const label = b?.["childLabel"]?.value
    const description = b?.["childDescription"]?.value

    return `ID: ${id}, label: ${label}, description: ${description}`
  }).join("\n")
  console.log("handleFindTailEntities propertiesMessageText",propertiesMessageText)
  if(results.results.bindings.length === 0) {
    return await chatGPT.sendMessages([
      {
        content: "Wikidata did not resolve any entities for that entity and property. Are you sure that entity has that property?",
        role: "system",
      }
    ])
  }

  return await chatGPT.sendMessages([
    {
      content: propertiesMessageText,
      role: "system",
    }
  ])
}