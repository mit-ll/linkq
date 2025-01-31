// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import OpenAI, { ClientOptions } from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { LinkQChatMessageType } from "redux/chatHistorySlice"

//this typing is used to omit the "messages" field from OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type OpenAICreateOptionsType = Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'messages'>

export type ChatAPIConstructorArgsType = ClientOptions & {
  addMessagesCallback?:(messages: LinkQChatMessageType[]) => any,
  chatCompletionCreateOptions?: OpenAICreateOptionsType,
  chatId: number,
  systemMessage?: string,
}

type IntermediateChatMessageType = ChatCompletionMessageParam & {
  stage: string,
}

/**
 * This is our custom ChatAPI class
 * It manages message history, and lets you send new messages
 * It uses the OpenAI API protocol which is supported by many open-source LLM server implementations
 * 
 * We originally used this package on NPM https://www.npmjs.com/package/chatgpt
 * but it doesn't let you send additional system messages, which is annoying
 */
export class ChatAPI {
  addMessagesCallback?: (messages: LinkQChatMessageType[]) => any //an optional callback function used to reactively update state
  chatCompletionCreateOptions: OpenAICreateOptionsType
  chatId: number
  messages: LinkQChatMessageType[] = [] //message history
  openAI: OpenAI //the openai instance

  constructor({
    addMessagesCallback,
    chatCompletionCreateOptions={ model: 'gpt-4-turbo-preview' }, 
    chatId,
    systemMessage,
    ...options //the rest of ClientOptions
  }: ChatAPIConstructorArgsType) {
    this.openAI = new OpenAI(options) //initialize a new OpenAI class instance
    this.chatCompletionCreateOptions = chatCompletionCreateOptions
    this.chatId = chatId
    
    this.addMessagesCallback = addMessagesCallback //save the callback function

    if(systemMessage) {
      this.messages.push(this.transformMessage({ //add the system message to the message history
        content: systemMessage,
        role: "system",
        stage: "Initial System Message",
      }))
      this.addMessagesCallback?.(this.messages)
    }
  }

  public reset(chatId:number) {
    this.chatId = chatId
    this.messages = []
  }

  private transformMessage(message: IntermediateChatMessageType):LinkQChatMessageType {
    return ({
      ...message,
      chatId: this.chatId,
      content: message.content as string,
      name: message.role==="assistant" ? this.chatCompletionCreateOptions.model : message.role,
    })
  }

  /**
   * This function sends your new messages to the LLM while maintaining the full message history
   * @param messages  the array of messages to send to the LLM
   * @returns         the LLM's response content as a string
   */
  public async sendMessages(addMessages: IntermediateChatMessageType[]) {
    //OpenAI's LLMs don't actually manage any state.
    //Instead, you need to send it the entire message history
    //if you want to maintain continuity in your conversation.
    const messages = addMessages.map((m) => this.transformMessage(m))
    this.messages.push(...messages) //push the new messages
    this.addMessagesCallback?.(messages)

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
      throw new Error("LLM returned null content")
    }

    //add the LLM's response to the message history
    const mostRecentMessage = this.messages.at(-1)
    const responseMessage:LinkQChatMessageType = {
      ...openAiResponseMessage,
      chatId: this.chatId,
      content: openAiResponseMessage.content, //this makes typescript happy
      name: this.chatCompletionCreateOptions.model,
      stage: "Unknown", //TODO this isn't accurate
    }
    this.messages.push(responseMessage)

    //return the LLM's message
    return responseMessage
  }
}
