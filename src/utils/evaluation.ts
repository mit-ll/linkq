// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
//npx tsx evaluation.ts

// import fs from "fs"
import papaparse from "papaparse"
// import { loadEnv } from 'vite'

import { ChatGPTAPI } from "./ChatGPTAPI"
import { INITIAL_SYSTEM_MESSAGE } from "./knowledgeBase/prompts"
import { handleUserChat } from "./handleUserChat"
import { tryParsingOutQuery } from "./tryParsingOutQuery"
import { runQuery } from "./knowledgeBase/runQuery"
import { summarizeQueryResults } from "./summarizeQueryResults"
import { EntityId } from "wikibase-sdk"
import { getEntityData } from "./knowledgeBase/getEntityData"
import { formatSparqlResultsAsString } from "./formatSparqlResultsAsString"

// const ENV = loadEnv("development","../../")
// const INPUT_QUESTIONS_PATH = "./questions.csv"
// const OUTPUT_PATH = "./output.csv"

const INPUT_CSV_STRING = ``

type InputRowType = {
  Question: string,
  Source: string,
  "Actual triplet": string,
}

type OutputRowType = InputRowType & {
  "IDs Table": string,
  "LinkQ generated query": string,
  "Does query execute?": string,
  "Result from Wikidata": string,
  "LLM Summary": string,
  "Correct answer?": string,
  "Total Seconds": string,
  fullChatHistory: string,
}

// function parseCSVFile<T>(path:string):Promise<T[]> {
//   return new Promise((resolve) => {
//     const file = fs.createReadStream(path)
//     papaparse.parse<T>(file, {
//       header: true,
//       complete: function(results) {
//         resolve(results.data)
//       }
//     })
//   })
// }

export async function runEvaluation() {
  // const inputQuestions = await parseCSVFile<InputRowType>(inputQuestionsPath)
  const inputQuestions = papaparse.parse<InputRowType>(INPUT_CSV_STRING,{header: true}).data
  console.log("inputQuestions",JSON.stringify(inputQuestions, undefined, 2))

  const outputResults:OutputRowType[] = []
  for(const inputRow of inputQuestions) {
    console.log(`Running LinkQ on question: ${inputRow.Question}`)
    outputResults.push(
      await runOneLinkQPipeline(inputRow)
    )
  }

  console.log("JSON")
  console.log(JSON.stringify(outputResults, undefined, 2))
  // fs.writeFile("./output.json", JSON.stringify(outputResults, undefined, 2), function(err) {
  //   if(err) {
  //     return console.error(err)
  //   }
  //   console.log("The JSON file was saved!")
  // })

  console.log("CSV")
  console.log(papaparse.unparse(outputResults, {header: true}))
  // fs.writeFile(OUTPUT_PATH, papaparse.unparse(outputResults, {header: true}), function(err) {
  //   if(err) {
  //     return console.error(err)
  //   }
  //   console.log("The CSV file was saved!")
  // })
  downloadCSV("output.csv",papaparse.unparse(outputResults, {header: true}))
}



async function runOneLinkQPipeline(inputRow:InputRowType):Promise<OutputRowType> {
  const output:OutputRowType = {
    ...inputRow,
    "IDs Table": "",
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
    const tripletIds = inputRow["Actual triplet"].split(" ").filter(id => id)
    const idTableEntities = await getEntityData(tripletIds as EntityId[])
    output["IDs Table"] = idTableEntities.map(({id, label, description}) => {
      return `${id} | ${label} | ${description}`
    }).join("\n")


    //run the LinkQ pipeline
    const startTime = new Date().getTime()
    const llmResponse = await handleUserChat(inputRow.Question,chatGPT)
    const parsedQuery = tryParsingOutQuery(llmResponse.content)
    if(!parsedQuery) {
      throw new Error("Could not parse SPARQL query from LLM response")
    }
    const queryGenerationTime = new Date().getTime() - startTime
    output["Total Seconds"] = `${queryGenerationTime/1000}`
    output["LinkQ generated query"] = parsedQuery.query
    

    //execute the query
    const sparqlResults = await runQuery(parsedQuery.query)
    output["Does query execute?"] = "Yes"
    output["Result from Wikidata"] = formatSparqlResultsAsString(sparqlResults)


    //summarize the results
    const { summary } = await summarizeQueryResults(chatGPT,parsedQuery.query,sparqlResults)
    output["LLM Summary"] = summary


    //check to see if the results are cirrect
    const idsPresentInResults = tripletIds.map(id => {
      //we don't want "Q1" to match on "Q123"
      const wordRegex = new RegExp(String.raw`\b${id}\b`, "i")
      return (
        output["LinkQ generated query"].search(wordRegex)>=0
      ) || (
        output["Result from Wikidata"].search(wordRegex)>=0
      ) || false
    })
    output["Correct answer?"] = `${idsPresentInResults.reduce((acc, present) => acc && present,true)}\n\n${idsPresentInResults.map((present,i) => `${tripletIds[i]}: ${present}`).join("\n")}`
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