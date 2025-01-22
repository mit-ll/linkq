// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { addMessagesToFullChatHistory, LinkQChatMessageType } from "redux/chatHistorySlice"
import { useAppDispatch, useAppSelector } from "redux/store"

import { ChatAPI, ChatAPIConstructorArgsType } from "utils/ChatAPI"
import { useMemo } from "react"

//This is the hook returns a chat gpt api instance memoized based on the chatId
export function useChatAPIInstance(args: ChatAPIConstructorArgsType) {
  const dispatch = useAppDispatch()

  const apiKey = useAppSelector((state) => state.settings.apiKey)
  const baseURL = useAppSelector((state) => state.settings.baseURL)
  const model = useAppSelector((state) => state.settings.model)
  
  const chatAPI = useMemo(() => (
    new ChatAPI({
      ...args,
      addMessagesCallback: (newMessages:LinkQChatMessageType[]) => dispatch(addMessagesToFullChatHistory(newMessages)),
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true, //this is necessary for using a browser
    })
  ), [])
  chatAPI.openAI.apiKey = apiKey
  chatAPI.openAI.baseURL = baseURL
  chatAPI.chatCompletionCreateOptions.model = model

  return chatAPI
}