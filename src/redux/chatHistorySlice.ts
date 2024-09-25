// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { ChatHistoryType, ChatMessageType } from 'utils/ChatGPTAPI'
import { DEMO_FULL_HISTORY, DEMO_SIMPLE_HISTORY, IS_DEMO_MODE } from 'utils/demoData'


const initialState: {
  chatIdCounter: number,
  fullChatHistory: ChatHistoryType,
  simpleChatHistory: ChatHistoryType,
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
    addMessagesToFullChatHistory: (state, action: PayloadAction<ChatHistoryType>) => {
      state.fullChatHistory.push(...action.payload)
    },
    addMessageToSimpleChatHistory: (state, action: PayloadAction<ChatMessageType>) => {
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