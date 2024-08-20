// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

//npx tsx calculateMintakaEvaluationMetrics.ts

import fs from "fs"
import papaparse from "papaparse"
import { EvaluationOutputRowType } from "./mintakaEvaluation";


calculateMetrics("./LinkQ Evaluation Output.csv","./Plain LLM Evaluation Output.csv","./output.csv")

type MetricType = {
  complexityType: string,
  category: string,
  id: string,
  question: string,
  linkqCorrect: number,
  plainLLMCorrect: number,
  total: number,
}

async function calculateMetrics(
  linkqDataPath:string,
  plainLLMDataPath:string,
  outputPath:string,
) {
  console.log("Running calculateMetrics")
  const METRICS:Record<string,MetricType> = {}

  const [linkqData, plainLLMData] = await Promise.all([
    parseCSVFile<EvaluationOutputRowType>(linkqDataPath),
    parseCSVFile<EvaluationOutputRowType>(plainLLMDataPath),
  ])
  console.log("Parsed data")
  if(linkqData.length !== plainLLMData.length) {
    throw new Error(`linkqData and plainLLMData lengths do not match`)
  }

  //process each row
  linkqData.forEach((linkqRow,i) => {
    const plainLLMRow = plainLLMData[i]
    if(linkqRow.id !== plainLLMRow.id) {
      throw new Error(`The question ID at index ${i} did not match between the LinkQ and plain LLM data`)
    }

    const id = linkqRow.id
    if(METRICS[id] === undefined) {
      METRICS[id] = {
        complexityType: linkqRow.complexityType,
        category: linkqRow.category,
        id,
        question: linkqRow.question,
        linkqCorrect: 0,
        plainLLMCorrect: 0,
        total: 0,
      }
    }

    //determine if this question was answered correctly
    const linkqIsCorrect = isCorrect(linkqRow)
    METRICS[id].linkqCorrect += linkqIsCorrect ? 1 : 0

    const plainLLMIsCorrect = isCorrect(plainLLMRow)
    METRICS[id].plainLLMCorrect += plainLLMIsCorrect ? 1 : 0

    METRICS[id].total += 1
  })
  console.log("Done processing")


  //get an array of ordered question IDs
  const orderedQuestionIds = Array.from(
    linkqData.reduce((set,row) => {
      set.add(row.id)
      return set
    }, new Set<string>())
  )

  //make sure the questions are in the same order
  const supplementalCSVString = papaparse.unparse(
    orderedQuestionIds.map(id => {
      const metrics = METRICS[id]
      return {
        ...metrics,
        "LinkQ # Correct": `${metrics.linkqCorrect}/${metrics.total}`,
        "Plain LLM # Correct": `${metrics.plainLLMCorrect}/${metrics.total}`,
      }
    }),
    {header: true}
  )
  fs.writeFile(outputPath, supplementalCSVString, err => {
    if (err) {
      console.error("Error writing output CSV",err);
    } else {
      console.log("Successfully wrote output CSV!")
    }
  });
}

function isCorrect(row: EvaluationOutputRowType) {
  return row["Correct answer?"].split("\n")[0].trim().toUpperCase() === "TRUE"
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