// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const REDUX_SETTINGS_INITIAL_STATE: {
  apiKey: string,
  baseURL: string,
  model: string,
  persistAPIKey: boolean,
  showSettings: boolean,
  showStateDiagramStatus: boolean,
} = {
  apiKey: localStorage.getItem("apiKey") || import.meta.env.VITE_OPENAI_API_KEY?.trim() || "",
  baseURL: localStorage.getItem("baseURL") || import.meta.env.VITE_BASE_URL?.trim() || "https://api.openai.com/v1/",
  model: localStorage.getItem("model") || import.meta.env.VITE_MODEL?.trim() || "gpt-5.4-nano",
  persistAPIKey: localStorage.getItem("persistAPIKey") === "true",
  showSettings: false,
  showStateDiagramStatus: false,
}

const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState: REDUX_SETTINGS_INITIAL_STATE,
  reducers: {
    setApiKey: (state, action: PayloadAction<string>) => {
      state.apiKey = action.payload
      if(state.persistAPIKey) {
        localStorage.setItem("apiKey",state.apiKey)
      }
    },
    setBaseURL: (state, action: PayloadAction<string>) => {
      state.baseURL = action.payload
      localStorage.setItem("baseURL",action.payload)
    },
    setModel: (state, action: PayloadAction<string>) => {
      state.model = action.payload
      localStorage.setItem("model",action.payload)
    },
    togglePersistAPIKey: (state) => {
      state.persistAPIKey = !state.persistAPIKey
      if(state.persistAPIKey) {
        localStorage.setItem("apiKey",state.apiKey)
        localStorage.setItem("persistAPIKey","true")
        
      }
      else {
        localStorage.removeItem("apiKey")
        localStorage.removeItem("persistAPIKey")
      }
    },
    toggleShowSettings: (state) => {
      state.showSettings = !state.showSettings
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
    togglePersistAPIKey,
    toggleShowSettings,
    toggleShowStateDiagramStatus,
  }
} = settingsSlice