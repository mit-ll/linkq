// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { PayloadAction, createSlice } from '@reduxjs/toolkit'

import { DEMO_QUERY, IS_DEMO_MODE } from 'utils/demoData'


// const GET_GOOGLE_FOUNDERS_AND_BIRTHDAYS = `SELECT ?founder ?founderLabel ?birthdate
// WHERE {
//   wd:Q95 wdt:P112 ?founder.
//   ?founder wdt:P569 ?birthdate.
//   SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],en". }
// }`

const initialState: {
  queryValue: string,
} = {
  //state for the query in the editor
  // queryValue: GET_GOOGLE_FOUNDERS_AND_BIRTHDAYS, // use this for google founder start for the UI
  queryValue: IS_DEMO_MODE ? DEMO_QUERY : "", // use this for a blank editor
}

const queryValueSlice = createSlice({
  name: 'queryValueSlice',
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    setQueryValue: (state, action: PayloadAction<string>) => {
      state.queryValue = action.payload
    }
  }
})

export const { reducer: queryValueReducer, actions: { setQueryValue } } = queryValueSlice