// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { addMessagesToFullChatHistory } from "redux/chatHistorySlice"
import { useAppDispatch, useAppSelector } from "redux/store"

import { ChatGPTAPI, ChatGPTAPIConstructorArgsType, ChatHistoryType } from "utils/ChatGPTAPI"

import { useGetNewChatId } from "./useGetNewChatId"


//This is the hook returns a function that creates a new chat gpt api instance
//using the api key in redux and setting the addMessagesCallback
//argument to save the messages to the chat history
export function useMakeChatGPTAPIInstance() {
  const apiKey = useAppSelector((state) => state.settings.apiKey)
  const dispatch = useAppDispatch()
  const getNewChatId = useGetNewChatId()

  return (options: ChatGPTAPIConstructorArgsType={
    chatId: getNewChatId(),
  }) => {
    return new ChatGPTAPI({
      apiKey,
      dangerouslyAllowBrowser: true, //this is necessary for using a browser
      addMessagesCallback: (newMessages:ChatHistoryType) => dispatch(addMessagesToFullChatHistory(newMessages)),
      ...options,
    })
  }
}