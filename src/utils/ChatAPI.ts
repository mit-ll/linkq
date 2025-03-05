// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import OpenAI, { ClientOptions } from "openai"
import { ChatCompletionAssistantMessageParam, ChatCompletionMessageParam } from "openai/resources/index.mjs"
import { LinkQChatMessageType } from "redux/chatHistorySlice"
import { StageType } from "redux/stageSlice"

//this typing is used to omit the "messages" field from OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type OpenAICreateOptionsType = Omit<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming, 'messages'>

export type ChatAPIConstructorArgsType = ClientOptions & {
  chatCompletionCreateOptions?: OpenAICreateOptionsType,
  chatId: number,
  systemMessage?: string,
}

export type IntermediateChatMessageType = ChatCompletionMessageParam & {
  stage?: StageType,
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
  chatCompletionCreateOptions: OpenAICreateOptionsType
  chatId: number
  messages: ChatCompletionMessageParam[] = [] //message history
  openAI: OpenAI //the openai instance

  constructor({
    chatCompletionCreateOptions={ model: 'gpt-4-turbo-preview' }, 
    chatId,
    systemMessage,
    ...options //the rest of ClientOptions
  }: ChatAPIConstructorArgsType) {
    this.openAI = new OpenAI(options) //initialize a new OpenAI class instance
    this.chatCompletionCreateOptions = chatCompletionCreateOptions
    this.chatId = chatId
    
    if(systemMessage) {
      this.messages.push({ //add the system message to the message history
        content: systemMessage,
        role: "system",
      })
    }
  }

  public reset(chatId:number) {
    this.chatId = chatId
    this.messages = []
  }

  /**
   * This function is used to add LinkQ-related context to the message
   * @param message 
   * @returns       LinkQChatMessageType
   */
  public transformMessage(message: IntermediateChatMessageType):LinkQChatMessageType {
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
  public async sendMessages(messages: ChatCompletionMessageParam[]):Promise<SendMessagesReturnType> {
    //OpenAI's LLMs don't actually manage any state.
    //Instead, you need to send it the entire message history
    //if you want to maintain continuity in your conversation.
    this.messages.push(...messages) //push the new messages

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
    const responseMessage:LinkQChatMessageType = {
      ...openAiResponseMessage,
      chatId: this.chatId,
      content: openAiResponseMessage.content, //this makes typescript happy
      name: this.chatCompletionCreateOptions.model.replace(".",""), //OpenAI doesn't like periods in their names
    }
    this.messages.push(responseMessage)

    //return the LLM's message
    return responseMessage
  }
}

export type SendMessagesReturnType = ChatCompletionAssistantMessageParam & {
  content: string;
  chatId: number;
  name: string;
  stage?: StageType;
}
