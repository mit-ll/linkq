// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { INITIAL_SYSTEM_MESSAGE } from "./knowledgeBase/prompts"
import { ChatAPI } from "./ChatAPI"

//this function is useful for running a static chat step by step in the browser console
export async function staticChat() {
  const chatAPI = new ChatAPI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY?.trim(),
    chatId: 0,
    dangerouslyAllowBrowser: true, //this is necessary for using a browser
    addMessagesCallback: () => {},
  })
  
  const response = await chatAPI.sendMessages([
    {
      role: "system",
      content: INITIAL_SYSTEM_MESSAGE,
    },
    {
      role: "user",
      content: "Can you tell me about interesting movies?",
      stage: {
        mainStage: "Question Refinement",
        subStage: "User asks question",
        description: "Can you tell me about interesting movies?",
      },
    },
  ])
  
  console.log("response",response)
}