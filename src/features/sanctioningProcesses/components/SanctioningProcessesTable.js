import { useMemo } from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { Visibility, Edit, AttachFile } from '@mui/icons-material';
import TableComponent from '../../../components/TableComponent';
import { getGravedadColor, getEstadoIcon, formatDate } from '../utils';

function SanctioningProcessesTable({ 
  data = [],
  onRowClick = null,
  onEdit = null,
  onView = null,
  onAttach = null,
  onRefresh = null,
  paginationData = null 
}) {
  // Configuración de columnas
  const columnDefs = useMemo(() => [
    {
      field: 'codigo',
      headerName: 'CÓDIGO / REQUISITO',
      width: 200,
      flex: 1,
      cellRenderer: (params) => (
        <Box sx={{ p: 1 }}>
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#212529' }}>
            {params.data.codigo}
          </Typography>

          <Typography sx={{ fontSize: '0.75rem', color: '#6c757d', mt: 0.5 }}>
            {params.data.norma_asociada}
          </Typography>
        </Box>
      )
    },
    {
      field: 'gravedad',
      headerName: 'GRAVEDAD',
      width: 140,
      cellRenderer: (params) => {
        const colors = getGravedadColor(params.value);
        
        return (
          <Chip
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: colors.dot }} />
                {params.value.toUpperCase()}
              </Box>
            }
            sx={{
              bgcolor: colors.bg,
              color: colors.color,
              fontWeight: 'bold',
              fontSize: '0.75rem',
              height: 24
            }}
            size="small"
          />
        );
      }
    },
    {
      field: 'estado',
      headerName: 'ESTADO ACTUAL',
      width: 180,
      cellRenderer: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getEstadoIcon(params.data.estado)}
          
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#212529' }}>
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'fecha_limite',
      headerName: 'FECHA LÍMITE',
      width: 150,
      type: 'dateColumn',
      filter: 'agDateColumnFilter',
      valueFormatter: (params) => formatDate(params.value),
      cellRenderer: (params) => (
        <Typography sx={{ 
          fontSize: '0.875rem', 
          fontWeight: 700, 
          color: params.data.estado === 'en_descargos' ? '#eab308' : '#006971',
          fontFamily: '"Inter", sans-serif'
        }}>
          {formatDate(params.value)}
        </Typography>
      )
    },
    {
      field: 'opciones',
      headerName: 'OPCIONES',
      width: 120,
      pinned: 'left',
      filter: false,  
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
    }
  ], []);
  
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
        columnDefs={columnDefs}
        pagination={true}
        pageOption={[paginationData?.page_size || 10]}
        sortable={true}
        filterable={true}
        resizable={true}
        autoHeight={true}
        onRowClicked={onRowClick}
        onRefresh={onRefresh}
      />
    </Box>
  );
}

export default SanctioningProcessesTable;
