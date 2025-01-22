// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { SparqlResultsJsonType } from "types/sparql";

import { ChatAPI } from "./ChatAPI";
import { getEntityDataFromQuery } from "./knowledgeBase/getEntityData";

/**
 * This function prompts the LLM to name the query and summarize the results
 * @param ChatAPI  the LLM API
 * @param query       the query that was executed
 * @param data        the data if applicable (there could have been an error)
 * @returns           the name and summary as a key-value object
 */
export async function summarizeQueryResults(chatAPI: ChatAPI, query:string, data?:SparqlResultsJsonType) {
  const entityData = await getEntityDataFromQuery(query)

  //first ask the LLM to come up with a name for the query
  //this is useful for the query history feature
  const {content:name} = await chatAPI.sendMessages([
    {
      content: `Respond with a brief name for this query. If you generated this query, it can just be the question that the user asked.
      ${query}

Where the IDs in the query are:
${entityData?.map(({id,label,description}) => `ID ${id} | Label: ${label} | Description: ${description}`).join("\n")}`,
      role: "system",
    }
  ])

  //if there is no data, just return the name and an empty summary
  if(!data) return {name, summary:""}
  //else there was data

  //ask the LLM to summarize the results
  const {content:summary} = await chatAPI.sendMessages([
    {
      content: `These are the JSON results from the last query. Respond with a brief summary of the results.
      ${JSON.stringify(data, undefined, 2)}`,
      role: "system",
    }
  ])
  return {name, summary}
}