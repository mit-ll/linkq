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

//this typing is used to omit the "messages" field from OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type OpenAICreateOptionsType = Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'messages'>

export type ChatGPTAPIConstructorArgsType = ClientOptions & {
  addMessagesCallback?:(messages: ChatHistoryType) => any,
  chatCompletionCreateOptions?: OpenAICreateOptionsType,
  chatId: number,
}

/**
 * This is our custom ChatAPI class
 * It manages message history, and lets you send new messages
 * It uses the OpenAI API protocol which is supposed by many open-source LLM server implementations
 * 
 * We originally used this package on NPM https://www.npmjs.com/package/chatgpt
 * but it doesn't let you send additional system messages, which is annoying
 */
export class ChatAPI {
  addMessagesCallback?: (messages: ChatHistoryType) => any //an optional callback function used to reactively update state
  chatCompletionCreateOptions: OpenAICreateOptionsType
  chatId: number
  messages: ChatCompletionMessageParam[] = [] //message history
  openAI: OpenAI //the openai instance

  constructor({
    addMessagesCallback,
    chatCompletionCreateOptions={ model: 'gpt-4-turbo-preview' }, 
    chatId,
    ...options //the rest of ClientOptions
  }: ChatGPTAPIConstructorArgsType) {
    this.openAI = new OpenAI(options) //initialize a new OpenAI class instance
    this.chatCompletionCreateOptions = chatCompletionCreateOptions
    this.chatId = chatId
    
    this.addMessagesCallback = addMessagesCallback //save the callback function
  }

  /**
   * This function sends your new messages to ChatGPT while maintaining the full message history
   * @param messages  the array of messages to send to the LLM
   * @returns         the LLM's response content as a string
   */
  async sendMessages(addMessages: ChatCompletionMessageParam[]) {
    //OpenAI's LLMs don't actually manage any state.
    //Instead, you need to send it the entire message history
    //if you want to maintain continuity in your conversation.
    this.messages.push(...addMessages) //push the new messages
    this.addMessagesCallback?.(
      addMessages.map(a => ({
        ...a,
        chatId: this.chatId,
        content: a.content as string,
        name: a.role==="assistant" ? this.chatCompletionCreateOptions.model : a.role,
      }))
    )

    let chatCompletion: OpenAI.Chat.Completions.ChatCompletion
    try {
      //request a response from the LLM
      chatCompletion = await this.openAI.chat.completions.create({
        ...this.chatCompletionCreateOptions,
        messages: this.messages, //send the entire message history
      });
    }
    catch(err) {
      console.error(err)
      //if there was an error sending the message, check if there is a network issue
      typeof window!=="undefined" && window.open(this.openAI.baseURL+"/chat/completions", '_blank')?.focus()
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
      chatId: this.chatId,
      content: openAiResponseMessage.content, //this makes typescript happy
      name: this.chatCompletionCreateOptions.model,
    }
    this.messages.push(responseMessage)
    this.addMessagesCallback?.([responseMessage])

    //return the LLM's message
    return responseMessage
  }
}
