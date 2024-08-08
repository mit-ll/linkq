# LinkQ: An LLM-Assisted Visual Interface for Knowledge Graph Question-Answering

Arxiv Paper: https://arxiv.org/abs/2406.06621

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

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list


## Disclaimer

DISTRIBUTION STATEMENT A. Approved for public release. Distribution is unlimited.

© 2024 MASSACHUSETTS INSTITUTE OF TECHNOLOGY

- Subject to FAR 52.227-11 – Patent Rights – Ownership by the Contractor (May 2014)
- SPDX-License-Identifier: MIT

This material is based upon work supported by the Under Secretary of Defense for Research and Engineering under Air Force Contract No. FA8702-15-D-0001. Any opinions, findings, conclusions or recommendations expressed in this material are those of the author(s) and do not necessarily reflect the views of the Under Secretary of Defense for Research and Engineering.

The software/firmware is provided to you on an As-Is basis.