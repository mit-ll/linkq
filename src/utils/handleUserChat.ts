// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { ChatGPTAPI } from "./ChatGPTAPI"
import { queryBuildingWorkflow } from "./queryBuildingWorkflow"

/**
 * This is the main function that handles the user sending one chat message.
 * Currently, it decides whether to initiate the query building workflow or not
 * @param userText  the user's message, as a string
 * @param chatGPT   the ChatGPT instance
 * @returns         the LLM response
 */
export async function handleUserChat(userText: string, chatGPT: ChatGPTAPI) {
  //get the LLM to respond
  let llmResponse = await chatGPT.sendMessages([
    { content: userText, role: "user" }
  ])
  
  //determine what to do with the LLM's response
  if(llmResponse.content.includes("BUILD QUERY")) {
    //if we want to use the query building workflow
    llmResponse = await queryBuildingWorkflow(chatGPT, userText) 
  }
  //else converse with the assistant like normal

  return llmResponse
}