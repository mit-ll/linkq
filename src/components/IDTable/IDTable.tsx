// Copyright (c) 2024 Massachusetts Institute of Technology
// SPDX-License-Identifier: MIT

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Table, Title } from "@mantine/core";

import { useAppSelector } from "redux/store";

import { IDTableEntitiesType } from "types/idTable";

import { useQueryGetIDTableEntitiesFromQuery } from "utils/knowledgeBase/getEntityData";

import styles from "./IDTable.module.scss"

export function IDTableContainer () {
    const queryValue = useAppSelector(state => state.queryValue.queryValue)

    const {data, error, isLoading} = useQueryGetIDTableEntitiesFromQuery(queryValue);

    if(!isLoading && !error && !data) {
        return null
    }

    const content = (() => {
        if(isLoading) {
            return <p>Loading...</p>
        }
        else if(error) {
            return <p>Error: {error.message}</p>
        }
        else if(data) {
            return <IDTable data={data}/>
        }
        else {
            return <p>No ID data</p>
        }
    })()

    return (
        <div id={styles["id-table-container"]}>
            <Title order={4}>Entity-Relation Table from KG</Title>
            {content}
        </div>
    )
}

function IDTable({data}:{data: IDTableEntitiesType[]}) {
    const columnHelper = createColumnHelper<IDTableEntitiesType>()

    const columns = [
        columnHelper.accessor("id",{}),
        columnHelper.accessor("label",{}),
        columnHelper.accessor("description",{}),
    ]

    const table = useReactTable({
        columns,
        data: data,
        getCoreRowModel: getCoreRowModel(),
    })

    return (
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
    )
}