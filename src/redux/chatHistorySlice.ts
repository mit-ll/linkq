// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'

import { DEMO_FULL_HISTORY, DEMO_SIMPLE_HISTORY, IS_DEMO_MODE } from 'utils/demoData'
import { StageType } from './stageSlice'

export type LinkQChatMessageType = ChatCompletionMessageParam & {
  content: string
  chatId: number
  name: string
  stage?: StageType,
}

//"simple" is a bare-bones for novice users
//"condensed" shows more info for intermediate users 
//"full" shows all the messages for expert users
export const CHAT_HISTORY_DISPLAY_OPTIONS = {
  "simple": "Simple View",
  "condensed": "Condensed View",
  "full": "Full Chat History",
} as const
export type ChatHistoryDisplayType = keyof typeof CHAT_HISTORY_DISPLAY_OPTIONS

const initialState: {
  chatIdCounter: number,
  fullChatHistory: LinkQChatMessageType[],
  simpleChatHistory: LinkQChatMessageType[],
  chatHistoryDisplay: ChatHistoryDisplayType,
} = {
  chatIdCounter: 1,

  //state for the full chat history, including system messages and the LLM interfacing with the KG API
  fullChatHistory: IS_DEMO_MODE ? DEMO_FULL_HISTORY : [],

  chatHistoryDisplay: "condensed",

  //state for the filtered chat history (ie no behind-the-scenes system messages)
  simpleChatHistory: IS_DEMO_MODE ? DEMO_SIMPLE_HISTORY : [],
}

const chatHistorySlice = createSlice({
  name: 'chatHistorySlice',
  initialState,
  reducers: {
    addMessagesToFullChatHistory: (state, action: PayloadAction<LinkQChatMessageType[]>) => {
      state.fullChatHistory.push(...action.payload)
    },
    addMessageToSimpleChatHistory: (state, action: PayloadAction<LinkQChatMessageType>) => {
      state.simpleChatHistory.push(action.payload)
    },
    incrementChatIdCounter: (state) => {
      state.chatIdCounter++
    },
    setChatHistoryDisplay: (state, action: PayloadAction<ChatHistoryDisplayType>) => {
      state.chatHistoryDisplay = action.payload
    }
  }
})

export const { 
  reducer: chatHistorySliceReducer, 
  actions: {
    addMessagesToFullChatHistory,
    addMessageToSimpleChatHistory,
    incrementChatIdCounter,
    setChatHistoryDisplay,
  }
} = chatHistorySlice