import { useState } from "react"

import { Card, Title } from "@mantine/core"

import { useAppSelector } from "redux/store"

import styles from "./LinkQStages.module.scss"

const BLUE = "#1c7ed6"
const PURPLE = "#862e9c"
const YELLOW = "#f59f00"

const STEPS = [
  {
    name: "Question Refinement",
    color: PURPLE,
    children: [
      {
        name: "User asks question",
        color: PURPLE,
      },
      {
        name: "LLM decides whether to clarify question",
        color: YELLOW,
      },
      {
        name: "LLM clarifies question",
        color: YELLOW,
      },
      {
        name: "LLM begins KG exploration",
        color: YELLOW,
      },
    ]
  },
  {
    name: "KG Exploration",
    color: YELLOW,
    children: [
      {
        name: "System enumerates KG APIs",
        color: BLUE,
      },
      {
        name: "LLM fuzzy searches for entity",
        color: YELLOW,
      },
      {
        name: "LLM searches for properties",
        color: YELLOW,
      },
      {
        name: "LLM searches for tail entities",
        color: YELLOW,
      },
      {
        name: "LLM is misbehaving",
        color: YELLOW,
      },
      {
        name: "LLM is done exploring",
        color: YELLOW,
      },
    ]
  },
  {
    name: "Query Generation",
    color: YELLOW,
    children: [
      {
        name: "System gives SPARQL few-shot training",
        color: BLUE,
      },
      {
        name: "LLM generates query",
        color: YELLOW,
      },
      {
        name: "User decides whether to execute or modify",
        color: PURPLE,
      },
    ]
  },
  {
    name: "Results Summarization",
    color: YELLOW,
    children: [
      {
        name: "User executes query",
        color: PURPLE,
      },
      {
        name: "LLM names query",
        color: YELLOW,
      },
      {
        name: "LLM summarizes results",
        color: YELLOW,
      },
    ]
  },
] as const


export type MainStatusNameType = typeof STEPS[number]["name"]
export type SubStatusNameType = typeof STEPS[number]["children"][number]["name"]


export function LinkQStages() {
  const stage = useAppSelector(state => state.stage)
  const showStateDiagramStatus = useAppSelector(state => state.settings.showStateDiagramStatus)
  const [showDetails, _] = useState<boolean>(false)


  if(!showStateDiagramStatus) return null

  return (
    <div>
      <div id={styles["state-diagram-container"]}>
        <Title order={4}>LinkQ Stage</Title>
        <div className={styles["state-diagram-grid"]}>
          {/* <div id={styles["line"]}/> */}
          {STEPS.map(({name,color},i) => {
            return (
              <div key={i}>
                <Card className={`${stage?.mainStage!==name && styles["inactive"]}`} shadow="lg" padding="xs" radius="md" style={{backgroundColor: color}}>
                  <span>{name}</span>
                </Card>
              </div>
            )
          })}
        </div>
        <div className={styles["state-diagram-grid"]}>
          {STEPS.map((_,i) => <div key={i}><hr/></div>)}
        </div>
        <div className={styles["state-diagram-grid"]}>
          {STEPS.map(({name:mainStatusName,children},i) => {
            return (
              <div key={i}>
                {children?.map(({name, color},j) => {
                  return (
                    <Card key={j} className={`${(stage?.mainStage!==mainStatusName || stage?.subStage!==name) && styles["inactive"]}`} shadow="lg" padding="xs" radius="md" style={{backgroundColor: color}}>
                      <span>{name}</span>
                    </Card>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      <div id={styles["detailed-state-diagram-container"]}>
        
      </div>
    </div>
  )
}