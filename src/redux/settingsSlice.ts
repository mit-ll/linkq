// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const initialState: {
  apiKey: string,
  baseURL: string,
  model: string,
} = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY?.trim() || "",
  baseURL: import.meta.env.VITE_BASE_URL?.trim() || "https://api.openai.com/v1/",
  model: import.meta.env.VITE_MODEL?.trim() || "gpt-4-turbo-preview",
}

const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState,
  reducers: {
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload
    },
  }
})

export const { reducer: settingsReducer, actions: { setBaseURL, setModel } } = settingsSlice