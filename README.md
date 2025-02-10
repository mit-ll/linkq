# LinkQ: An LLM-Assisted Visual Interface for Knowledge Graph Question-Answering

IEEE VIS 2024 Paper: https://ieeexplore.ieee.org/document/10771088

Demo Site: https://mit-ll.github.io/linkq

[![Screenshot](/public/screenshot.png)](https://mit-ll.github.io/linkq)



Created with React + TypeScript + Vite

## Setup

1. Clone this repo
2. Install the necessary node packages
```
npm i
```
3. Get an API key from OpenAI https://openai.com/blog/openai-api
4. Duplicate `.env` and rename the new file to `.env.local`
5. Paste your API key into `.env.local`. DO NOT paste your API key into `.env`. It will be committed to the repo. `.env.local` will NOT be committed. You can read more about environment variables here https://vitejs.dev/guide/env-and-mode
6. Run the development server
```
npm run dev
```
7. Open the webapp in your browser at http://localhost:5173/


## Change KG Data Source
`src/utils/knowledgeBase` contains most of the code that you would have to change to switch to a different KG data source. There are also some types in `src/types/idTable.ts` and `src/types/resultsTable.ts` that would need to be changed.

## Citation
```
@INPROCEEDINGS{10771088,
  author={Li, Harry and Appleby, Gabriel and Suh, Ashley},
  booktitle={2024 IEEE Visualization and Visual Analytics (VIS)}, 
  title={LinkQ: An LLM-Assisted Visual Interface for Knowledge Graph Question-Answering}, 
  year={2024},
  volume={},
  number={},
  pages={116-120},
  keywords={Analytical models;Protocols;Limiting;Data analysis;Visual analytics;Large language models;Data visualization;Knowledge graphs;Writing;Data models;Knowledge graphs;large language models;query construction;question-answering;natural language interfaces},
  doi={10.1109/VIS55277.2024.00031}
}
```


## Disclaimer

DISTRIBUTION STATEMENT A. Approved for public release. Distribution is unlimited.

© 2024 MASSACHUSETTS INSTITUTE OF TECHNOLOGY

- Subject to FAR 52.227-11 – Patent Rights – Ownership by the Contractor (May 2014)
- SPDX-License-Identifier: MIT

This material is based upon work supported by the Under Secretary of Defense for Research and Engineering under Air Force Contract No. FA8702-15-D-0001. Any opinions, findings, conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the Under Secretary of Defense for Research and Engineering.

The software/firmware is provided to you on an As-Is basis.