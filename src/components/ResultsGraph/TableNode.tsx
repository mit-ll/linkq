import {useEffect} from "react";
import {
    DataGrid,
    GridColDef,
    GridRowParams,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
    useGridApiRef
} from "@mui/x-data-grid";
import {NodeData} from "@antv/g6";
import {Box, Typography} from "@mui/material";
import { RenderSPARQLValue } from "components/ResultsTable/ResultsTable";
import { SparqlValueObjectType } from "types/sparql";


type CustomRowType = {
    cell: SparqlValueObjectType,
    cellLabel?: SparqlValueObjectType,
}

interface NodeTableProps {
    node: NodeData,
    selectedRow?: number | null,
    handleRowSelection?: (params: GridRowParams) => void
}

const dataGridStyle = {
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    '& .highlight': {backgroundColor: '#edf4fc !important'}
}

interface DGTitle {
    title: string;
}

const DataGridTitle = ({title}: DGTitle) => {
    return (
        <Box style={{width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
            <Typography variant="h5">{title}</Typography>
        </Box>
    )
}

const CustomToolbar = ({title}: DGTitle) => {
    return (
        <GridToolbarContainer>
            <DataGridTitle title={title}/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarQuickFilter/>
        </GridToolbarContainer>
    );
}


export const NodeTable = ({node, selectedRow, handleRowSelection}: NodeTableProps) => {
    const apiRef = useGridApiRef();


    let rows:(
        CustomRowType & {
            id: string,
            key: string,
            index: number,
        }
    )[] = []
    let hasLabelColumn = false
    if (isTableNodeType(node)) {
        rows = node.data.rows.map((row, i) => {
            if(row.cellLabel) {
                hasLabelColumn = true
            }
            return {
                ...row,
                id: `${node.id}_${row.cell.value}_${i}`,
                key: `${node.id}_${row.cell.value}_${i}`,
                index: i,
            }
        });
    }

    const columns: GridColDef[] = [
        {
            field: 'cell', headerName: 'Value', width: 500,
            valueGetter: (cell: SparqlValueObjectType) => cell.value,
            renderCell: (item: { row: CustomRowType }) => {
                return <RenderSPARQLValue cell={item.row.cell}/>
            },
        },
    ];
    if(hasLabelColumn) {
        columns[0].width = 200
        columns.push({
            field: 'cellLabel', headerName: 'Label', width: 300,
            valueGetter: (cellLabel?:SparqlValueObjectType) => cellLabel?.value || "",
            renderCell: (item: { row: CustomRowType }) => {
                return <RenderSPARQLValue cell={item.row.cellLabel || item.row.cell}/>
            },
        },)
    }

    useEffect(() => {
        if (selectedRow !== undefined && selectedRow !== null) {
            apiRef.current.scrollToIndexes({rowIndex: selectedRow, colIndex: 0});
        }
    }, [apiRef, selectedRow]);


    return (
        <DataGrid
            apiRef={apiRef}
            rows={rows}
            columns={columns}
            onRowClick={handleRowSelection}
            getRowClassName={(params) => {
                return params.row.index === selectedRow ? 'highlight' : ''
            }}
            rowSelectionModel={[]}
            sx={dataGridStyle}
            slots={{toolbar: () => <CustomToolbar title={node.id}/>}}
            style={{background: "white"}}
        />
    );
}

export function isTableNodeType(node: NodeData):node is NodeData & { data: { rows: CustomRowType[] } } {
    return Array.isArray(node?.data?.rows)
}