// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

//from https://stackoverflow.com/a/18197341
export function downloadJson(filename:string, data:string) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:json;charset=utf-8,' + encodeURIComponent(data));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}