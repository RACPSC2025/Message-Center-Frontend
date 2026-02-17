import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { TableChart } from '@mui/icons-material';

const TableMessage = ({ table, tableIndex }) => {
  if (!table || !table.headers) {
    return null;
  }

  return (
    <Box sx={{ my: 2 }}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <TableChart color="primary" fontSize="small" />
        <Typography variant="subtitle2" color="primary">
          Tabla #{table.table_id || tableIndex + 1}
        </Typography>
        <Chip 
          label={`Página ${table.page}`} 
          size="small" 
          variant="outlined"
        />
        {table.confidence && (
          <Chip 
            label={`${Math.round(table.confidence)}% confianza`} 
            size="small" 
            color={table.confidence > 90 ? 'success' : 'warning'}
          />
        )}
      </Box>

      <TableContainer 
        component={Paper} 
        elevation={2}
        sx={{ 
          maxWidth: '100%',
          overflowX: 'auto',
          border: '1px solid #e0e0e0'
        }}
      >
        <Table size="small" sx={{ minWidth: 300 }}>
          {/* Headers */}
          {table.headers && table.headers.length > 0 && (
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                {table.headers.map((header, idx) => (
                  <TableCell 
                    key={idx}
                    sx={{ 
                      fontWeight: 'bold',
                      borderBottom: '2px solid #2196f3',
                      padding: '12px 16px',
                      whiteSpace: 'nowrap'
                    }}
                    rowSpan={header.row_span || 1}
                    colSpan={header.col_span || 1}
                  >
                    {header.text || '-'}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
          )}

          {/* Body */}
          <TableBody>
            {table.body && table.body.length > 0 ? (
              table.body.map((row, rowIdx) => (
                <TableRow 
                  key={rowIdx}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                    '&:hover': { backgroundColor: '#f0f0f0' }
                  }}
                >
                  {row.map((cell, cellIdx) => (
                    <TableCell 
                      key={cellIdx}
                      sx={{ 
                        padding: '10px 16px',
                        borderBottom: '1px solid #e0e0e0'
                      }}
                      rowSpan={cell.row_span || 1}
                      colSpan={cell.col_span || 1}
                    >
                      {cell.text || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.headers?.length || 1} align="center">
                  <Typography variant="body2" color="textSecondary">
                    Sin datos
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Información adicional */}
      {table.rows && table.cols && (
        <Box display="flex" gap={1} mt={1}>
          <Chip 
            label={`${table.rows} filas`} 
            size="small" 
            variant="outlined"
          />
          <Chip 
            label={`${table.cols} columnas`} 
            size="small" 
            variant="outlined"
          />
        </Box>
      )}
    </Box>
  );
};

export default TableMessage;