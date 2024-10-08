// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { Title } from '@mantine/core';

import { ApiKeyWarning } from 'components/ApiKeyWarning';
import { Chat } from 'components/Chat/Chat';
import { DemoModeModal } from 'components/DemoModeModal';
import { ErrorMessage } from 'components/ErrorMessage';
import { IDTableContainer } from 'components/IDTable/IDTable';
import { QueryEditor } from 'components/QueryEditor/QueryEditor'
import { QueryVisualization } from "components/QueryVisualization/QueryVisualization";
import { ResultsTable } from 'components/ResultsTable/ResultsTable';

import { useAppSelector } from 'redux/store';

import { useRunQuery, RunQueryProvider } from 'hooks/useRunQuery';

import styles from 'App.module.scss'


function App() {
  return (
    <RunQueryProvider>
      <div id={styles["app"]}>
        <div id={styles["sidebar"]}>
          <Chat/>
        </div>
        
        <div id={styles["content"]}>
          <QueryEditor/>

          <IDTableContainer/>

          <QueryVisualization/>

          <div id={styles["results-content"]}>
            <Results/>
          </div>
        </div>
      </div>

      <DemoModeModal/>
      <ApiKeyWarning/>
    </RunQueryProvider>
  )
}

export default App


function Results() {
  const { runQueryIsPending } = useRunQuery()
  const results = useAppSelector(state => state.results.results)

  if(runQueryIsPending) {
    return <p>Loading...</p>
  }
  else if(results?.error) {
    return (
      <>
        <p>There was an error running your query</p>
        <pre>{results.error}</pre>
      </>
    )
  }
  else if(results?.data) {
    return (
      <>
        <Title order={4}>Results Summary from LLM</Title>
        {results.summary ? <p>{results.summary}</p> : <ErrorMessage>There was an error generating a summary.</ErrorMessage>}
        <hr/>
        <Title order={4}>Results Table from KG</Title>
        <ResultsTable data={results.data}/>
      </>
    )
  }
  else {
    return <p id={styles["empty-results-message"]}><b>Run a query to see results!</b></p>
  }
}