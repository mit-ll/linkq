// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { SparqlBindingType, SparqlValueObjectType, SparqlResultsJsonType } from "../../types/sparql";
import { useReactTable, flexRender, createColumnHelper, getCoreRowModel } from "@tanstack/react-table"
import { downloadJson } from "../../utils/downloadJson";

import { ActionIcon, Table } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';

import styles from "./ResultsTable.module.scss"

export function ResultsTable({data}:{data: SparqlResultsJsonType}) {
  const columnHelper = createColumnHelper<SparqlBindingType>()

  const columns = data.head.vars.map(c => columnHelper.accessor(
    row => row[c],
    {
      id: c,
      cell: info => <span>{renderCell(info.getValue())}</span>,
      header: () => <span>{c}</span>,
    }
  ))

  const table = useReactTable({
    columns,
    data: data.results.bindings,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div id={styles["results-table-container"]}>
      <ActionIcon id={styles["download-button"]} variant="filled" aria-label="Download Data" onClick={() => downloadJson("data.json", JSON.stringify(data, undefined, 2))}>
        <IconDownload/>
      </ActionIcon>
      

      <div id={styles["results-table-scroll-container"]}>
        <Table>
          <Table.Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map(row => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </div>
    </div>
  )
}

function renderCell(cell:SparqlValueObjectType):React.ReactNode {
  if(!cell) {
    return <code>undefined</code>
  }
  if(cell.datatype === "http://www.w3.org/2001/XMLSchema#dateTime") {
    return new Date(cell.value).toUTCString()
  }
  if(cell.type==="uri" && (
    cell.value.toLowerCase().endsWith(".jpg")
    || cell.value.toLowerCase().endsWith(".png")
  )) {
    return <img src={cell.value}/>
  }
  if(cell.type === "uri") {
    return <a href={cell.value} target="_blank">{cell.value.replace("http://www.wikidata.org/","")}</a>
  }
  return cell.value
}