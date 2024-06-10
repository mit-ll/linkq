// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'
import { WikidataQueryResponseType } from '../types/wikidata'


type QueryRecordType = {
  name: string | null,
  query: string,
  results: {
    data: WikidataQueryResponseType | null,
    error: string | null,
    summary: string | null,
  },
}

const initialState: {
  queryHistory: QueryRecordType[],
} = {
  //state for the query history (including query name, results, and summary)
  queryHistory: [],
}

type PushQueryHistoryPayloadType = {
  data:WikidataQueryResponseType, name: string|null, query: string, summary: string|null
} | {
  error: string, name: string|null, query: string, summary: string|null
}

const queryHistorySlice = createSlice({
  name: 'queryHistorySlice',
  initialState,
  reducers: {
    pushQueryHistory: (state, action: PayloadAction<PushQueryHistoryPayloadType>) => {
      if("data" in action.payload) { //if there is data
        state.queryHistory.push({
          name: action.payload.name,
          query: action.payload.query,
          results: {
            data: action.payload?.data || null,
            error: null,
            summary: action.payload.summary,
          },
        })
      }
      else if("error" in action.payload) { //else if there is an error
        state.queryHistory.push({
          name: action.payload.name,
          query: action.payload.query,
          results: {
            data: null,
            error: action.payload.error,
            summary: action.payload.summary,
          },
        })
      }
      else {
        //this condition should never happen
        throw Error('Unknown action.payload: ' + action.payload);
      }
    }
  }
})


export const { reducer: queryHistoryReducer, actions: { pushQueryHistory } } = queryHistorySlice