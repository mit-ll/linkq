import {DataGrid, GridColDef, GridRowParams, GridToolbar} from "@mui/x-data-grid";
import {NodeData} from "@antv/g6";


interface NodeTableProps {
    node: NodeData,
    selectedRow?: number | null,
    handleRowSelection?: (params: GridRowParams) => void
}

const columns: GridColDef[] = [
    {field: 'idLabel', headerName: 'ID', width: 150},
    {field: 'uri', headerName: 'URI', width: 150},
    {field: 'label', headerName: 'Label', width: 150}
];


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
        }} rowSelectionModel={[]} sx={{'& .highlight': {backgroundColor: '#d3f9d8 !important'}}}
                  slots={{toolbar: GridToolbar}}
                  slotProps={{
                      toolbar: {
                          showQuickFilter: true,
                      },
                  }}/>
    );
}
