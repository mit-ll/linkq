// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import commonjs from 'vite-plugin-commonjs'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), commonjs(), tsconfigPaths()],
  base: process.env.GITHUB_PAGES==="true" ? "/linkq" : "",
  build: {
    commonjsOptions: { transformMixedEsModules: true },
    outDir: "./build",
  },
})
