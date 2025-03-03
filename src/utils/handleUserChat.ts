// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { ChatAPI } from "./ChatAPI"
import { queryBuildingWorkflow } from "./queryBuildingWorkflow"
import { reduxSendMessages, reduxHandleLLMResponse, reduxSetStage } from "redux/reduxUtils"

/**
 * This is the main function that handles the user sending one chat message.
 * Currently, it decides whether to initiate the query building workflow or not
 * @param userText  the user's message, as a string
 * @param chatAPI   the ChatAPI instance
 * @returns         the LLM response
 */
export async function handleUserChat(userText: string, chatAPI: ChatAPI) {
  reduxSetStage({
    mainStage: "Question Refinement",
    subStage: "LLM decides whether to clarify question",
  })

  //get the LLM to respond
  let llmResponse = await reduxSendMessages(chatAPI,[
    { content: userText, role: "user", stage: {
      mainStage: "Question Refinement",
      subStage: "User asks question",
      description: userText,
    } }
  ])
  
  //determine what to do with the LLM's response
  if(llmResponse.content.includes("BUILD QUERY:")) {
    //if we want to use the query building workflow

    reduxHandleLLMResponse(llmResponse, {
      mainStage: "KG Exploration",
      subStage: "System enumerates KG APIs", //this is slightly inaccurate, but how we've decided to display the stages
    })
    
    const question = llmResponse.content.split("BUILD QUERY:").at(1)
    llmResponse = await queryBuildingWorkflow(chatAPI, (question || userText).trim())
    reduxHandleLLMResponse(llmResponse, {
      mainStage: "Query Generation",
      subStage: "LLM generates query",
    })
    setTimeout(() => {
      reduxSetStage({
        mainStage: "Query Generation",
        subStage: "User decides whether to execute or modify",
      })
    }, 2000)
  }
  //else converse with the assistant like normal
  else {
    //if the LLM generated a query
    if(llmResponse.content.includes("```sparql")) {
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "Query Generation",
        subStage: "LLM generates query",
      })
      setTimeout(() => {
        reduxSetStage({
          mainStage: "Query Generation",
          subStage: "User decides whether to execute or modify",
        })
      }, 2000)
    }
    else { //else ASSUME the LLM clarified the question
      reduxHandleLLMResponse(llmResponse, {
        mainStage: "Question Refinement",
        subStage: "LLM clarifies question",
      })
      setTimeout(() => {
        reduxSetStage({
          mainStage: "Question Refinement",
          subStage: "User asks question",
        })
      }, 2000)
    }
  }

  return llmResponse
}