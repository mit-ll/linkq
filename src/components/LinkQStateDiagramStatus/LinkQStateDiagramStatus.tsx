import { Card, Title } from "@mantine/core"
import { useMainChatAPI } from "hooks/useMainChatAPI"
import { useRunQuery } from "hooks/useRunQuery"
import { useAppSelector } from "redux/store"

import styles from "./LinkQStateDiagramStatus.module.scss"


const STEPS = {
  "Question Refinement": "#4a235a",
  "KG Exploration": "#1d8348",
  "Query Generation": "#1d8348",
  "Results Summarization": "#1d8348",
} as const

export function LinkQStateDiagramStatus() {
  const fullChatHistory = useAppSelector(state => state.chatHistory.fullChatHistory)
  const showStateDiagramStatus = useAppSelector(state => state.settings.showStateDiagramStatus)
  const {
    useMutationOutput: {
      isPending: chatIsPending,
    }
  } = useMainChatAPI()
  const { runQueryIsPending, summarizeResultsIsPending } = useRunQuery()


  if(!showStateDiagramStatus) return null

  let stateIndex = 0
  const stage = fullChatHistory.at(-1)?.stage
  if(chatIsPending) {
    if(stage === "Question Refinement") {
      stateIndex = 0
    }
    else if(stage === "Query Building") {
      stateIndex = 2
    }
    else {
      stateIndex = 1
    }
  }
  else if(runQueryIsPending || summarizeResultsIsPending) {
    stateIndex = 3
  }

  return (
    <div id={styles["state-diagram-container"]}>
      <Title order={4}>LinkQ Step</Title>
      <div id={styles["state-diagram"]}>
        <div id={styles["line"]}/>
        {Object.entries(STEPS).map(([name, color],i) => {
          return (
            <Card className={`${stateIndex!==i && styles["inactive"]}`} key={i} shadow="lg" padding="xs" radius="md" style={{backgroundColor: color}}>
              <span>{name}</span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}