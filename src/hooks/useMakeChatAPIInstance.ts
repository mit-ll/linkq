// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { addMessagesToFullChatHistory } from "redux/chatHistorySlice"
import { useAppDispatch, useAppSelector } from "redux/store"

import { ChatAPI, ChatGPTAPIConstructorArgsType, ChatHistoryType } from "utils/ChatAPI"
import { useGetNewChatId } from "./useGetNewChatId"

//This is the hook returns a function that creates a new chat gpt api instance
//using the api key in redux and setting the addMessagesCallback
//argument to save the messages to the chat history
export function useMakeChatAPIInstance() {
  const dispatch = useAppDispatch()

  const apiKey = useAppSelector((state) => state.settings.apiKey)
  const baseURL = useAppSelector((state) => state.settings.baseURL)
  
  const getNewChatId = useGetNewChatId()

  return (options: ChatGPTAPIConstructorArgsType={
    chatId: getNewChatId(),
  }) => {
    return new ChatAPI({
      apiKey,
      baseURL,
      dangerouslyAllowBrowser: true, //this is necessary for using a browser
      addMessagesCallback: (newMessages:ChatHistoryType) => dispatch(addMessagesToFullChatHistory(newMessages)),
      ...options,
    })
  }
}