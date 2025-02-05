// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { Title } from "@mantine/core"
import { ErrorMessage } from "components/ErrorMessage"
import { InfoModal } from "components/InfoModal"
import { LLMWarning } from "components/LLMWarning"
import { ResultsTable } from "components/ResultsTable/ResultsTable"
import { useRunQuery } from "hooks/useRunQuery"
import { useAppSelector } from "redux/store"

import styles from "./Results.module.scss"
import { ResultsGraph } from "components/ResultsGraph/ResultsGraph"

export function Results() {
  const { runQueryIsPending } = useRunQuery()
  const results = useAppSelector(state => state.results.results)

  const summaryContent = (() => {
    if(results) {
      if(results.summary) {
        return (
          <div>
            <LLMWarning>
              <p>This results summary was generated by an LLM that can make mistakes. Refer below to the Results Table from KG for ground-truth data.</p>
              <p>Note that the absence of data does not necessairly mean that there is actually no data in the data source. It is possible that the query did not find what that you are looking for.</p>
            </LLMWarning>

            <p>{results.summary}</p>
          </div>
        )
      }
      else {
        return <p>Loading...</p>
      }
    }
  })()

  const resultsContent = (() => {
    if(results?.data) {
      return (
        <>
          <ResultsTable data={results.data}/>
          <ResultsGraph data={results.data}/>
        </>
      )
    }
    else if(results?.error) {
      return (
        <>
          <ErrorMessage>There was an error running your query:</ErrorMessage>
          <pre>{results.error}</pre>
        </>
      )
    }
    return null
  })()

  if(runQueryIsPending) {
    return <p>Loading...</p>
  }
  else if(results?.error || results?.data) {
    return (
      <>
        <Title order={4}>Results Summary from LLM</Title>
        {summaryContent}
        
        <hr/>
        
        <Title order={4}>
          Results Table from KG
          <InfoModal title="Results Table from KG">
            <p>These are ground-truth results retrieved from the KG using the query you executed.</p>
            <p>Note that the absence of data does not necessairly mean that there is actually no data in the data source. It is possible that the query did not find what that you are looking for.</p>
          </InfoModal>
        </Title>
        {resultsContent}
      </>
    )
  }
  else {
    return <p id={styles["empty-results-message"]}><b>Run a query to see results!</b></p>
  }
}