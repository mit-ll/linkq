import {
    DataGrid,
    GridColDef,
    GridRowParams,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarDensitySelector,
    GridToolbarFilterButton,
    GridToolbarQuickFilter
} from "@mui/x-data-grid";
import {NodeData} from "@antv/g6";
import {Box, Typography} from "@mui/material";


interface NodeTableProps {
    node: NodeData,
    selectedRow?: number | null,
    handleRowSelection?: (params: GridRowParams) => void
}

const columns: GridColDef[] = [
    {field: 'uri', headerName: 'URI', width: 200, type: "string", valueFormatter: (item: string) => item},
    {field: 'label', headerName: 'Label', width: 200, type: "string", valueFormatter: (item: string) => item},
];

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
            <GridToolbarColumnsButton/>
            <GridToolbarFilterButton/>
            <GridToolbarDensitySelector/>
            <GridToolbarQuickFilter/>
        </GridToolbarContainer>
    );
}


export const NodeTable = ({node, selectedRow, handleRowSelection}: NodeTableProps) => {
    let rows = []
    if (node?.data?.entries && Array.isArray(node.data.entries)) {
        rows = node.data.entries.map((entry, i) => {
            return {...entry, id: `${entry.id}_${entry.value}_${i}`, key: `${node.id}_${entry.value}_${i}`, index: i}
        });
    }

    return (
        <DataGrid rows={rows} columns={columns} onRowClick={handleRowSelection} getRowClassName={(params) => {
            return params.row.index === selectedRow ? 'highlight' : ''
        }} rowSelectionModel={[]} sx={dataGridStyle}
                  slots={{toolbar: () => <CustomToolbar title={node.id}/>}}
                  slotProps={{
                      toolbar: {
                          showQuickFilter: true,
                      },
                  }} style={{background: "white"}}/>
    );
}
