// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

export const isKey = <T extends object>(
    x: T,
    k: PropertyKey
): k is keyof T => {
    return k in x;
}
