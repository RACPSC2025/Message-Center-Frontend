import { useMemo } from 'react';
import { Box, IconButton } from '@mui/material';
import { Visibility, Edit, AttachFile } from '@mui/icons-material';
import TableComponent from '../../../components/TableComponent';
import { formatDate } from '../utils';

function SanctioningProcessesTable({ 
  data = [],
  columnDefs = [],
  initialVisibleFields = [],
  onRowClick = null,
  onEdit = null,
  onView = null,
  onAttach = null,
  onRefresh = null,
  paginationData = null 
}) {
  const mergedColumnDefs = useMemo(() => {
    const optionsColumn = {
      field: 'opciones',
      headerName: 'OPCIONES',
      width: 120,
      pinned: 'left',
      filter: false,
      sortable: false,
      cellRenderer: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            title="Ver detalles"
            size="small"
            sx={{ color: '#6c757d', '&:hover': { color: '#006971' } }}
            onClick={() => onView && onView(params.data)}
          >
            <Visibility />
          </IconButton>

          <IconButton
            title="Editar proceso"
            size="small"
            sx={{ color: '#6c757d', '&:hover': { color: '#006971' } }}
            onClick={() => onEdit && onEdit(params.data)}
          >
            <Edit />
          </IconButton>

          <IconButton
            title="Adjuntos"
            size="small"
            sx={{ color: '#6c757d', '&:hover': { color: '#006971' } }}
            onClick={() => onAttach && onAttach(params.data)}
          >
            <AttachFile />
          </IconButton>
        </Box>
      )
    };

    const apiColumns = (columnDefs || []).map((column) => {
      if (column.field === 'estimated_sanction_amount') {
        return {
          ...column,
          type: 'number',
          valueFormatter: (params) => {
            const rawValue = params?.value;
            const numericValue = Number(rawValue);

            if (!Number.isFinite(numericValue)) {
              return rawValue || '';
            }

            return new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
              maximumFractionDigits: 0
            }).format(numericValue);
          }
        };
      }

      if (column.field?.includes('date')) {
        return {
          ...column,
          valueFormatter: (params) => formatDate(params?.value)
        };
      }

      return column;
    });

    return [...apiColumns, optionsColumn];
  }, [columnDefs, onAttach, onEdit, onView]);

  const defaultVisibleFields = useMemo(() => {
    const baseFields = initialVisibleFields.length > 0
      ? initialVisibleFields
      : mergedColumnDefs
          .filter((column) => column.field !== 'opciones')
          .map((column) => column.field);

    return Array.from(new Set([...baseFields, 'opciones']));
  }, [initialVisibleFields, mergedColumnDefs]);
  
  return (
    <Box sx={{ 
      bgcolor: 'white', 
      borderRadius: 2, 
      boxShadow: 1, 
      overflow: 'hidden',
      height: 700,
      p: 2
    }}>
      <TableComponent
        rowData={data}
        columnDefs={mergedColumnDefs}
        pagination={true}
        pageOption={[paginationData?.page_size || 10]}
        sortable={true}
        filterable={true}
        resizable={true}
        autoHeight={true}
        initialVisibleColumns={defaultVisibleFields}
        onRowClicked={onRowClick}
        onRefresh={onRefresh}
      />
    </Box>
  );
}

export default SanctioningProcessesTable;
