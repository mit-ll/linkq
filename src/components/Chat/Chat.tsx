// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { sparql } from '@codemirror/legacy-modes/mode/sparql';
import { Badge, Button, Modal, TextInput } from "@mantine/core";
import { useEffect, useRef, useState } from "react";
import { IconCaretRight, IconZoomCode } from '@tabler/icons-react';

import { ErrorMessage } from 'components/ErrorMessage';
import { LLMWarning } from 'components/LLMWarning';
import { QUERY_EDITOR_DOM_ID } from 'components/QueryEditor/QueryEditor';
import { Settings } from 'components/Settings/Settings';

import { useMainChatAPI } from 'hooks/useMainChatAPI';
import { useRunQuery } from 'hooks/useRunQuery';

import { setQueryValue } from 'redux/queryValueSlice';
import { useAppDispatch, useAppSelector } from 'redux/store';

import { tryParsingOutQuery } from 'utils/tryParsingOutQuery';

import styles from "./Chat.module.scss"
import { LinkQChatMessageType } from 'redux/chatHistorySlice';


export function Chat() {
  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const simpleChatHistory = useAppSelector(state => state.chatHistory.simpleChatHistory)

  const chatHistoryDisplay = useAppSelector(state => state.chatHistory.chatHistoryDisplay)

  //based on chatHistoryDisplay, decide which chat history to display to the user
  const chatHistory = chatHistoryDisplay==="full" ? fullChatHistory : simpleChatHistory

  const chatScrollBottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if(chatScrollBottomRef.current) {
      chatScrollBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory.length])


  // const [inputText, setInputText] = useState<string>("Who won the 2023 Formula One Championship?"); // prefill the chat
  const [inputText, setInputText] = useState<string>("");

  const {
    useMutationOutput: {
      error, mutate:submitChat, reset
    }
  } = useMainChatAPI()

  return (
    <div id={styles["chat-container"]}>
      <Settings/>

      <div id={styles["chat-scroll-container"]}>
        <br/>
        {chatHistoryDisplay==="condensed" ? (
          condenseChat(fullChatHistory).map((c,i) => (
            <RenderCondensedMessage key={i} condensedChat={c} setInputText={setInputText}/>
          ))
        ) : (
          chatHistory.map((c, i) => (
            <RenderChatMessage key={i} chat={c} setInputText={setInputText}/>
          ))
        )}
        <div ref={chatScrollBottomRef}/>
      </div>

      {error && (
        <Modal opened={true} onClose={reset} title="LLM Error">
          <ErrorMessage>{error.message}</ErrorMessage>
        </Modal>
      )}
      {/* {isPending && <p className={styles.loading}>Loading...</p>} */}
      <LinkQDetailedBadgeStatus/>

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

function RenderCondensedMessage({
  condensedChat,
  setInputText,
}:{
  condensedChat:CondensedChatType,
  setInputText: React.Dispatch<React.SetStateAction<string>>,
}) {
  const [showDetails, setShowDetails] = useState<boolean>(false)

  const firstChatMessage = condensedChat[0]
  return (
    <div className={styles["condensed-chat"]}>
      {firstChatMessage.stage && (
        <>
          <p><b>{firstChatMessage.stage.mainStage}</b></p>
          <p>{firstChatMessage.stage.subStage}</p>
          {firstChatMessage.stage.description && <p>{firstChatMessage.stage.description}</p>}
        </>
      )}
      <div>
        <a aria-label="Show Details" onClick={() => setShowDetails(!showDetails)}>
        {showDetails ? "Hide Details" : "Show Full Details"}
      </a>
      </div>
      
      {showDetails && (
        <div>
          <br/>
          <div className={styles["show-all-content-container"]}>
            {condensedChat.map((c, i) => (
              <RenderChatMessage key={i} chat={c} setInputText={setInputText}/>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RenderChatMessage({
  chat,
  setInputText,
}:{
  chat:LinkQChatMessageType,
  setInputText: React.Dispatch<React.SetStateAction<string>>,
}) {
  const chatHistoryDisplay = useAppSelector(state => state.chatHistory.chatHistoryDisplay)

  return (
    <div className={`${styles["chat-row"]} ${styles[chat.role]}`}>
      <div className={styles["chat-justify"]}>
        {chatHistoryDisplay==="full"||chatHistoryDisplay==="condensed" && <p>{chat.name}, chat #{chat.chatId}</p>}
        {
          chat.role === "assistant" 
          ? <RenderLLMResponse text={chat.content} setInputText={setInputText}/>
          : <pre className={styles.chat}>{chat.content}</pre> 
        }
      </div>
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
          <Button onClick={() => {
            dispatch(setQueryValue(query))
            document.getElementById(QUERY_EDITOR_DOM_ID)?.scrollIntoView({ behavior: 'smooth' })
          }} variant="outline" color="white">Copy query over to examine <IconZoomCode/></Button>
          <br/>
          <Button onClick={() => {
            dispatch(setQueryValue(query))
            document.getElementById(QUERY_EDITOR_DOM_ID)?.scrollIntoView({ behavior: 'smooth' })
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



function LinkQDetailedBadgeStatus() {
  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const { runQueryIsPending, summarizeResultsIsPending } = useRunQuery()
  const {
    useMutationOutput: {
      isPending: chatIsPending,
    }
  } = useMainChatAPI()

  let color = "blue"
  let displayMessage = "Waiting for User Input"
  const stage = fullChatHistory.at(-1)?.stage
  if(chatIsPending) {
    color = "yellow"
    displayMessage = stage?.description || stage?.subStage || ""
  }
  else if(runQueryIsPending) {
    color = "yellow"
    displayMessage = "Executing Query"
  }
  else if(summarizeResultsIsPending) {
    color = "yellow"
    displayMessage = "Summarizing Results"
  }

  if(displayMessage.length > 60) {
    displayMessage = displayMessage.slice(0,60) + "..."
  }

  return (
    <div className={styles["chat-status-badge"]}>
      <Badge color={color}>{displayMessage}</Badge>
    </div>
  )
}

//the condensed chat type is just one or two grouped chat messages
type CondensedChatType = LinkQChatMessageType[]

/**
 * Converts the full chat history into the condensed/grouped view for better traceability.
 * If two neighboring chat messages have the same stage details, they are condensed/grouped together
 * @param fullChatHistory 
 * @returns               array of condensed chat types
 */
function condenseChat(fullChatHistory: LinkQChatMessageType[]):CondensedChatType[] {
  const condensedChat:CondensedChatType[] = [];

  //loop through the full chat history
  for(let i=0; i<fullChatHistory.length; ++i) {
    const currentChatMessage = fullChatHistory[i]
    const nextChatMessage = fullChatHistory.at(i + 1)
    if(i === 0) { //HARDCODED ignore the initial system prompt
      continue;
    }
    //else if the current and next chat message have the same stage details
    else if(nextChatMessage && messagesHaveMatchingStages(currentChatMessage,nextChatMessage)) {
      //condense these two messages together
      condensedChat.push([
        currentChatMessage,
        nextChatMessage
      ]);
      ++i; //skip over this next message in the subsequent iteration
    }
    //else this chat message can stand alone by itself
    else if(currentChatMessage.stage) {
      condensedChat.push([ currentChatMessage ])
    }
    //else the chat message doesn't have stage info
  }

  return condensedChat
}

/**
 * Checks whether two messages have the same main and sub stage
 * @param chatMessage1 
 * @param chatMessage2 
 * @returns             true if the main and sub stages match (including in the stage is undefined), else false
 */
function messagesHaveMatchingStages(
  chatMessage1: LinkQChatMessageType,
  chatMessage2: LinkQChatMessageType,
) {
  return chatMessage1.stage?.mainStage===chatMessage2.stage?.mainStage
  || chatMessage1.stage?.subStage===chatMessage2.stage?.subStage
}
