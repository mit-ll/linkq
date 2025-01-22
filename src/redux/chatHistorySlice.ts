// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs'
import { LinkQStageType } from 'types/linkQ'

import { DEMO_FULL_HISTORY, DEMO_SIMPLE_HISTORY, IS_DEMO_MODE } from 'utils/demoData'

export type LinkQChatMessageType = ChatCompletionMessageParam & {
  content:string
  chatId: number
  name: string
  stage: LinkQStageType,
}

const initialState: {
  chatIdCounter: number,
  fullChatHistory: LinkQChatMessageType[],
  simpleChatHistory: LinkQChatMessageType[],
  showFullChatHistory: boolean,
} = {
  chatIdCounter: 1,

  //state for the full chat history, including system messages and the LLM interfacing with the KG API
  fullChatHistory: IS_DEMO_MODE ? DEMO_FULL_HISTORY : [],

  //this option toggles showing the full chat history for an ML expert user
  //vs hiding the system messages for a non-expert user
  showFullChatHistory: true,

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
    toggleShowFullChatHistory: state => {
      state.showFullChatHistory = !state.showFullChatHistory
    }
  }
})

export const { 
  reducer: chatHistorySliceReducer, 
  actions: {
    addMessagesToFullChatHistory,
    addMessageToSimpleChatHistory,
    incrementChatIdCounter,
    toggleShowFullChatHistory,
  }
} = chatHistorySlice