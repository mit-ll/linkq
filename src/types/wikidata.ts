// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
import type {Item} from "wikibase-sdk";

export type WikidataQueryResponseType = {
  "head": {
    "vars": string[] //ex "property", "propertyLabel", ...
  },
  "results": {
    "bindings": WikidataBindingType[]
  }
}

export type WikidataBindingType = {
  [key:string]: WikidataCellType
}

export type WikidataCellType = {
  "datatype"?: string //"http://www.w3.org/2001/XMLSchema#dateTime",
  "xml:lang"?: string //"en",
  "type": string //"literal",
  "value": string //"Larry Page"
}

export interface EntityDictionary {
  [key: string]: Item;
}
