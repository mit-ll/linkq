// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createSlice } from '@reduxjs/toolkit'

const initialState: {
  apiKey: string,
} = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY?.trim() || "",
}

const settingsSlice = createSlice({
  name: 'settingsSlice',
  initialState,
  reducers: {}
})

export const { reducer: settingsReducer, actions: {} } = settingsSlice