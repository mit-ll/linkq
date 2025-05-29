// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { DEMO_QUERY_HISTORY, IS_DEMO_MODE } from 'utils/demoData'

import { SparqlResultsJsonType } from 'types/sparql'


type QueryRecordType = {
  name: string | null,
  results: {
    data: SparqlResultsJsonType | null,
    error: string | null,
    summary: string | null,
    queryValue: string,
  },
}

const initialState: {
  queryHistory: QueryRecordType[],
} = {
  //state for the query history (including query name, results, and summary)
  queryHistory: IS_DEMO_MODE ? DEMO_QUERY_HISTORY : [],
}

type PushQueryHistoryPayloadType = {
  data:SparqlResultsJsonType, queryValue: string //the query executed with data
} | {
  error: string, queryValue: string //there was an error executing the query
}

type UpdateLastQueryHistoryPayloadType = {
  name: string, summary: string
}

const queryHistorySlice = createSlice({
  name: 'queryHistorySlice',
  initialState,
  reducers: {
    //we want to decouple showing the query results vs showing the LLM summary
    pushQueryHistory: (state, action: PayloadAction<PushQueryHistoryPayloadType>) => {
      if("data" in action.payload) { //if there is data
        state.queryHistory.push({
          name: null,
          results: {
            data: action.payload?.data || null,
            error: null,
            summary: null,
            queryValue: action.payload.queryValue,
          },
        })
      }
      else if("error" in action.payload) { //else if there is an error running the query
        state.queryHistory.push({
          name: null,
          results: {
            data: null,
            error: action.payload.error,
            summary: null,
            queryValue: action.payload.queryValue,
          },
        })
      }
      else {
        //this condition should never happen
        throw Error('Unknown action.payload: ' + action.payload);
      }
    },
    updateLastQueryHistory: (state, action: PayloadAction<UpdateLastQueryHistoryPayloadType>) => {
      const lastHistory = state.queryHistory.at(-1)
      if(!lastHistory) {
        throw new Error("Could not find last last query history element. There is a state management issue.")
      }
      else if(lastHistory.name !== null) {
        throw new Error(`Expected last query history name to be null. Received ${lastHistory.name}. There is a state management issue.`)
      }
      else if(lastHistory.results.summary !== null) {
        throw new Error(`Expected last query history results.summary to be null. Received ${lastHistory.results.summary}. There is a state management issue.`)
      }

      lastHistory.name = action.payload.name
      lastHistory.results.summary = action.payload.summary
    },
  }
})


export const { reducer: queryHistoryReducer, actions: { pushQueryHistory, updateLastQueryHistory } } = queryHistorySlice