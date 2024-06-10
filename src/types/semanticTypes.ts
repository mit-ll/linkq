// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT
export interface SemanticTriple
{
    subject: string;
    predicate: string;
    object: string;
}

export interface SemanticTripleQueryData
{
    triples: SemanticTriple[],
    variables: string[]
}
