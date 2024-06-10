// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { ChatHistoryType } from '../utils/ChatGPTAPI'


const initialState: {
  fullChatHistory: ChatHistoryType,
  showFullChatHistory: boolean,
  simpleChatHistory: ChatHistoryType,
} = {
  //state for the full chat history, including system messages and the LLM interfacing with the KG API
  fullChatHistory: [],
  //this option toggles showing the full chat history for an ML expert user
  //vs hiding the system messages for a non-expert user
  showFullChatHistory: true,
  //state for the filtered chat history (ie no behind-the-scenes system messages)
  simpleChatHistory: [],
}

const chatHistorySlice = createSlice({
  name: 'chatHistorySlice',
  initialState,
  reducers: {
    setFullChatHistory: (state, action: PayloadAction<ChatHistoryType>) => {
      state.fullChatHistory = action.payload
    },
    pushSimpleChatHistory: (state, action: PayloadAction<ChatHistoryType[number]>) => {
      state.simpleChatHistory.push(action.payload)
    },
    toggleShowFullChatHistory: state => {
      state.showFullChatHistory = !state.showFullChatHistory
    }
  }
})

export const { 
  reducer: chatHistorySliceReducer, 
  actions: {
    setFullChatHistory,
    pushSimpleChatHistory,
    toggleShowFullChatHistory,
  }
} = chatHistorySlice