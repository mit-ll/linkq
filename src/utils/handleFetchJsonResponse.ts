// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

/**
 * This is a util function that
 * - If the response was successful, tries to parse the response body as JSON
 * - Else throw the error message
 * @param res the fetch response
 * @returns   JSON data, if the response was ok
 */
export async function handleFetchJsonResponse(res: Response) {
  if(!res.ok) { //if the response was not ok
    //get the response text then throw it as an error
    return res.text().then(text => { throw new Error(text) })
  }
  else {
    return res.json() //else parse the body as JSON
  }    
}