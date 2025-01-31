// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createContext, useContext } from "react";
import { useMutation, UseMutationResult } from "@tanstack/react-query";

import { useAppDispatch } from "redux/store";
import { addMessageToSimpleChatHistory } from "redux/chatHistorySlice";

import { ChatAPI } from "utils/ChatAPI";
import { handleUserChat } from "utils/handleUserChat";
import { INITIAL_SYSTEM_MESSAGE } from "utils/knowledgeBase/prompts";

import { useChatAPIInstance } from "./useChatAPIInstance";


//create a context to let any component use the main chatAPI
export const MainChatAPIContext = createContext<{
  chatAPI: ChatAPI,
  useMutationOutput: UseMutationResult<void, Error, string, unknown>,
//@ts-ignore
}>(null);

export function MainChatAPIProvider({
  children,
}:{
  children: React.ReactNode,
}) {
  const chatAPI = useChatAPIInstance({
    chatId: 0,
    systemMessage: INITIAL_SYSTEM_MESSAGE,
  })

  const dispatch = useAppDispatch()
  const useMutationOutput = useMutation({
    mutationKey: ['submit-chat'],
    /**
     * This function handles what happens when the user submits a chat message
     * It sends the message to the LLM and determines whether to go down the query-building workflow
     * @param text  the user's message
     */
    mutationFn: async (text:string) => {
      //add the user's message to the simple chat history
      dispatch(addMessageToSimpleChatHistory({
        chatId: chatAPI.chatId,
        content: text, 
        name: "user",
        role: "user",
        stage: "Question Refinement",
      }))

      const llmResponse = await handleUserChat(text, chatAPI)

      //add the LLM's final response to the simple chat
      dispatch(addMessageToSimpleChatHistory(llmResponse))
    },
    onError(err) {
      console.error(err)
    }
  })

  return (
    <MainChatAPIContext.Provider value={{
      chatAPI,
      useMutationOutput,
    }}>
      {children}
    </MainChatAPIContext.Provider>
  )
}

export function useMainChatAPI() {
  return useContext(MainChatAPIContext)
}