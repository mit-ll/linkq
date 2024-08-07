// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import OpenAI, { ClientOptions } from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

export type ChatMessageType = ChatCompletionMessageParam & {
  content:string
  chatId: number
  name: string
}
export type ChatHistoryType = ChatMessageType[]

//this is a basic message type that will be extended by the ChatGPTAPI class
//to include chatId and name
type BasicMessageType = {
  content: ChatMessageType["content"]
  role: ChatMessageType["role"]
}


//this typing is used to omit the "messages" field from OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type OpenAICreateOptionsType = Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'messages'>

export type ChatGPTAPIConstructorArgsType = ClientOptions & {
  chatId: number,
  openAICreateOptions?: OpenAICreateOptionsType,
  addMessagesCallback?:(messages: ChatHistoryType) => any,
  systemMessage?: string
}

/**
 * This is our custom ChatGPTAPI class
 * It manages message history, and lets you send new messages
 * 
 * We originally used this package on NPM https://www.npmjs.com/package/chatgpt
 * but it doesn't let you send additional system messages, which is annoying
 */
export class ChatGPTAPI {
  chatId: number
  openAI: OpenAI //the openai instance
  openAICreateOptions: OpenAICreateOptionsType
  messages: ChatHistoryType = [] //message history
  addMessagesCallback?: (messages: ChatHistoryType) => any //an optional callback function used to reactively update state

  constructor({
    chatId=0,
    addMessagesCallback,
    openAICreateOptions={ model: 'gpt-4-turbo-preview' }, 
    systemMessage, 
    ...options //the rest of ClientOptions
  }: ChatGPTAPIConstructorArgsType) {
    this.chatId = chatId
    this.openAI = new OpenAI(options) //initialize a new OpenAI class instance
    this.openAICreateOptions = openAICreateOptions
    
    this.addMessagesCallback = addMessagesCallback //save the callback function

    //if we should have an initial system message
    if(systemMessage) {
      this.messages.push({ //add the system message to the message history
        role: "system",
        content: systemMessage,
        chatId: this.chatId,
        name: "system",
      })
      this.addMessagesCallback?.(this.messages)
    }
  }

  /**
   * This function sends your new messages to ChatGPT while maintaining the full message history
   * @param messages  the array of new messages to send to the LLM
   * @returns         the LLM's response content as a string
   */
  async sendMessages(basicMessages: BasicMessageType[]) {
    const addMessages:ChatMessageType[] = basicMessages.map(p => {
      //@ts-ignore TODO figure this out
      const message: ChatMessageType = {
        ...p,
        chatId: this.chatId,
        name: p.role==="assistant" ? this.openAICreateOptions.model : p.role,
      }
      return message
    })

    //OpenAI's LLMs don't actually manage any state.
    //Instead, you need to send it the entire message history
    //if you want to maintain continuity in your conversation.
    this.messages.push(...addMessages) //push the new messages
    this.addMessagesCallback?.(addMessages)

    let chatCompletion: OpenAI.Chat.Completions.ChatCompletion
    try {
      //request a response from the LLM
      chatCompletion = await this.openAI.chat.completions.create({
        ...this.openAICreateOptions,
        messages: this.messages, //send the entire message history
      });
    }
    catch(err) {
      //if there was an error sending the message, check if there is a network issue
      window.open("https://api.openai.com/v1/chat/completions", '_blank')?.focus()
      throw err
    }

    //get the message content
    const openAiResponseMessage = chatCompletion.choices[0].message
    if(openAiResponseMessage.content === null) {
      throw new Error("ChatGPT returned null content")
    }

    //add the LLM's response to the message history
    const responseMessage = {
      ...openAiResponseMessage,
      content: openAiResponseMessage.content, //this makes typescript happy
      chatId: this.chatId,
      name: this.openAICreateOptions.model,
    }
    this.messages.push(responseMessage)
    this.addMessagesCallback?.([responseMessage])

    //return the LLM's message
    return responseMessage
  }
}
