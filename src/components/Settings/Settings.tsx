import { useEffect, useState } from "react"

import { useQuery } from "@tanstack/react-query"

import { ActionIcon, Checkbox, Modal, Select, TextInput } from "@mantine/core"
import { IconSettings } from "@tabler/icons-react"

import { ErrorMessage } from "components/ErrorMessage"

import { useMainChatAPI } from "hooks/useMainChatAPI"

import { setApiKey, setBaseURL, setModel } from "redux/settingsSlice"
import { toggleShowFullChatHistory } from "redux/chatHistorySlice"
import { useAppDispatch, useAppSelector } from "redux/store"

import styles from "./Settings.module.scss"

export function Settings() {
  const dispatch = useAppDispatch()

  const apiKey = useAppSelector(state => state.settings.apiKey)
  const baseURL = useAppSelector(state => state.settings.baseURL)
  const model = useAppSelector(state => state.settings.model)
  const showFullChatHistory = useAppSelector(state => state.chatHistory.showFullChatHistory)

  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false)
  const closeSettingsModal = () => setShowSettingsModal(false)
  
  const chatAPI = useMainChatAPI()

  const {data, error, isLoading} = useQuery({
    queryKey: [baseURL],
    queryFn: async () => {
      //https://platform.openai.com/docs/api-reference/models/list
      const list = await chatAPI.openAI.models.list()
      return list.data.map(({id}) => id).sort()
    },
  })
  useEffect(() => {
    //if the model chosen is no longer in the list
    if(data && !data.includes(model) && data[0]) {
      //auto-pick the first option
      dispatch(setModel(data[0]))
    }
  }, [data])

  return (
    <>
      <Modal opened={showSettingsModal} onClose={closeSettingsModal} title="Settings">
        <Checkbox
          checked={showFullChatHistory}
          onChange={() => dispatch(toggleShowFullChatHistory())}
          label="Show full chat history"
        />
        <hr/>
        <TextInput
          label="LLM Base URL"
          description="Base URL to make chat completion requests to"
          placeholder="Ex: https://api.openai.com/v1/"
          value={baseURL}
          onChange={(event) => {
            //IDK if this is necessary, but we don't want to accidentally send an API key to the wrong baseURL
            dispatch(setApiKey(""))
            dispatch(setBaseURL(event.currentTarget.value))
          }}
        />
        <br/>
        <TextInput
          label="API Key"
          type='password'
          value={apiKey}
          onChange={(event) => dispatch(setApiKey(event.currentTarget.value))}
        />
        <br/>
        {isLoading ? <p>Loading models...</p> : (
          <>
            <Select
              label="Model"
              placeholder="Choose your model"
              data={data}
              value={model}
              onChange={(value) => value && dispatch(setModel(value))}
            />
            {error && <ErrorMessage>{error.message}</ErrorMessage>}
          </>
        )}
        
      </Modal>

      <ActionIcon className={styles["settings-button"]} size="sm" variant="filled" aria-label="Show Settings" onClick={() => setShowSettingsModal(true)} style={{position: "absolute"}}>
        <IconSettings/>
      </ActionIcon>
    </>
  )
}