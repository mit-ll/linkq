// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { store } from "redux/store"
import { ChatAPI, SendMessagesReturnType, setLLMResponseStage } from "./ChatAPI"
import { queryBuildingWorkflow } from "./queryBuildingWorkflow"
import { setStage } from "redux/stageSlice"

/**
 * This is the main function that handles the user sending one chat message.
 * Currently, it decides whether to initiate the query building workflow or not
 * @param userText  the user's message, as a string
 * @param chatAPI   the ChatAPI instance
 * @returns         the LLM response
 */
export async function handleUserChat(userText: string, chatAPI: ChatAPI) {
  //get the LLM to respond
  let llmResponse = await new Promise<SendMessagesReturnType>((resolve, reject) => {
    chatAPI.sendMessages([
      { content: userText, role: "user", stage: {
        mainStage: "Question Refinement",
        subStage: "User asks question",
        description: userText,
      } }
    ]).then(resolve).catch(reject)

    store.dispatch(setStage({
      mainStage: "Question Refinement",
      subStage: "LLM decides whether to clarify question",
    }))
  })
  
  //determine what to do with the LLM's response
  if(llmResponse.content.includes("BUILD QUERY")) {
    //if we want to use the query building workflow
    llmResponse = await queryBuildingWorkflow(chatAPI, userText)
    setLLMResponseStage(chatAPI, llmResponse, {
      mainStage: "Query Generation",
      subStage: "LLM generates query",
    })
    setTimeout(() => {
      store.dispatch(setStage({
        mainStage: "Query Generation",
        subStage: "User decides whether to execute or modify",
      }))
    }, 2000)
  }
  //else converse with the assistant like normal
  else {
    setLLMResponseStage(chatAPI, llmResponse, {
      mainStage: "Question Refinement",
      subStage: "LLM clarifies question",
    })
    setTimeout(() => {
      store.dispatch(setStage({
        mainStage: "Question Refinement",
        subStage: "User asks question",
      }))
    }, 2000)
  }

  return llmResponse
}