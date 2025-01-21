import { createContext, useMemo } from "react";
import { ChatAPI } from "utils/ChatAPI";
import { useMakeChatAPIInstance } from "./useMakeChatAPIInstance";
import { useAppSelector } from "redux/store";

export const MainChatAPIContext = createContext<ChatAPI>(new ChatAPI({
  apiKey:"",
  chatId: 0,
  dangerouslyAllowBrowser: true,
}));

export function MainChatAPIProvider({
  children,
}:{
  children: React.ReactNode,
}) {
  const baseURL = useAppSelector(state => state.settings.baseURL)
  const model = useAppSelector(state => state.settings.model)

  const makeChatGPTAPIInstance = useMakeChatAPIInstance()
  const chatAPI = useMemo(() => {
    return makeChatGPTAPIInstance({chatId: 0})
  },[])
  chatAPI.openAI.baseURL = baseURL
  chatAPI.chatCompletionCreateOptions.model = model

  return (
    <MainChatAPIContext.Provider value={chatAPI}>
      {children}
    </MainChatAPIContext.Provider>
  )
}