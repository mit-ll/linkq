// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { ActionIcon, Button, Checkbox, Modal, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import styles from "./Chat.module.scss"
import { useMutation } from "@tanstack/react-query";
import { IconCaretRight, IconSettings, IconZoomCode } from '@tabler/icons-react';
import { ErrorMessage } from '../ErrorMessage';
import { useRunQuery } from '../../hooks/useRunQuery';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { pushSimpleChatHistory, toggleShowFullChatHistory } from '../../redux/chatHistorySlice';
import { setQueryValue } from '../../redux/queryValueSlice';
import { queryBuildingWorkflow } from '../../utils/queryBuildingWorkflow';
import { useChatGPT } from '../../hooks/useChatGPT';

export function Chat() {
  const dispatch = useAppDispatch()
  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const showFullChatHistory = useAppSelector(state => state.chatHistory.showFullChatHistory)
  const simpleChatHistory = useAppSelector(state => state.chatHistory.simpleChatHistory)

  //based on showFullChatHistory, decide which chat history to display to the user
  const chatHistory = showFullChatHistory ? fullChatHistory : simpleChatHistory

  const chatScrollBottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if(chatScrollBottomRef.current) {
      chatScrollBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory.length])

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const closeSettingsModal = () => setShowSettingsModal(false)

  // const [inputText, setInputText] = useState<string>("Who won the 2023 Formula One Championship?"); // prefill the chat
  const [inputText, setInputText] = useState<string>("");

  const chatGPT = useChatGPT()

  const {error, isPending, mutate:submitChat, reset} = useMutation({
    mutationKey: ['submit-chat'],
    /**
     * This function handles what happens when the user submits a chat message
     * It sends the message to the LLM and determines whether to go down the query-building workflow
     * @param text  the user's message
     */
    mutationFn: async (text:string) => {
      //add the user's chat into the simple history
      dispatch(pushSimpleChatHistory({role: "user", content: text}))
  
      //get the LLM to response
      const llmResponse = await chatGPT.sendMessages([ {content: text,role: "user"} ])
  
      //determine what to do with the LLM's response
      const content = llmResponse.includes("BUILD QUERY") ? (
        await queryBuildingWorkflow(chatGPT, text) //if we want to use the dynamic workflow
      ) : (
        llmResponse //else converse with the assistant like normal
      )
  
      //add the LLM's chat into the simple history
      dispatch(pushSimpleChatHistory({ content, role: "assistant" }))
    },
    onError(err) {
      console.error(err)
    }
  })

  return (
    <div id={styles["chat-container"]}>
      <Modal opened={showSettingsModal} onClose={closeSettingsModal} title="Settings">
        <Checkbox
          checked={showFullChatHistory}
          onChange={() => dispatch(toggleShowFullChatHistory())}
          label="Show full chat history"
        />
      </Modal>

      <ActionIcon id={styles["chat-settings-button"]} size="sm" variant="filled" aria-label="Show Settings" onClick={() => setShowSettingsModal(true)}>
        <IconSettings/>
      </ActionIcon>

      <div id={styles["chat-scroll-container"]}>
        {chatHistory.map((c, i) => {
          return (
            <div key={i} className={`${styles["chat-entry"]} ${styles[c.role]}`}>
              {
                c.role === "assistant" 
                ? <RenderLLMResponse text={c.content} setInputText={setInputText}/>
                : <pre className={styles.chat}>{c.content}</pre> 
              }
            </div>
          )
        })}
        <div ref={chatScrollBottomRef}/>
      </div>

      {error && (
        <Modal opened={true} onClose={reset} title="LLM Error">
          <ErrorMessage>{error.message}</ErrorMessage>
        </Modal>
      )}
      {isPending && <p className={styles.loading}>Loading...</p>}

      <form
        onSubmit={e => {
          e.preventDefault()
          submitChat(inputText)
          setInputText("")
        }}
      >
        <TextInput
          id={styles.input}
          onChange={(event) => setInputText(event.currentTarget.value)}
          placeholder="Chat..."
          size={"md"}
          value={inputText}
        />
      </form>
    </div>
  )
}

function RenderLLMResponse({
  setInputText,
  text,
}:{
  setInputText: (inputText:string) => void,
  text: string,
}) {
  const parsedQuery = tryParsingOutQuery(text)
  if(parsedQuery) {
    return (
      <div className={styles.chat}>
        <RenderSparqlQuery
          pre={parsedQuery.pre}
          query={parsedQuery.query.trim()}
          post={parsedQuery.post}

          setInputText={setInputText}
        />
      </div>
    )
  }

  return <pre className={styles.chat}>{text}</pre>
}

function tryParsingOutQuery(text: string) {
  let split = text.split("```sparql")
  if(split.length === 2) {
    const [query, post] = split[1].split("```")
    return {pre: split[0], query, post}
  }
  
  split = text.split("```\nSELECT")
  if(split.length === 2) {
    const [queryWithoutSelect, post] = split[1].split("```")
    return {pre: split[0], query: "SELECT" + queryWithoutSelect, post}
  }
  split = text.split("SELECT")
  if(split.length === 2) {
    const [queryWithoutSelect, post] = split[1].split("\n\n")
    return {pre: split[0], query: "SELECT" + queryWithoutSelect, post}
  }
  return null
}

function RenderSparqlQuery({
  pre,
  query,
  post,

  setInputText,
}:{
  pre: string,
  query: string,
  post: string,

  setInputText: (inputText:string) => void,
}) {
  const dispatch = useAppDispatch()

  const { runQuery } = useRunQuery()

  return (
    <>
      <pre>{pre}</pre>
      <CodeMirror
        extensions={[StreamLanguage.define(sparql)]}
        value={query}
      />
      <div className={styles["copy-query-buttons"]}>
        <div>
          <Button onClick={() => dispatch(setQueryValue(query))} variant="outline" color="white">Copy query over to examine <IconZoomCode/></Button>
          <br/>
          <Button onClick={() => {
            dispatch(setQueryValue(query))
            runQuery(query)
          }}>Copy query over and run <IconCaretRight/></Button>
        </div>
      </div>
      <pre>{post}</pre>
      <br/>
      <Button onClick={() => setInputText("You identified the wrong data. I was actually looking for: ")}>You identified the wrong data</Button>
      <br/>
      <Button onClick={() => setInputText("You misunderstood my question. I was actually asking about: ")}>You misunderstood my question</Button>
      <br/>
      <Button onClick={() => setInputText("I want to ask something different: ")}>I want to ask something different</Button>
    </>
  )
}