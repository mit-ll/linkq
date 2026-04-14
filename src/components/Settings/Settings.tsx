import { useEffect } from "react"

import { useQuery } from "@tanstack/react-query"

import { ActionIcon, Checkbox, Modal, Select, TextInput } from "@mantine/core"
import { IconSettings } from "@tabler/icons-react"

import { ErrorMessage } from "components/ErrorMessage"

import { useMainChatAPI } from "hooks/useMainChatAPI"

import { setApiKey, setBaseURL, setModel, togglePersistAPIKey, toggleShowSettings, toggleShowStateDiagramStatus } from "redux/settingsSlice"
import { CHAT_HISTORY_DISPLAY_OPTIONS, ChatHistoryDisplayType, setChatHistoryDisplay } from "redux/chatHistorySlice"
import { useAppDispatch, useAppSelector } from "redux/store"

import styles from "./Settings.module.scss"

export function Settings() {
  const dispatch = useAppDispatch()

  const {
    apiKey, baseURL, model,
    persistAPIKey,
    showSettings, showStateDiagramStatus
  } = useAppSelector(state => state.settings)
  const chatHistoryDisplay = useAppSelector(state => state.chatHistory.chatHistoryDisplay)

  const { chatAPI } = useMainChatAPI()

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

  //if the user loads LinkQ pointing to OpenAI but without an API key configured, immediately show the settings
  useEffect(() => {
    if(showSettings===false && apiKey==="" && baseURL==="https://api.openai.com/v1/") {
      dispatch(toggleShowSettings())
    }
  }, [])

  return (
    <>
      <Modal opened={showSettings} onClose={() => dispatch(toggleShowSettings())} title="Settings">
        <Select
          label="Chat History View"
          placeholder="Set chat history complexity"
          data={Object.entries(CHAT_HISTORY_DISPLAY_OPTIONS).map(([value,label]) => ({
            value,label
          }))}
          value={chatHistoryDisplay}
          onChange={(value) => value && dispatch(setChatHistoryDisplay(
            value as ChatHistoryDisplayType
          ))}
        />
        <br/>
        <Checkbox
          checked={showStateDiagramStatus}
          onChange={() => dispatch(toggleShowStateDiagramStatus())}
          label="Show LinkQ State Diagram"
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
        <Checkbox
          checked={persistAPIKey}
          onChange={() => dispatch(togglePersistAPIKey())}
          label="Persist API Key in browser local storage"
          style={{marginTop:"0.3rem"}}
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

      <ActionIcon className={styles["settings-button"]} size="sm" variant="filled" aria-label="Show Settings" onClick={() => dispatch(toggleShowSettings())} style={{position: "absolute"}}>
        <IconSettings/>
      </ActionIcon>
    </>
  )
}