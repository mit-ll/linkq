import { useState } from "react"

import { ActionIcon, Card, Title } from "@mantine/core"

import { useAppSelector } from "redux/store"

import styles from "./LinkQStages.module.scss"
import { IconCaretDown, IconCaretUp } from "@tabler/icons-react"

const DARK_BLUE = "#2171b5"
const LIGHT_BLUE = "#6baed6"

const STEPS = [
  {
    name: "Question Refinement",
    color: LIGHT_BLUE,
    children: [
      {
        name: "User asks question",
        color: DARK_BLUE,
      },
      {
        name: "LLM decides whether to clarify question",
        color: DARK_BLUE,
      },
      {
        name: "LLM clarifies question",
        color: DARK_BLUE,
      },
      // {
      //   name: "LLM begins KG exploration",
      //   color: DARK_BLUE,
      // },
    ]
  },
  {
    name: "KG Exploration",
    color: LIGHT_BLUE,
    children: [
      {
        name: "System enumerates KG APIs to LLM",
        color: DARK_BLUE,
      },
      {
        name: "LLM fuzzy searches for entity",
        color: DARK_BLUE,
      },
      {
        name: "LLM searches for properties",
        color: DARK_BLUE,
      },
      {
        name: "LLM searches for tail entities",
        color: DARK_BLUE,
      },
      // {
      //   name: "LLM is misbehaving",
      //   color: DARK_BLUE,
      // },
      // {
      //   name: "LLM is done exploring",
      //   color: DARK_BLUE,
      // },
    ]
  },
  {
    name: "Query Generation",
    color: LIGHT_BLUE,
    children: [
      {
        name: "System gives SPARQL few-shot training to LLM",
        color: DARK_BLUE,
      },
      {
        name: "LLM generates query",
        color: DARK_BLUE,
      },
      {
        name: "User decides whether to execute or modify",
        color: DARK_BLUE,
      },
    ]
  },
  {
    name: "Results Summarization",
    color: LIGHT_BLUE,
    children: [
      {
        name: "User executes query",
        color: DARK_BLUE,
      },
      {
        name: "LLM names query",
        color: DARK_BLUE,
      },
      {
        name: "LLM summarizes results",
        color: DARK_BLUE,
      },
    ]
  },
] as const


export type MainStatusNameType = typeof STEPS[number]["name"]
export type SubStatusNameType = typeof STEPS[number]["children"][number]["name"]


export function LinkQStages() {
  const stage = useAppSelector(state => state.stage)
  const showStateDiagramStatus = useAppSelector(state => state.settings.showStateDiagramStatus)
  const [showDetails, setShowDetails] = useState<boolean>(true)


  if(!showStateDiagramStatus) return null

  return (
    <div>
      <div id={styles["state-diagram-container"]}>
        <ActionIcon id={styles["show-details-toggle"]} size="sm" color="gray" variant="filled" aria-label="Show Details" onClick={() => setShowDetails(!showDetails)}>
          {showDetails ? <IconCaretDown/> : <IconCaretUp/>}
        </ActionIcon>
        <Title order={4}>LinkQ State Diagram</Title>
        <div className={styles["state-diagram-grid"]}>
          {STEPS.map(({name:mainStageName,color,children},i) => {
            const mainStageIsActive = stage?.mainStage===mainStageName

            return (
              <div key={i}>
                <Card className={`${!mainStageIsActive && styles["inactive"]}`} shadow="lg" padding="xs" radius="md" style={{backgroundColor: color}}>
                  <span className={styles["main-stage"]}>{mainStageName}</span>

                  {showDetails && (
                    <div key={i}>
                      {children?.map(({name:subStageName, color},j) => {
                        return (
                          <Card key={j} className={`${(!mainStageIsActive || stage?.subStage!==subStageName) && styles["inactive"]}`} shadow="lg" padding="xs" radius="md" style={{backgroundColor: color}}>
                            <span>{subStageName}</span>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </Card>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}