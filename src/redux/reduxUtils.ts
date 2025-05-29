// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { addMessagesToFullChatHistory, LinkQChatMessageType } from "redux/chatHistorySlice"
import { setStage, StageType } from "redux/stageSlice"
import { store } from "redux/store"
import { ChatAPI, IntermediateChatMessageType } from "utils/ChatAPI"

/**
 * This function lets us set the current stage and update the conversation history with what the LLM responded with
 * @param llmResponse 
 * @param stage 
 */
export const reduxHandleLLMResponse = (llmResponse: LinkQChatMessageType, stage:StageType) => {
  store.dispatch(addMessagesToFullChatHistory([
    {
      ...llmResponse,
      stage,
    }
  ]))
  store.dispatch(setStage(stage))
}

/**
 * This function sends a message through the chatAPI and also updates our conversation history
 * @param chatAPI 
 * @param messages 
 * @returns         LLM response
 */
export const reduxSendMessages = async (chatAPI: ChatAPI, messages:IntermediateChatMessageType[]) => {
  store.dispatch(addMessagesToFullChatHistory(messages.map((m) => chatAPI.transformMessage(m))))
  return await chatAPI.sendMessages(messages)
}


/**
 * This function updates the stage
 * @param stage 
 */
export const reduxSetStage = (stage: StageType) => {
  store.dispatch(setStage(stage))
}