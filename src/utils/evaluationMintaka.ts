// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import papaparse from "papaparse"

import { ChatGPTAPI } from "./ChatGPTAPI"
import { INITIAL_SYSTEM_MESSAGE } from "./knowledgeBase/prompts"
import { handleUserChat } from "./handleUserChat"
import { tryParsingOutQuery } from "./tryParsingOutQuery"
import { runQuery } from "./knowledgeBase/runQuery"
import { summarizeQueryResults } from "./summarizeQueryResults"
import { getEntityDataFromQuery } from "./knowledgeBase/getEntityData"
import { formatSparqlResultsAsString } from "./formatSparqlResultsAsString"


type MintakaQuestionType = {
  "id": string //"bfc9807b",
  "question": string //"What state is the author of Misery from?",
  "translations"?: any
  "questionEntity": {
    "name": string | number //"Q596874",
    "entityType": string //"entity",
    "label"?: string //"Misery",
    "mention": string //"Misery",
    "span": number[] //[28,34]
  }[],
  "answer": {
    "answerType": string //"entity",
    "answer": (
      {
        "name": string //"Q724",
        "label": {
            "en": string //"Maine",
            "ar": string | null //"مين",
            "de": string | null //"Maine",
            "es": string | null //"Maine",
            "fr": string | null //"Maine",
            "hi": string | null //"मेन",
            "it": string | null //"Maine",
            "ja": string | null //"メイン州",
            "pt": string | null //"Maine"
        }
      }
      | string | number | boolean
    )[] | null,
    "mention": string //"Maine"
  },
  "category": string //"books",
  "complexityType": string //"multihop"
}

type OutputRowType = {
  "id": string,
  "question": string,
  "questionEntity": string,
  "answer": string,
  "IDs Table": string,
  "LLM message we tried to parse for a query": string,
  "LinkQ generated query": string,
  "Does query execute?": string,
  "Result from Wikidata": string,
  "LLM Summary": string,
  "Correct answer?": string,
  "Total Seconds": string,
  fullChatHistory: string,
}


const QUESTIONS:MintakaQuestionType[] = []

export async function runEvaluation() {
  const outputResults:OutputRowType[] = []
  for(const question of QUESTIONS) {
    console.log(`Running LinkQ on question: ${question.question}`)
    outputResults.push(
      await runOneLinkQPipeline(question)
    )
  }

  console.log("JSON")
  console.log(JSON.stringify(outputResults, undefined, 2))

  console.log("CSV")
  console.log(papaparse.unparse(outputResults, {header: true}))
  downloadCSV("output.csv",papaparse.unparse(outputResults, {header: true}))
}



async function runOneLinkQPipeline(question:MintakaQuestionType):Promise<OutputRowType> {
  const output:OutputRowType = {
    id: question.id,
    question: question.question,
    questionEntity: JSON.stringify(question.questionEntity),
    answer: JSON.stringify(question.answer),
    "IDs Table": "ID | Label | Description",
    "LLM message we tried to parse for a query": "",
    "LinkQ generated query": "",
    "Does query execute?": "No",
    "Result from Wikidata": "",
    "LLM Summary": "",
    "Correct answer?": "",
    "Total Seconds": "",
    fullChatHistory: "",
  }


  //set up ChatGPT
  const chatGPT = new ChatGPTAPI({
    // apiKey: ENV.VITE_OPENAI_API_KEY,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY?.trim() || "",
    chatId: 0,
    systemMessage: INITIAL_SYSTEM_MESSAGE,
    dangerouslyAllowBrowser: true,
  })


  try {
    //get the labels and descriptions for all the IDs
    output["IDs Table"] += "\n" + question.questionEntity.map(e => `${e.name} | ${e.label}`).join("\n")
    if(question.answer.answer) {
      question.answer.answer.forEach(e => {
        if(typeof e === "object") {
          output["IDs Table"] += "\n" + `${e.name} | ${e.label.en}`
        }
      })
    }


    //run the LinkQ pipeline
    const startTime = new Date().getTime()
    const llmResponse = await handleUserChat(question.question,chatGPT)
    const queryGenerationTime = new Date().getTime() - startTime
    output["LLM message we tried to parse for a query"] = llmResponse.content
    const parsedQuery = tryParsingOutQuery(llmResponse.content)
    if(!parsedQuery) {
      throw new Error("Could not parse SPARQL query from LLM response")
    }
    output["Total Seconds"] = `${queryGenerationTime/1000}`
    const query = parsedQuery.query
    output["LinkQ generated query"] = query
    const queryEntityData = await getEntityDataFromQuery(query)
    if(queryEntityData) {
      output["IDs Table"] += "\n" + queryEntityData.map(({id,label,description}) => {
        return `${id} | ${label} | ${description}`
      }).join("\n")
    }
    
    

    //execute the query
    const sparqlResults = await runQuery(query)
    output["Does query execute?"] = "Yes"
    output["Result from Wikidata"] = formatSparqlResultsAsString(sparqlResults)


    //summarize the results
    const { summary } = await summarizeQueryResults(chatGPT,query,sparqlResults)
    output["LLM Summary"] = summary


    //check to see if the results are correct, ie if they contain these search strings
    const searchCriteria:{criteria:string,type:string}[] = []
    // question.questionEntity.map(e => ({
    //   criteria: e.name,
    //   type: e.entityType,
    // }))
    if(question.answer.answer) {
      question.answer.answer.forEach(e => {
        if(typeof e === "object") {
          searchCriteria.push({
            criteria: e.name,
            type: question.answer.answerType,
          })
        }
        else {
          searchCriteria.push({
            criteria: e.toString(),
            type: question.answer.answerType,
          })
        }
      })
    }
    else {
      searchCriteria.push({
        criteria: question.answer.mention,
        type: question.answer.answerType,
      })
    }
    const searchCriteriaPresentInResults = searchCriteria.map(({criteria, type}) => {
      let present = false

      if(type === "date") { //the regex doesn't work on dates for some reason
        present ||= (
          output["LinkQ generated query"].includes(criteria)
        ) || (
          output["Result from Wikidata"].includes(criteria)
        )
      }
      else {
        // //we don't want "Q1" to match on "Q123"
        const wordRegex = new RegExp(String.raw`\b${criteria}\b`, "i")
        present ||= (
          output["LinkQ generated query"].search(wordRegex)>=0
        ) || (
          output["Result from Wikidata"].search(wordRegex)>=0
        )
      }

      return { criteria, present }
    })
    output["Correct answer?"] = `${searchCriteriaPresentInResults.reduce((acc, {present}) => acc && present,true)}\n\n${searchCriteriaPresentInResults.map(({criteria, present}) => `${criteria}: ${present}`).join("\n")}`
  }
  catch(err) {
    console.error(err)
  }

  return {
    ...output,
    fullChatHistory: JSON.stringify(chatGPT.messages)
  }
}

export function downloadCSV(filename:string, data:string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}



