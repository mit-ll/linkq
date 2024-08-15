//npx tsx evaluation.ts

import fs from "fs"
import papaparse from "papaparse"
import { loadEnv } from 'vite'

import { ChatGPTAPI } from "./ChatGPTAPI"
import { INITIAL_SYSTEM_MESSAGE } from "./knowledgeBase/prompts"
import { handleUserChat } from "./handleUserChat"
import { tryParsingOutQuery } from "./tryParsingOutQuery"
import { runQuery } from "./knowledgeBase/runQuery"
import { summarizeQueryResults } from "./summarizeQueryResults"

const ENV = loadEnv("development","../../")

const INPUT_QUESTIONS_PATH = "./questions.csv"
const OUTPUT_PATH = "./output.csv"

type InputRowType = {
  Question: string,
  Source: string,
}

type OutputRowType = InputRowType & {
  "LinkQ generated query": string,
  "Does query execute?": string,
  "Result from Wikidata": string,
  "LLM Summary": string,
  "Correct answer?": string,
  fullChatHistory: string,
}

function parseCSVFile<T>(path:string):Promise<T[]> {
  return new Promise((resolve) => {
    const file = fs.createReadStream(path)
    papaparse.parse<T>(file, {
      header: true,
      complete: function(results) {
        resolve(results.data)
      }
    })
  })
}

async function runEvaluation(inputQuestionsPath:string) {
  const inputQuestions = await parseCSVFile<InputRowType>(inputQuestionsPath)
  console.log("inputQuestions",inputQuestions)

  const promiseResults = await Promise.allSettled(
    inputQuestions.map(inputRow => runOneLinkQPipeline(inputRow))
  )
  const outputResults = promiseResults.filter(p => p.status==="fulfilled").map(p => p.value)

  fs.writeFile("./output.json", JSON.stringify(outputResults, undefined, 2), function(err) {
    if(err) {
      return console.error(err)
    }
    console.log("The JSON file was saved!")
  })

  fs.writeFile(OUTPUT_PATH, papaparse.unparse(outputResults, {header: true}), function(err) {
    if(err) {
      return console.error(err)
    }
    console.log("The CSV file was saved!")
  })
}

runEvaluation(INPUT_QUESTIONS_PATH)



async function runOneLinkQPipeline(inputRow:InputRowType):Promise<OutputRowType> {
  const output:OutputRowType = {
    ...inputRow,
      "LinkQ generated query": "null",
      "Does query execute?": "No",
      "Result from Wikidata": "null",
      "LLM Summary": "null",
      "Correct answer?": "",
      fullChatHistory: "",
  }

  const chatGPT = new ChatGPTAPI({
    apiKey: ENV.VITE_OPENAI_API_KEY,
    chatId: 0,
    systemMessage: INITIAL_SYSTEM_MESSAGE,
  })

  try {
    const llmResponse = await handleUserChat(inputRow.Question,chatGPT)

    const parsedQuery = tryParsingOutQuery(llmResponse.content)
    if(!parsedQuery) {
      throw new Error("Could not parse SPARQL query from LLM response")
    }
    output["LinkQ generated query"] = "Yes"

    const sparqlResults = await runQuery(parsedQuery.query)
    output["Does query execute?"] = "Yes"
    output["Result from Wikidata"] = JSON.stringify(sparqlResults)


    const { summary } = await summarizeQueryResults(chatGPT,parsedQuery.query,sparqlResults)
    output["LLM Summary"] = summary
  }
  catch(err) {
    console.error(err)
  }

  return {
    ...output,
    fullChatHistory: JSON.stringify(chatGPT.messages)
  }
}