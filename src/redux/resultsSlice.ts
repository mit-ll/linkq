// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { DEMO_RESULTS, IS_DEMO_MODE } from 'utils/demoData'

import { SparqlResultsJsonType } from 'types/sparql'

type ResultsType = {
  error: string | null, 
  data: SparqlResultsJsonType | null, 
  summary: string | null, //null means that the LLM summarization is still loading
  queryValue: string,
} | null

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
    },
    setResultsSummary: (state, action: PayloadAction<string>) => {
      if(!state.results) throw new Error("Results are null. There is a state management issue.")
      state.results.summary = action.payload
    }
  }
})

export const { reducer: resultsReducer, actions: { setResults, setResultsSummary } } = resultsSlice