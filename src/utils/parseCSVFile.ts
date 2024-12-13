// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import fs from "fs"
import papaparse from "papaparse"

export function parseCSVFile<T>(path:string):Promise<T[]> {
  return new Promise((resolve, reject) => {
    if(!fs.existsSync(path)) {
      return reject(new Error(`The path '${path}' does not exist`))
    }
    const file = fs.createReadStream(path)
    papaparse.parse<T>(file, {
      header: true,
      complete: function(results) {
        console.log(path, results.data[0])
        resolve(results.data)
      }
    })
  })
}