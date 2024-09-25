// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { useDispatch } from "react-redux";

import { incrementChatIdCounter } from "redux/chatHistorySlice";
import { useAppSelector } from "redux/store";

//This hook returns a function that returns the current chat id counter
//and increments the counter for the next usage
export function useGetNewChatId() {
  const dispatch = useDispatch()
  const chatIdCounter = useAppSelector(state => state.chatHistory.chatIdCounter)

  return () => {
    dispatch(incrementChatIdCounter())
    return chatIdCounter
  }
}