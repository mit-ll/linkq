// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { ActionIcon, Button, Checkbox, Modal, TextInput } from "@mantine/core";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Chat.module.scss"
import { useMutation } from "@tanstack/react-query";
import { IconCaretRight, IconSettings, IconZoomCode } from '@tabler/icons-react';
import { ErrorMessage } from '../ErrorMessage';
import { useRunQuery } from '../../hooks/useRunQuery';
import { useAppDispatch, useAppSelector } from '../../redux/store';

import { setQueryValue } from '../../redux/queryValueSlice';
import { queryBuildingWorkflow } from '../../utils/queryBuildingWorkflow';
import { useMakeChatGPTAPIInstance } from '../../hooks/useMakeChatGPTAPIInstance';
import { addMessageToSimpleChatHistory, toggleShowFullChatHistory } from '../../redux/chatHistorySlice';

export const INITIAL_SYSTEM_MESSAGE = `You are a helpful chat assistant. This system will give you access to data in the WikiData Knowledge Graph, that contains encyclopedic data similar to Wikipedia, but in knowledge graph format using the RDF framework. 

If users ask questions that can be answered via WikiData, your job is not to directly answer their questions, but instead to help them write a SPARQL query to find that data. You can ask the user to clarify their questions if the questions are vague, open-ended, or subjective in nature. 

If you ever need to suggest data to the user, you should only provide recommendations that are directly accessible from Wikidata. Do not ask the user if they would like to proceed with generating the corresponding query unless absolutely necessary.

When you are ready to start building a query, respond with 'BUILD QUERY'. The system will walk you through a guided workflow to get the necessary entity and property IDs from WikiData.

Current date: ${new Date().toDateString()}.`

export function Chat() {
  const dispatch = useAppDispatch()

  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const simpleChatHistory = useAppSelector(state => state.chatHistory.simpleChatHistory)

  const showFullChatHistory = useAppSelector(state => state.chatHistory.showFullChatHistory)

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

  const makeChatGPTAPIInstance = useMakeChatGPTAPIInstance()
  const chatGPT = useMemo(() => {
    return makeChatGPTAPIInstance({
      chatId: 0,
      systemMessage: INITIAL_SYSTEM_MESSAGE,
    })
  },[])

  const {error, isPending, mutate:submitChat, reset} = useMutation({
    mutationKey: ['submit-chat'],
    /**
     * This function handles what happens when the user submits a chat message
     * It sends the message to the LLM and determines whether to go down the query-building workflow
     * @param text  the user's message
     */
    mutationFn: async (text:string) => {
      const userMessage = { content: text, role: "user" } as const
      
      //add the user's message to the simple chat history
      dispatch(addMessageToSimpleChatHistory({
        ...userMessage,
        chatId: chatGPT.chatId,
        name: "user",
      }))

      //get the LLM to response
      let llmResponse = await chatGPT.sendMessages([ userMessage ])
  
      //determine what to do with the LLM's response
      if(llmResponse.content.includes("BUILD QUERY")) {
        //if we want to use the query building workflow
        llmResponse = await queryBuildingWorkflow(chatGPT, text) 
      }
      //else converse with the assistant like normal

      //add the LLM's final response to the simple chat
      dispatch(addMessageToSimpleChatHistory(llmResponse))

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
            <div key={i} className={`${styles["chat-row"]} ${styles[c.role]}`}>
              <div className={styles["chat-justify"]}>
                {showFullChatHistory && <p>{c.name}, chat #{c.chatId}</p>}
                {
                  c.role === "assistant" 
                  ? <RenderLLMResponse text={c.content} setInputText={setInputText}/>
                  : <pre className={styles.chat}>{c.content}</pre> 
                }
              </div>
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