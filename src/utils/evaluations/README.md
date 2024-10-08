# LinkQ Evaluation on Wikidata using Mintaka

We conducted a quantitative evaluation with LinkQ on a subset of Wikidata questions from Mintaka (https://github.com/amazon-science/mintaka). Our curated subset of questions is in `./curatedMintakaQuestions.csv`. To run the evaluation yourself:

1. Run `./prepMintakaQuestions.ts` to download the Mintaka test set and filter for our curated questions bank.
2. You may need to set a user agent in `src/utils/knowledgeBase/runQuery.ts`, for example
```ts
headers: {
  'Accept': 'application/sparql-results+json',
  'User-Agent': '[your user agent]'
}
```
3. Run `./mintakaEvaluation.ts`, which runs the evaluation of LinkQ and the plain LLM on the same question bank.
4. Run `./calculateMintakaEvaluationMetrics.ts` to calculate the metrics.