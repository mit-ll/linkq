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
  linkqQuerySyntaxCorrect: number,
  linkqAnswerCorrect: number,
  plainLLMQuerySyntaxCorrect: number,
  plainLLMAnswerCorrect: number,
  total: number,
}


type CounterType = {
  _total_: number,
  [complexityType:string]: number,
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

  const queryGenerationTimes:{linkq:number[],plainLLM:number[]} = {
    linkq: [],
    plainLLM: [],
  }
  //process each row
  linkqData.forEach((linkqRow,i) => {
    const plainLLMRow = plainLLMData[i]
    if(linkqRow.id !== plainLLMRow.id) {
      throw new Error(`The question ID at index ${i} did not match between the LinkQ ${linkqRow.id} and plain LLM data ${plainLLMRow.id}`)
    }

    const id = linkqRow.id
    if(METRICS[id] === undefined) {
      METRICS[id] = {
        complexityType: linkqRow.complexityType,
        category: linkqRow.category,
        id,
        question: linkqRow.question,
        linkqAnswerCorrect: 0,
        linkqQuerySyntaxCorrect: 0,
        plainLLMAnswerCorrect: 0,
        plainLLMQuerySyntaxCorrect: 0,
        total: 0,
      }
    }

    //determine if this question was answered correctly
    const linkqIsAnswerCorrect = isAnswerCorrect(linkqRow)
    const linkqIsSyntaxCorrect = isSyntaxCorrect(linkqRow)
    METRICS[id].linkqAnswerCorrect += getSum(linkqIsAnswerCorrect)
    METRICS[id].linkqQuerySyntaxCorrect += getSum(linkqIsSyntaxCorrect)

    const plainLLMIsAnswerCorrect = isAnswerCorrect(plainLLMRow)
    const plainLLMIsSyntaxCorrect = isSyntaxCorrect(plainLLMRow)
    METRICS[id].plainLLMAnswerCorrect += getSum(plainLLMIsAnswerCorrect)
    METRICS[id].plainLLMQuerySyntaxCorrect += getSum(plainLLMIsSyntaxCorrect)

    METRICS[id].total += 1


    //track timings
    if(linkqRow["Total Seconds"].trim()) {
      queryGenerationTimes.linkq.push(
        parseFloat(linkqRow["Total Seconds"].trim())
      )
    }
    if(plainLLMRow["Total Seconds"].trim()) {
      queryGenerationTimes.plainLLM.push(
        parseFloat(plainLLMRow["Total Seconds"].trim())
      )
    }
  })
  console.log("Done processing")


  //get an array of ordered question IDs
  const orderedQuestionIds = Array.from(
    linkqData.reduce((set,row) => {
      set.add(row.id)
      return set
    }, new Set<string>())
  )

  
  const oneCorrectAnswerForQuestion:{linkq:CounterType,plainLLM:CounterType} = {
    linkq: { _total_: 0 },
    plainLLM: { _total_: 0 },
  }
  const oneCorrectQuerySyntaxForQuestion:{linkq:CounterType,plainLLM:CounterType} = {
    linkq: { _total_: 0 },
    plainLLM: { _total_: 0 },
  }
  const supplementalCSVString = papaparse.unparse(
    //make sure the questions are in the same order
    orderedQuestionIds.map(id => {
      const metrics = METRICS[id]
      if(!oneCorrectAnswerForQuestion.linkq[metrics.complexityType]) {
        oneCorrectAnswerForQuestion.linkq[metrics.complexityType] = 0
        oneCorrectQuerySyntaxForQuestion.linkq[metrics.complexityType] = 0
        oneCorrectAnswerForQuestion.plainLLM[metrics.complexityType] = 0
        oneCorrectQuerySyntaxForQuestion.plainLLM[metrics.complexityType] = 0
      }

      oneCorrectAnswerForQuestion.linkq._total_ += metrics.linkqAnswerCorrect>0?1:0
      oneCorrectAnswerForQuestion.linkq[metrics.complexityType] += metrics.linkqAnswerCorrect>0?1:0
      oneCorrectQuerySyntaxForQuestion.linkq._total_ += metrics.linkqQuerySyntaxCorrect>0?1:0
      oneCorrectQuerySyntaxForQuestion.linkq[metrics.complexityType] += metrics.linkqQuerySyntaxCorrect>0?1:0
      oneCorrectAnswerForQuestion.plainLLM._total_ += metrics.plainLLMAnswerCorrect>0?1:0
      oneCorrectAnswerForQuestion.plainLLM[metrics.complexityType] += metrics.plainLLMAnswerCorrect>0?1:0
      oneCorrectQuerySyntaxForQuestion.plainLLM._total_ += metrics.plainLLMQuerySyntaxCorrect>0?1:0
      oneCorrectQuerySyntaxForQuestion.plainLLM[metrics.complexityType] += metrics.plainLLMQuerySyntaxCorrect>0?1:0
      return {
        ...metrics,
        "LinkQ # Answer Correct": `${metrics.linkqAnswerCorrect}/${metrics.total}`,
        "LinkQ # Syntax Correct": `${metrics.linkqQuerySyntaxCorrect}/${metrics.total}`,
        "Plain LLM # Answer Correct": `${metrics.plainLLMAnswerCorrect}/${metrics.total}`,
        "Plain LLM # Syntax Correct": `${metrics.plainLLMQuerySyntaxCorrect}/${metrics.total}`,
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
  console.log("oneCorrectAnswerForQuestion",oneCorrectAnswerForQuestion)
  console.log("oneCorrectQuerySyntaxForQuestion",oneCorrectQuerySyntaxForQuestion)

  console.log("Average time for LinkQ query generation", meanAndStd(queryGenerationTimes.linkq))
  console.log("Average time for Plain LLM query generation", meanAndStd(queryGenerationTimes.plainLLM))
}


function getSum(correct:boolean) {
  return correct ? 1 : 0
}

function isAnswerCorrect(row: EvaluationOutputRowType) {
  const value = row["Correct"].split("\n")[0].trim().toUpperCase()
  if(value !== "YES" && value!=="NO") {
    throw new Error(`Encountered unexpected correct answer value ${value}`)
  }
  return value === "YES"
}

function isSyntaxCorrect(row: EvaluationOutputRowType) {
  const value = row["Does query execute?"].split("\n")[0].trim().toUpperCase()
  if(value !== "YES" && value!=="NO") {
    throw new Error(`Encountered unexpected correct syntax value ${value}`)
  }
  return value === "YES"
}


export function parseCSVFile<T>(path:string):Promise<T[]> {
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

function meanAndStd(numArray: number[]) {
  let min = Infinity
  let max = -Infinity
  const mean = numArray.reduce((sum, n) => {
    if(min===null || n < min) {
      min = n
    }
    if(max===null || n > max) {
      max = n
    }

    return sum + n
  }) / numArray.length;
  const variance = numArray.reduce((s, n) => s + (n - mean) ** 2, 0) / (numArray.length - 1);
  return {
    max,
    mean,
    min,
    variance,
    std: Math.sqrt(variance),
  }
}