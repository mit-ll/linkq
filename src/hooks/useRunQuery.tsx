// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { UseMutateFunction, useMutation } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { WikidataQueryResponseType } from "../types/wikidata.ts";
import { runQuery as runQueryFunction } from '../utils/runQuery.ts';
import { summarizeQueryResults } from '../utils/summarizeQueryResults.ts';
import { setResults } from '../redux/resultsSlice.ts';
import { pushQueryHistory } from '../redux/queryHistorySlice.ts';
import { useAppDispatch } from "../redux/store.ts";
import { useMakeChatGPTAPIInstance } from "./useMakeChatGPTAPIInstance.tsx";

//this sets up a context so we can define one runQuery function for the whole app
const RunQueryContext = createContext<{
  runQuery: UseMutateFunction<WikidataQueryResponseType, Error, string, unknown>,
  runQueryIsPending: boolean,
}>({
  runQuery: async () => {},
  runQueryIsPending: false,
})

//this defines the context provider that should be placed towards the top of the app to make the runQuery function available as a hook
export function RunQueryProvider({
  children,
}:{
  children: React.ReactNode,
}) {
  const dispatch = useAppDispatch()
  const makeChatGPTAPIInstance = useMakeChatGPTAPIInstance()

  //useMutation wraps the workflow for running a query
  //including asking the LLM for a name and summary
  const {isPending: runQueryIsPending, mutate:runQuery} = useMutation<WikidataQueryResponseType, Error, string>({
    mutationKey: ['runQuery'],
    mutationFn: async (query: string) => {
      dispatch(setResults(null)) //clear the current results
      return await runQueryFunction(query) //run the query
    },
    onSuccess: async (data, query) => {
      //try to ask the LLM to give the query a name and summarize the results
      try {
        const chatGPT = makeChatGPTAPIInstance()

        const {name, summary} = await summarizeQueryResults(chatGPT, query, data)
        dispatch(pushQueryHistory({data, name, query, summary})) //update the history with the data
        dispatch(setResults({data, error: null, summary}))
      }
      catch(chatGPTError) {
        dispatch(pushQueryHistory({data, name: null, query, summary: null})) //update the history with the data
        dispatch(setResults({data, error: null, summary: null}))
      }
    },
    onError: async (error, query) => {
      console.error(error)
      //try to ask the LLM to give a name for the query
      try {
        const chatGPT = makeChatGPTAPIInstance()

        const {name, summary} = await summarizeQueryResults(chatGPT, query)
        dispatch(pushQueryHistory({error: error.message, name, query, summary})) //update the history with the data
        dispatch(setResults({data: null, error: error.message, summary}))
      }
      catch(chatGPTError) {
        dispatch(pushQueryHistory({error: error.message, name: null, query, summary: null})) //update the history with the data
        dispatch(setResults({data: null, error: error.message, summary: null}))
      }
    },
  })

  return (
    <RunQueryContext.Provider value={{
      runQuery,
      runQueryIsPending,
    }}>
      {children}
    </RunQueryContext.Provider>
  )
}

//this hook lets any child of the provider access the runQuery function
export function useRunQuery() {
  return useContext(RunQueryContext);
}
