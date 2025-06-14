// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { useDisclosure } from '@mantine/hooks';
import { ActionIcon, Button, Divider, Modal, Title } from '@mantine/core';
import { IconCaretRight, IconHistory } from '@tabler/icons-react';

import { setResults } from 'redux/resultsSlice';
import { setQueryValue } from 'redux/queryValueSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';

import { useRunQuery } from 'hooks/useRunQuery';

import styles from "./QueryEditor.module.scss"
import { LLMWarning } from 'components/LLMWarning';

export const QUERY_EDITOR_DOM_ID = "query-editor-container"

export function QueryEditor() {
  const dispatch = useAppDispatch()
  const queryHistory = useAppSelector(state => state.queryHistory.queryHistory)
  const queryValue = useAppSelector(state => state.queryValue.queryValue)

  const { runQuery } = useRunQuery()

  const [historyOpened, { open:openHistory, close:closeHistory }] = useDisclosure(false);

  return (
    <div id={QUERY_EDITOR_DOM_ID}>
      {/* probably want to style this appropriately later */}
      <Title style={{color:"white", marginLeft: 13, marginBottom: 3, marginTop: 2, padding: 1}} order={4}>Query Editor</Title> 
      <div id={styles["query-editor-container"]}>
            <div style={{display: "flex", flexDirection: "column"}}>
              <ActionIcon size="lg" radius={0} variant="filled" aria-label="Run Query" onClick={() => runQuery(queryValue)}>
                <IconCaretRight/>
              </ActionIcon>

              <ActionIcon size="lg" radius={0} variant="filled" color="gray" aria-label="History" onClick={openHistory}>
                <IconHistory/>
              </ActionIcon>
            </div>
            <div>
              <CodeMirror
                extensions={[StreamLanguage.define(sparql)]}
                onChange={val => dispatch(setQueryValue(val))}
                value={queryValue}
              />
            </div>

            <Modal opened={historyOpened} onClose={closeHistory} size="lg" withCloseButton={false}>
              <Title order={2}>
                Query History

                <LLMWarning>
                  <p>These query names are generated by an LLM</p>
                </LLMWarning>
              </Title>
              <Divider/>
              {queryHistory.map((record,i) => {
                return (
                  <Button key={i} className={styles["query-history-button"]} fullWidth variant='default' onClick={() => {
                    dispatch(setQueryValue(record.results.queryValue))
                    dispatch(setResults(record.results))
                  }}>
                    {i+1}: {record.name || "There was an error generating a name for this query"}
                  </Button>
                )
              })}
              
            </Modal>
          </div>
    </div>
  );
}