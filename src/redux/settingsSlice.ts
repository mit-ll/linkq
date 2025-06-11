// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const REDUX_SETTINGS_INITIAL_STATE: {
  apiKey: string,
  baseURL: string,
  model: string,
  showStateDiagramStatus: boolean,
} = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY?.trim() || "",
  baseURL: import.meta.env.VITE_BASE_URL?.trim() || localStorage.getItem("baseURL") || "https://api.openai.com/v1/",
  model: import.meta.env.VITE_MODEL?.trim() || localStorage.getItem("model") || "gpt-4o",
  showStateDiagramStatus: false,
}

const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState: REDUX_SETTINGS_INITIAL_STATE,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload
    },
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload
      localStorage.setItem("baseURL",action.payload)
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload
      localStorage.setItem("model",action.payload)
    },
    toggleShowStateDiagramStatus: (state) => {
      state.showStateDiagramStatus = !state.showStateDiagramStatus
    },
  }
})

export const {
  reducer: settingsReducer,
  actions: {
    setApiKey, setBaseURL, setModel,
    toggleShowStateDiagramStatus,
  }
} = settingsSlice