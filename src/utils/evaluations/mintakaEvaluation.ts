// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

//npx tsx mintakaEvaluation.ts

//you may need to manually add a User-Agent to the headers of src/utils/knowledgeBase/runQuery.ts

//set up this script to work behind a proxy, if applicable
import { setGlobalDispatcher, ProxyAgent } from "undici";
if (process.env.HTTPS_PROXY) {
  const dispatcher = new ProxyAgent({uri: new URL(process.env.HTTPS_PROXY).toString() });
  setGlobalDispatcher(dispatcher);
}

import fs from "fs"
import papaparse from "papaparse"

import { ChatGPTAPI } from "../ChatGPTAPI"
import { tryParsingOutQuery } from "../tryParsingOutQuery"
import { runQuery } from "../knowledgeBase/runQuery"
import { summarizeQueryResults } from "../summarizeQueryResults"
import { getEntityDataFromQuery } from "../knowledgeBase/getEntityData"
import { formatSparqlResultsAsString } from "../formatSparqlResultsAsString"
import { QUESTIONS } from "./questions"
import { INITIAL_SYSTEM_MESSAGE } from "../knowledgeBase/prompts"
import { queryBuildingWorkflow } from "../queryBuildingWorkflow"

import { loadEnv } from 'vite'
const ENV = loadEnv("development","../../../")

runLinkQMintakaEvaluation()

export type MintakaQuestionType = {
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


export type EvaluationOutputRowType = {
  "id": string,
  "question": string,
  "attemptNumber": string,
  "complexityType": string,
  "category": string,
  "questionEntity": string,
  "answer": string,
  "IDs Table": string,
  "LLM message we tried to parse for a query": string,
  "Generated query": string,
  "Does query execute?": string,
  "Result from Wikidata": string,
  "LLM Summary": string,
  "Try to detect correct answer": string,
  "Correct": string,
  "Total Seconds": string,
  fullChatHistory: string,
}


type ApproachCallbackFunctionType = (
  chatGPT: ChatGPTAPI,
  question:string
) => ReturnType<ChatGPTAPI["sendMessages"]>

async function runMintakaEvaluation(
  outputFileName:string,
  approachCallback: ApproachCallbackFunctionType,
) {
  const ATTEMPTS_PER_QUESTION = 1
  const outputResults:EvaluationOutputRowType[] = []
  for(const question of QUESTIONS) {
    for(let i=1; i<=ATTEMPTS_PER_QUESTION; ++i) {
      console.log(`Running LinkQ on question: ${question.question}, attempt ${i}`)
      outputResults.push(
        await runOneLinkQPipeline(
          question,
          i,
          approachCallback,
        )
      )
    }
    
  }

  console.log("JSON")
  console.log(JSON.stringify(outputResults, undefined, 2))

  console.log("CSV")
  console.log(papaparse.unparse(outputResults, {header: true}))
  fs.writeFile(outputFileName, papaparse.unparse(outputResults, {header: true}), err => {
    if (err) {
      console.error("Error writing output CSV",err);
    } else {
      console.log("Successfully wrote output CSV!")
    }
  });
}

export async function runLinkQMintakaEvaluation() {
  return await runMintakaEvaluation(
    "LinkQ Evaluation Output.csv",
    async (chatGPT:ChatGPTAPI, question:string) => {
      //force the LLM to start the query building workflow
      chatGPT.messages = [
        {
          content: INITIAL_SYSTEM_MESSAGE,
          chatId: 0,
          name: "system",
          role: "system",
        },
        {
          content: question,
          chatId: 0,
          name: "user",
          role: "user",
        },
        {
          content: "BUILD QUERY",
          chatId: 0,
          name: "gpt-4-turbo-preview",
          role: "assistant",
        },
      ]

      return await queryBuildingWorkflow(chatGPT, question)
    }
  )
}

export async function runPlainLLMMintakaEvaluation() {
  return await runMintakaEvaluation(
    "Plain LLM Evaluation Output.csv",
    async (chatGPT:ChatGPTAPI, question:string) => {
      return await chatGPT.sendMessages([
        {
          content: `You are an expert at generating SPARQL queries for the Wikidata, which is a knowledge graph of encyclopedic data from Wikipedia. Your job is not to directly answer the question, but instead to write a SPARQL query to find the answer. Start the SPARQL query with \`\`\`sparql and end the query with \`\`\`. Now generate a SPARQL query to answer the question: ${question}`,
          role: "system",
        },
      ])
    }
  )
}



async function runOneLinkQPipeline(
  question:MintakaQuestionType, 
  attemptNumber:number,
  approachCallback: ApproachCallbackFunctionType,
):Promise<EvaluationOutputRowType> {
  if(attemptNumber < 1) throw new Error("Expected 'attemptNumber' to be positive")

  const output:EvaluationOutputRowType = {
    id: question.id,
    question: question.question,
    attemptNumber: attemptNumber.toString(),
    complexityType: question.complexityType,
    category: question.category,
    questionEntity: JSON.stringify(question.questionEntity),
    answer: JSON.stringify(question.answer),
    "IDs Table": "ID | Label | Description",
    "LLM message we tried to parse for a query": "",
    "Generated query": "",
    "Does query execute?": "No",
    "Result from Wikidata": "",
    "LLM Summary": "",
    "Try to detect correct answer": "",
    "Correct": "",
    "Total Seconds": "",
    fullChatHistory: "",
  }


  //set up ChatGPT
  const chatGPT = new ChatGPTAPI({
    apiKey: ENV.VITE_OPENAI_API_KEY,
    chatId: 0,
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


    //run the approach
    const startTime = new Date().getTime()
    const llmResponse = await approachCallback(chatGPT, question.question)
    const queryGenerationTime = new Date().getTime() - startTime
    output["LLM message we tried to parse for a query"] = llmResponse.content


    //try to parse the query
    const parsedQuery = tryParsingOutQuery(llmResponse.content)
    if(!parsedQuery) {
      throw new Error("Could not parse SPARQL query from LLM response")
    }
    output["Total Seconds"] = `${queryGenerationTime/1000}`
    const query = parsedQuery.query
    output["Generated query"] = query
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
          output["Generated query"].includes(criteria)
        ) || (
          output["Result from Wikidata"].includes(criteria)
        )
      }
      else {
        // //we don't want "Q1" to match on "Q123"
        const wordRegex = new RegExp(String.raw`\b${criteria}\b`, "i")
        present ||= (
          output["Generated query"].search(wordRegex)>=0
        ) || (
          output["Result from Wikidata"].search(wordRegex)>=0
        )
      }

      return { criteria, present }
    })
    output["Try to detect correct answer"] = `${searchCriteriaPresentInResults.reduce((acc, {present}) => acc && present,true)}\n\n${searchCriteriaPresentInResults.map(({criteria, present}) => `${criteria}: ${present}`).join("\n")}`
  }
  catch(err) {
    console.error(err)
  }

  return {
    ...output,
    fullChatHistory: JSON.stringify(chatGPT.messages)
  }
}

// export function downloadCSV(filename:string, data:string) {
//   const element = document.createElement('a');
//   element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(data));
//   element.setAttribute('download', filename);

//   element.style.display = 'none';
//   document.body.appendChild(element);

//   element.click();

//   document.body.removeChild(element);
// }
