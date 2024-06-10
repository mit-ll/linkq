// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { createContext, useContext, useMemo } from "react"
import { useAppDispatch } from "../redux/store"
import { ChatGPTAPI, ChatHistoryType } from "../utils/ChatGPTAPI"
import { setFullChatHistory } from "../redux/chatHistorySlice"

const INITIAL_SYSTEM_MESSAGE = `You are a helpful chat assistant. This system will give you access to data in the WikiData Knowledge Graph, that contains encyclopedic data similar to Wikipedia, but in knowledge graph format using the RDF framework. 

If users ask questions that can be answered via WikiData, your job is not to directly answer their questions, but instead to help them write a SPARQL query to find that data. You can ask the user to clarify their questions if the questions are vague, open-ended, or subjective in nature. 

If you ever need to suggest data to the user, you should only provide recommendations that are directly accessible from Wikidata. Do not ask the user if they would like to proceed with generating the corresponding query unless absolutely necessary.

When you are ready to start building a query, respond with 'BUILD QUERY'. The system will walk you through a guided workflow to get the necessary entity and property IDs from WikiData.

Current date: ${new Date().toDateString()}.`

//this defines a context so we can access the chat gpt api from anywhere in the app
const ChatGPTAPIContext = createContext<ChatGPTAPI>(new ChatGPTAPI({apiKey:"",dangerouslyAllowBrowser:true}))

//this defines the context provider that should be placed towards the top of the app to make the chat gpt api instance available for the whole app
export function ChatGPTAPIProvider({children}:{children: React.ReactNode}) {
  const dispatch = useAppDispatch()
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY.trim()
  
  //memoize the chat gpt api instance so we keep using the same instance
  const chatGPT = useMemo(() => {
    return new ChatGPTAPI({
      apiKey,
      dangerouslyAllowBrowser: true, //this is necessary for using a browser
      updateMessagesCallback: (messages:ChatHistoryType) => dispatch(setFullChatHistory(messages)),
      systemMessage: INITIAL_SYSTEM_MESSAGE,
    })
  }, [])

  if(!apiKey) {
    return (
      <div style={{color: "white", backgroundColor: "#333", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
        <p>You need to configure the <code>VITE_OPENAI_API_KEY</code> environment variable in your <code>.env.local</code> file.</p>
      </div>
    )
  }

  return (
    <ChatGPTAPIContext.Provider value={chatGPT}>
      {children}
    </ChatGPTAPIContext.Provider>
  )
}

//this is the hook lets any child of the provider access chat gpt
export function useChatGPT() {
  return useContext(ChatGPTAPIContext);
}