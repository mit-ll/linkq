// Copyright (c) 2024 Massachusetts Institute of Technology

import { IriTerm, Triple, VariableTerm } from "sparqljs";

// SPDX-License-Identifier: MIT
export interface SemanticTriple extends Triple {
    predicate: IriTerm | VariableTerm;
}