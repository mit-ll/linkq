import { Card, Title } from "@mantine/core"
import { useMainChatAPI } from "hooks/useMainChatAPI"
import { useRunQuery } from "hooks/useRunQuery"
import { useAppSelector } from "redux/store"

import styles from "./LinkQStateDiagramStatus.module.scss"


const STEPS = {
  "Question Refinement": "rgb(221,213,231)",
  "KG Exploration": "rgb(238,246,228)",
  "Query Generation": "rgb(238,246,228)",
  "Results Summarization": "rgb(238,246,228)",
} as const

export function LinkQStateDiagramStatus() {
  const showStateDiagramStatus = useAppSelector(state => state.settings.showStateDiagramStatus)
  const {
    useMutationOutput: {
      isPending: chatIsPending,
    }
  } = useMainChatAPI()
  const { runQueryIsPending, summarizeResultsIsPending } = useRunQuery()


  if(!showStateDiagramStatus) return null

  let stateIndex = 0
  if(chatIsPending) {
    stateIndex = 1
  }
  else if(runQueryIsPending) {
    stateIndex = 2
  }
  else if(summarizeResultsIsPending) {
    stateIndex = 3
  }

  return (
    <div id={styles["state-diagram-container"]}>
      <Title order={4}>LinkQ Step</Title>
      <div id={styles["state-diagram"]}>
        <div id={styles["line"]}/>
        {Object.entries(STEPS).map(([name, color],i) => {
          return (
            <Card className={`${stateIndex!==i && styles["inactive"]}`} key={i} shadow="sm" padding="sm" radius="md" style={{backgroundColor: color}}>
              <span>{name}</span>
            </Card>
          )
        })}
      </div>
    </div>
  )
}