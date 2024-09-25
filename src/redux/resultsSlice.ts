// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { DEMO_RESULTS, IS_DEMO_MODE } from 'utils/demoData'

import { SparqlResultsJsonType } from 'types/sparql'

type ResultsType = {error: string | null, data: SparqlResultsJsonType | null, summary: string | null} | null

const initialState: {
  results: ResultsType,
} = {
  //state for the current query results to display on screen
  results: IS_DEMO_MODE ? DEMO_RESULTS : null,
}

const resultsSlice = createSlice({
  name: 'resultsSlice',
  initialState,
  reducers: {
    setResults: (state, action: PayloadAction<ResultsType>) => {
      state.results = action.payload
    }
  }
})

export const { reducer: resultsReducer, actions: { setResults } } = resultsSlice