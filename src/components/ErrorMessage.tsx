// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

export function ErrorMessage({children}:{children: React.ReactNode}) {
  return <p style={{color:"red"}}>{children}</p>
}