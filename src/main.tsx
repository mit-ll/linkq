// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import '@mantine/core/styles.css';
import './index.css'

import { QueryClient, QueryClientProvider, } from '@tanstack/react-query'
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: Infinity,
    }
  }
})

import { createTheme, MantineProvider } from '@mantine/core';
const theme = createTheme({});

import { store } from './redux/store.ts'
import { Provider } from 'react-redux'


ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <App />
      </MantineProvider>
    </QueryClientProvider>
  </Provider>
)
