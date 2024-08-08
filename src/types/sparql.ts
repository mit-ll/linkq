// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

//you could alternatively use the SparqlResults interface from "wikibase-sdk"

export type SparqlResultsJsonType = {
  "head": {
    "vars": string[] //ex "property", "propertyLabel", ...
  },
  "results": {
    "bindings": SparqlBindingType[]
  }
}

export type SparqlBindingType = {
  [key:string]: SparqlValueObjectType
}

export type SparqlValueObjectType = {
  "datatype"?: string //"http://www.w3.org/2001/XMLSchema#dateTime",
  "xml:lang"?: string //"en",
  "type": string //"literal",
  "value": string //"Larry Page"
}