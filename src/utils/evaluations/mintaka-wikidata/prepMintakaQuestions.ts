// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

//npx tsx prepMintakaQuestions.ts

import fs from "fs"

import { MintakaQuestionType } from "./mintakaEvaluation";
import { parseCSVFile } from "utils/parseCSVFile";

prepMintakaQuestions()


type CuratedMintakaQuestionType = {
  complexityType: string,
  category: string,
  id: string,
  question: string,
}

async function prepMintakaQuestions() {
  console.log("Prepping Mintaka questions...")

  //if we haven't downloaded the Mintaka test set yet
  let mintakaTestQuestions:MintakaQuestionType[]
  const MINTAKA_FILE_PATH = './mintaka_test.json'
  if (fs.existsSync(MINTAKA_FILE_PATH)) {
    mintakaTestQuestions = JSON.parse(
      fs.readFileSync(MINTAKA_FILE_PATH).toString()
    )
  }
  else {
    console.log("Downloading Mintaka test set...")
    const MINTAKA_TEST_SET_URL = "https://github.com/amazon-science/mintaka/raw/main/data/mintaka_test.json"
    mintakaTestQuestions = await fetch(MINTAKA_TEST_SET_URL).then(r => r.json() as Promise<MintakaQuestionType[]>)
    fs.writeFile(MINTAKA_FILE_PATH, JSON.stringify(mintakaTestQuestions), err => {
      if (err) {
        console.error("Error saving Mintaka test set",err);
      } else {
        console.log("Saved Mintaka test set!")
      }
    })
  }
  console.log("Loaded Mintaka test set...")

  const curatedQuestions = await parseCSVFile<CuratedMintakaQuestionType>("./curatedMintakaQuestions.csv")
  const curatedQuestionsIdMap = curatedQuestions.reduce((map, question, order) => {
    map[question.id] = {
      order,
      question,
    }
    return map
  }, {} as Record<string,{
    order: number,
    question: CuratedMintakaQuestionType,
  }>)

  const filteredQuestions = mintakaTestQuestions.filter((mintakaQuestion) => {
    const matchingCuratedQuestion = curatedQuestionsIdMap[mintakaQuestion.id]
    if(matchingCuratedQuestion) {
      if(mintakaQuestion.question !== matchingCuratedQuestion.question.question) {
        console.log(mintakaQuestion.question)
        console.log(matchingCuratedQuestion.question.question)
        throw new Error(`Question ${mintakaQuestion.id} unexpectedly did not match`)
      }

      return true
    }
    return false
  }).sort((a,b) => {
    return curatedQuestionsIdMap[a.id].order - curatedQuestionsIdMap[b.id].order
  })
  if(filteredQuestions.length !== curatedQuestions.length) {
    throw new Error(`The lengths of filteredQuestions and curatedQuestions did not match`)
  }



  const questionsFileContent = `// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { MintakaQuestionType } from "./mintakaEvaluation";

export const QUESTIONS:MintakaQuestionType[] = ${JSON.stringify(filteredQuestions, undefined, 2)}`

  fs.writeFileSync("./questions.ts",questionsFileContent)
  console.log("Done prepping Mintaka questions!")
}
