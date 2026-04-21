import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

const ESTADO_COLORS = {
  'En proceso':       { bg: '#e3f2fd', color: '#1565c0' },
  'Pendiente Trámitar': { bg: '#fff3e0', color: '#f57c00' },
  'Otorgado':         { bg: '#e8f5e9', color: '#2e7d32' },
  'Cerrado':          { bg: '#eceff1', color: '#455a64' },
  'Desistido':        { bg: '#ffebee', color: '#b71c1c' }
};

const SEMAFORO_COLOR = {
  verde:    '#4caf50',
  amarillo: '#ffc107',
  rojo:     '#f44336'
};

const SEMAFORO_LABEL = {
  verde:    'Sin desviaciones',
  amarillo: 'Desviaciones atendibles',
  rojo:     'Desviaciones que aumentan tiempo'
};

const COLUMNS = [
  { key: 'SEMAFORO AMBIENTAL',   label: 'Sem.',     width: 40  },
  { key: 'UNIDAD',               label: 'Unidad',   width: 110 },
  { key: 'SEDE',                 label: 'Sede',     width: 160 },
  { key: 'TIPO DE PERMISO',      label: 'Tipo de permiso',  width: 200 },
  { key: 'TIPO DE TRÁMITE',      label: 'Tipo de trámite',  width: 160 },
  { key: 'ACTO ADMINISTRATIVO INICIAL', label: 'Acto adm. inicial', width: 200 },
  { key: 'EXPEDIENTE',           label: 'Expediente', width: 130 },
  { key: 'FECHA DE RADICACIÓN DEL PERMISO', label: 'F. radicación', width: 120 },
  { key: 'NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL', label: 'N.° radicado solicitud', width: 180 },
  { key: 'FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO', label: 'F. proyectada otorgamiento', width: 150 },
  { key: 'ESTADO DEL TRÁMITE',   label: 'Estado',   width: 150 }
];

function SemaforoCell({ value }) {
  const color = SEMAFORO_COLOR[value] || '#90a4ae';
  const label = SEMAFORO_LABEL[value] || value || '—';
  return (
    <Tooltip title={label} placement="right">
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          bgcolor: color,
          mx: 'auto'
        }}
      />
    </Tooltip>
  );
}

function EstadoCell({ value }) {
  const cfg = ESTADO_COLORS[value] || { bg: '#f5f5f5', color: '#546e7a' };
  return (
    <Chip
      label={value || '—'}
      size="small"
      sx={{
        fontSize: '0.68rem',
        fontWeight: 700,
        bgcolor: cfg.bg,
        color: cfg.color,
        height: 22,
        borderRadius: '4px'
      }}
    />
  );
}

export default function AmbientalPermitTable({ items }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        height: '100%',
        overflow: 'auto',
        borderRadius: 0,
        '& .MuiTableCell-root': { py: 1, px: 1.5 },
        '&::-webkit-scrollbar': { height: 6, width: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: '#b0bec5', borderRadius: 3 }
      }}
    >
      <Table stickyHeader size="small" sx={{ minWidth: 1600 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell
                key={col.key}
                sx={{
                  width: col.width,
                  minWidth: col.width,
                  bgcolor: '#f5f7fa',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  color: '#455a64',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  borderBottom: '2px solid #e0e6ed',
                  whiteSpace: 'nowrap'
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 4 }}>
                <Typography sx={{ fontSize: '0.85rem', color: '#90a4ae' }}>
                  No hay trámites con los filtros seleccionados
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, idx) => (
              <TableRow
                key={item.id}
                sx={{
                  bgcolor: idx % 2 === 0 ? '#ffffff' : '#fafbfc',
                  '&:hover': { bgcolor: '#f0f4ff' },
                  transition: 'background-color 0.15s'
                }}
              >
                {COLUMNS.map((col) => (
                  <TableCell key={col.key} sx={{ fontSize: '0.78rem', color: '#37474f' }}>
                    {col.key === 'SEMAFORO AMBIENTAL' ? (
                      <SemaforoCell value={item[col.key]} />
                    ) : col.key === 'ESTADO DEL TRÁMITE' ? (
                      <EstadoCell value={item[col.key]} />
                    ) : (
                      <Typography
                        sx={{
                          fontSize: '0.78rem',
                          color: item[col.key] ? '#37474f' : '#cfd8dc',
                          fontStyle: item[col.key] ? 'normal' : 'italic'
                        }}
                        noWrap
                      >
                        {item[col.key] || '—'}
                      </Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
