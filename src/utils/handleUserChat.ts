// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { ChatAPI, setStateAndAddMessage } from "./ChatAPI"
import { queryBuildingWorkflow } from "./queryBuildingWorkflow"

/**
 * This is the main function that handles the user sending one chat message.
 * Currently, it decides whether to initiate the query building workflow or not
 * @param userText  the user's message, as a string
 * @param chatAPI   the ChatAPI instance
 * @returns         the LLM response
 */
export async function handleUserChat(userText: string, chatAPI: ChatAPI) {
  //get the LLM to respond
  let llmResponse = await chatAPI.sendMessages([
    { content: userText, role: "user", stage: "Question Refinement" }
  ])
  
  //determine what to do with the LLM's response
  if(llmResponse.content.includes("BUILD QUERY")) {
    //if we want to use the query building workflow
    llmResponse = await queryBuildingWorkflow(chatAPI, userText)
    setStateAndAddMessage(chatAPI, llmResponse, `Query Building`)
  }
  //else converse with the assistant like normal
  else {
    setStateAndAddMessage(chatAPI, llmResponse, `Question Refinement`)
  }

  return llmResponse
}