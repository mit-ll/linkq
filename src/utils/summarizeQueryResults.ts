// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { SparqlResultsJsonType } from "types/sparql";

import { ChatAPI, setStateAndAddMessage } from "./ChatAPI";
import { getEntityDataFromQuery } from "./knowledgeBase/getEntityData";

export type SummarizeOutcomeType = {
  data: SparqlResultsJsonType,
} | {
  error: Error,
}

/**
 * This function prompts the LLM to name the query and summarize the results
 * @param ChatAPI  the LLM API
 * @param query    the query that was executed
 * @param data     the data if applicable
 * @param error    the data if applicable, undefined if there was an error executing the query
 * @returns        a Promise that returns the name and summary as a key-value object
 */
export async function summarizeQueryResults(chatAPI: ChatAPI, query:string, outcome:SummarizeOutcomeType):Promise<{name:string,summary:string}> {
  const entityData = await getEntityDataFromQuery(query)

  //first ask the LLM to come up with a name for the query
  //this is useful for the query history feature
  let llmResponse = await chatAPI.sendMessages([
    {
      content: `Here is a KG query:
${query}

Where the IDs in the query are:
${entityData?.map(({id,label,description}) => `ID ${id} | Label: ${label} | Description: ${description}`).join("\n")}

Respond with a brief name for this query.`,
      role: "system",
      stage: "Summarizing Results",
    }
  ])
  setStateAndAddMessage(chatAPI, llmResponse, `Summarizing Results`)
  const name = llmResponse.content

  //if there was data, then the query executed successfully
  if("data" in outcome) {
    llmResponse = await chatAPI.sendMessages([
      {
        content: `These are the JSON results from the last query:
${JSON.stringify(outcome.data, undefined, 2)}

Respond with a brief summary of the results.`,
        role: "system",
        stage: "Summarizing Results",
      }
    ])
  }
  //else if there was an error
  else {
    //ask the LLM to summarize the results
    llmResponse = await chatAPI.sendMessages([
      {
        content: `The query did not execute successfully and had this error:.
${outcome.error}

Respond with a brief guess as to why the query failed.`,
        role: "system",
        stage: "Summarizing Results",
      }
    ])
  }

  setStateAndAddMessage(chatAPI, llmResponse, `Summarizing Results`)
  const summary = llmResponse.content
  return {name, summary}
}