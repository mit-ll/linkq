// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { Badge, Button, Modal, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { IconCaretRight, IconZoomCode } from '@tabler/icons-react';

import { ErrorMessage } from 'components/ErrorMessage';
import { LLMWarning } from 'components/LLMWarning';
import { Settings } from 'components/Settings/Settings';

import { useMainChatAPI } from 'hooks/useMainChatAPI';
import { useRunQuery } from 'hooks/useRunQuery';

import { addMessageToSimpleChatHistory } from 'redux/chatHistorySlice';
import { setQueryValue } from 'redux/queryValueSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';

import { handleUserChat } from 'utils/handleUserChat';
import { tryParsingOutQuery } from 'utils/tryParsingOutQuery';

import styles from "./Chat.module.scss"


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


  // const [inputText, setInputText] = useState<string>("Who won the 2023 Formula One Championship?"); // prefill the chat
  const [inputText, setInputText] = useState<string>("");

  const chatAPI = useMainChatAPI()

  const {error, isPending, mutate:submitChat, reset} = useMutation({
    mutationKey: ['submit-chat'],
    /**
     * This function handles what happens when the user submits a chat message
     * It sends the message to the LLM and determines whether to go down the query-building workflow
     * @param text  the user's message
     */
    mutationFn: async (text:string) => {
      //add the user's message to the simple chat history
      dispatch(addMessageToSimpleChatHistory({
        chatId: chatAPI.chatId,
        content: text, 
        name: "user",
        role: "user",
        stage: "Question Refinement",
      }))

      const llmResponse = await handleUserChat(text, chatAPI)

      //add the LLM's final response to the simple chat
      dispatch(addMessageToSimpleChatHistory(llmResponse))
    },
    onError(err) {
      console.error(err)
    }
  })

  return (
    <div id={styles["chat-container"]}>
      <Settings/>

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
      {/* {isPending && <p className={styles.loading}>Loading...</p>} */}
      <LinkQStatus chatIsPending={isPending}/>

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
        <LLMWarning>
          <p>This was generated by an LLM that can make mistakes.</p>
        </LLMWarning>
        <br/>

        <RenderSparqlQuery
          pre={parsedQuery.pre}
          query={parsedQuery.query.trim()}
          post={parsedQuery.post}

          setInputText={setInputText}
        />
      </div>
    )
  }

  return (
    <div className={styles.chat}>
      <LLMWarning>
        <p>This was generated by an LLM that can make mistakes.</p>
      </LLMWarning>
      
      <pre>{text}</pre>
    </div>
  )
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



function LinkQStatus({
  chatIsPending,
}:{
  chatIsPending: boolean,
}) {
  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const { runQueryIsPending, summarizeResultsIsPending } = useRunQuery()

  let color = "blue"
  let displayMessage = "Waiting for User Input"
  const stage = fullChatHistory.at(-1)?.stage
  if(chatIsPending) {
    color = "yellow"
    displayMessage = stage || ""
  }
  else if(runQueryIsPending) {
    color = "yellow"
    displayMessage = "Executing Query"
  }
  else if(summarizeResultsIsPending) {
    color = "yellow"
    displayMessage = "Query Summarization"
  }

  return (
    <p className={styles.loading}><Badge color={color}>{displayMessage}</Badge></p>
  )
}