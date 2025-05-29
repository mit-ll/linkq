// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { useDispatch, useSelector } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

import { chatHistorySliceReducer } from './chatHistorySlice'
import { queryHistoryReducer } from './queryHistorySlice'
import { queryValueReducer } from './queryValueSlice'
import { resultsReducer } from './resultsSlice'
import { settingsReducer } from './settingsSlice'
import { stageSliceReducer } from './stageSlice'

export const store = configureStore({
  reducer: {
    chatHistory: chatHistorySliceReducer,
    queryHistory: queryHistoryReducer,
    queryValue: queryValueReducer,
    results: resultsReducer,
    settings: settingsReducer,
    stage: stageSliceReducer,
  }
})

//based on https://redux.js.org/tutorials/typescript-quick-start

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred dispatch
export type AppDispatch = typeof store.dispatch


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

