// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { useAppSelector } from "redux/store"

import { IS_DEMO_MODE } from "utils/demoData"

export function ApiKeyWarning() {
  const apiKey = useAppSelector((state) => state.settings.apiKey)

  if(!apiKey && !IS_DEMO_MODE) {
    return (
      <div style={{
        color: "white", backgroundColor: "#333", 
        height: "100vh", width: "100vw",
        position: "absolute", top: 0, left: 0,
        display: "flex", justifyContent: "center", alignItems: "center",
        zIndex: 1,
      }}>
        <p>You need to configure the <code>VITE_OPENAI_API_KEY</code> environment variable in your <code>.env.local</code> file.</p>
      </div>
    )
  }
  
  return null
}