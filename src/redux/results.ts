// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { WikidataQueryResponseType } from '../types/wikidata'

type ResultsType = {error: string | null, data: WikidataQueryResponseType | null, summary: string | null} | null

const initialState: {
  results: ResultsType,
} = {
  //state for the current query results to display on screen
  results: null,
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