// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createContext, useContext } from "react";

import { UseMutateFunction, useMutation } from "@tanstack/react-query";

import { pushQueryHistory, updateLastQueryHistory } from 'redux/queryHistorySlice.ts';
import { setResults, setResultsSummary } from 'redux/resultsSlice.ts';
import { useAppDispatch } from "redux/store.ts";

import { runQuery as runQueryFunction } from 'utils/knowledgeBase/runQuery.ts';
import { SummarizeOutcomeType, summarizeQueryResults } from 'utils/summarizeQueryResults.ts';

import { SparqlResultsJsonType } from "types/sparql.ts";

import { useGetNewChatId } from "./useGetNewChatId.ts";
import { useChatAPIInstance } from "./useChatAPIInstance.ts";

//this sets up a context so we can define one runQuery function for the whole app
const RunQueryContext = createContext<{
  runQuery: UseMutateFunction<SparqlResultsJsonType, Error, string, unknown>,
  runQueryIsPending: boolean,
  summarizeResultsIsPending: boolean,
}>({
  runQuery: async () => {},
  runQueryIsPending: false,
  summarizeResultsIsPending: false,
})

//this defines the context provider that should be placed towards the top of the app to make the runQuery function available as a hook
export function RunQueryProvider({
  children,
}:{
  children: React.ReactNode,
}) {
  const dispatch = useAppDispatch()

  const chatAPI = useChatAPIInstance({
    chatId: 1,
  })
  const getNewChatId = useGetNewChatId()
  const handleSummaryResults = ({name,summary}:{name:string,summary:string}) => {
    dispatch(updateLastQueryHistory({name, summary}))
    dispatch(setResultsSummary(summary))
  }
  const handleLLMError = (err:Error) => {
    console.error(err)
    //TODO should we distringuish between a successful LLM summarization vs an error message?
    const summary = `There was an error generating a summary: ${err.message}`
    dispatch(updateLastQueryHistory({name: "Error generating a query name", summary}))
    dispatch(setResultsSummary(summary))
  }

  //useMutation for summarizing query results
  const {isPending: summarizeResultsIsPending, mutate:summarizeResults} = useMutation<void, Error, {query:string, outcome: SummarizeOutcomeType}>({
    mutationKey: ['summarizeResults'],
    mutationFn: async ({query,outcome}) => {
      //try to ask the LLM to give the query a name and summarize the results
      try {
        chatAPI.reset(getNewChatId())
        handleSummaryResults(
          await summarizeQueryResults(chatAPI, query, outcome)
        )
      }
      catch(llmError) {
        handleLLMError(llmError as Error)
      }
    },
  })

  //useMutation for running a query
  const {isPending: runQueryIsPending, mutate:runQuery} = useMutation<SparqlResultsJsonType, Error, string>({
    mutationKey: ['runQuery'],
    mutationFn: async (query: string) => {
      dispatch(setResults(null)) //clear the current results
      return await runQueryFunction(query) //run the query
    },
    onSuccess: async (data, query) => { //the query executed properly
      dispatch(pushQueryHistory({data, query})) //update the query history
      dispatch(setResults({data, error: null, summary: null})) //set the results
      summarizeResults({query, outcome:{data}}) //try to summarize the results
    },
    onError: async (error, query) => { //there was an error executing the query
      console.error(error)
      dispatch(pushQueryHistory({error: error.message, query})) //update the query history
      dispatch(setResults({data: null, error: error.message, summary: null})) //show the error
      summarizeResults({query, outcome:{error}}) //try to explain the error
    },
  })
  

  return (
    <RunQueryContext.Provider value={{
      runQuery,
      runQueryIsPending,
      summarizeResultsIsPending,
    }}>
      {children}
    </RunQueryContext.Provider>
  )
}

//this hook lets any child of the provider access the runQuery function
export function useRunQuery() {
  return useContext(RunQueryContext);
}
