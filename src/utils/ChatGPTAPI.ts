// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import OpenAI, { ClientOptions } from "openai"
import { ChatCompletionMessageParam } from "openai/resources/index.mjs"

export type ChatMessageType = ChatCompletionMessageParam & {content:string}
export type ChatHistoryType = ChatMessageType[]


/**
 * This is our custom ChatGPTAPI class
 * It manages message history, and lets you send new messages
 * 
 * We originally used this package on NPM https://www.npmjs.com/package/chatgpt
 * but it doesn't let you send additional system messages, which is annoying
 */
export class ChatGPTAPI {
  protected openAI: OpenAI //the openai instance
  protected messages: ChatHistoryType = [] //message history
  protected updateMessagesCallback?: (messages: ChatHistoryType) => any //an optional callback function used to reactively update state

  constructor({
    updateMessagesCallback, 
    systemMessage, 
    ...options //the rest of ClientOptions
  }: ClientOptions & {
    updateMessagesCallback?:(messages: ChatHistoryType) => any,
    systemMessage?: string
  }) {
    this.openAI = new OpenAI(options) //initialize a new OpenAI class instance
    
    this.updateMessagesCallback = updateMessagesCallback //save the callback function

    //if we should have an initial system message
    if(systemMessage) {
      this.messages.push({ //add the system message to the message history
        role: "system",
        content: systemMessage,
      })
      this.updateMessagesCallback?.([...this.messages])
    }
  }

  /**
   * This function sends your new messages to ChatGPT while maintaining the full message history
   * @param messages  the array of new messages to send to the LLM
   * @returns         the LLM's response content as a string
   */
  async sendMessages(messages: ChatMessageType[]) {
    //OpenAI's LLMs don't actually manage any state.
    //Instead, you need to send it the entire message history
    //if you want to maintain continuity in your conversation.
    this.messages.push(...messages) //push the new messages
    this.updateMessagesCallback?.([...this.messages])

    let chatCompletion: OpenAI.Chat.Completions.ChatCompletion
    try {
      //request a response from the LLM
      chatCompletion = await this.openAI.chat.completions.create({
        messages: this.messages, //send the entire message history
        model: 'gpt-4-turbo-preview', //TODO eventually this should be a toggleable parameter
        
        //there are a bunch of other optional completion API arguments
        //https://platform.openai.com/docs/api-reference/chat/create
      });
    }
    catch(err) {
      //if there was an error sending the message, check if there is a network issue
      window.open("https://api.openai.com/v1/chat/completions", '_blank')?.focus()
      throw err
    }

    //get the message content
    const message = chatCompletion.choices[0].message
    if(message.content === null) {
      throw new Error("ChatGPT returned null content")
    }

    //add the LLM's response to the message history
    this.messages.push(message as ChatMessageType)
    this.updateMessagesCallback?.([...this.messages])

    //return the LLM's message content
    return message.content
  }
}
