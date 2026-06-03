import {
  Delete,
  Edit,
  InfoOutlined,
  MapOutlined,
  Visibility
} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Slide,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import TableComponent from '../../components/TableComponent';
import { selectAppliedFilterModel } from '../../stores/filterSlice';
import {
  ENVIRONMENTAL_MONITORING_INITIAL_VISIBLE_COLUMNS,
  MONITORING_STATUS_META,
  environmentalMonitoringRows
} from './environmentalMonitoringData';

const PAGE_OPTIONS = [12, 20, 50, 100];
const MAP_ZOOM = 15;
const STATUS_ROW_COLORS = Object.freeze({
  compliant: '#2E7D32',
  pending: '#D97706',
  alert: '#C62828',
  scheduled: '#0B7A84'
});

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatDate(value) {
  if (!value) return 'N/A';

  const [year, month, day] = String(value).split('-');
  if (!year || !month || !day) return value;

  return `${day}/${month}/${year}`;
}

function EnvironmentalMonitoring() {
  const [selectedPoint, setSelectedPoint] = useState(environmentalMonitoringRows[0]);
  const [isMapVisible, setIsMapVisible] = useState(true);
  const filterData = useSelector((state) => selectAppliedFilterModel(state, 'environmental_monitoring'));

  const filteredRows = useMemo(() => {
    const keyword = normalizeText(filterData?.filter_keywords);

    return environmentalMonitoringRows.filter((row) => {
      if (
        keyword &&
        ![
          row.id,
          row.ues,
          row.sede,
          row.puntoDefinido,
          row.ubicacion,
          row.categoria,
          row.tipoAnalisis,
          row.estado,
          row.responsable
        ]
          .map(normalizeText)
          .some((value) => value.includes(keyword))
      ) {
        return false;
      }

      if (filterData?.filter_category && row.categoria !== filterData.filter_category) return false;
      if (filterData?.filter_year && !row.proximoMonitoreo.startsWith(filterData.filter_year)) return false;
      if (filterData?.filter_structure && row.ues !== filterData.filter_structure) return false;
      if (filterData?.filter_sede && row.sede !== filterData.filter_sede) return false;
      if (filterData?.filter_analysis_type && row.tipoAnalisis !== filterData.filter_analysis_type) return false;
      if (filterData?.filter_status && row.statusKey !== filterData.filter_status) return false;
      if (filterData?.level1 && row.ues !== filterData.level1) return false;
      if (filterData?.level4 && row.sede !== filterData.level4) return false;

      return true;
    });
  }, [filterData]);

  const columnDefs = useMemo(
    () => [
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 120,
        sortable: false,
        filter: false,
        cellStyle: (params) => ({
          borderLeft: `5px solid ${STATUS_ROW_COLORS[params.data?.statusKey] ?? '#CBD5E1'}`
        }),
        cellRenderer: (params) => (
          <Stack direction="row" spacing={0.25} alignItems="center">
            <Tooltip title="Ver punto">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  handleViewPoint(params.data);
                }}
              >
                <Visibility fontSize="small" sx={{ color: '#008A98' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar punto">
              <IconButton size="small" onClick={(event) => event.stopPropagation()}>
                <Edit fontSize="small" sx={{ color: '#52627A' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar punto">
              <IconButton size="small" onClick={(event) => event.stopPropagation()}>
                <Delete fontSize="small" sx={{ color: '#008A98' }} />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      },
      {
        field: 'uesSede',
        headerName: 'UES / SEDE',
        minWidth: 210,
        flex: 1.05,
        cellRenderer: (params) => (
          <Box sx={{ lineHeight: 1.15 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
              {params.data.sede}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#64748B' }}>{params.data.ues}</Typography>
          </Box>
        )
      },
      {
        field: 'puntoDefinido',
        headerName: 'PUNTO DEFINIDO',
        minWidth: 220,
        flex: 1.15,
        cellRenderer: (params) => (
          <Box sx={{ lineHeight: 1.15 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
              {params.value}
            </Typography>
            <Typography sx={{ fontSize: 11, color: '#64748B' }}>{params.data.ubicacion}</Typography>
          </Box>
        )
      },
      {
        field: 'categoria',
        headerName: 'CATEGORÍA',
        minWidth: 130,
        cellRenderer: (params) => (
          <Chip
            size="small"
            label={params.value}
            sx={{
              height: 22,
              bgcolor: '#EEF4FF',
              color: '#263A5D',
              fontWeight: 700,
              fontSize: 11
            }}
          />
        )
      },
      {
        field: 'tipoAnalisis',
        headerName: 'TIPO ANÁLISIS',
        minWidth: 180
      },
      {
        field: 'estado',
        headerName: 'ESTADO',
        minWidth: 150,
        cellRenderer: (params) => {
          const meta = MONITORING_STATUS_META[params.data.statusKey] ?? MONITORING_STATUS_META.pending;
          return (
            <Chip
              size="small"
              label={meta.label}
              sx={{
                height: 24,
                bgcolor: meta.background,
                color: meta.color,
                fontWeight: 800,
                fontSize: 11,
                textTransform: 'uppercase'
              }}
            />
          );
        }
      },
      {
        field: 'parametros',
        headerName: 'PARÁMETROS',
        minWidth: 140
      },
      {
        field: 'fechaUltimoMonitoreo',
        headerName: 'ÚLTIMO MONITOREO',
        minWidth: 170,
        cellRenderer: (params) => formatDate(params.value)
      },
      {
        field: 'proximoMonitoreo',
        headerName: 'PRÓXIMO MONITOREO',
        minWidth: 170,
        cellRenderer: (params) => (
          <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            {formatDate(params.value)}
          </Typography>
        )
      },
      {
        field: 'responsable',
        headerName: 'RESPONSABLE',
        minWidth: 180
      }
    ],
    []
  );

  const selectedPointMapUrl = selectedPoint
    ? `https://maps.google.com/maps?q=${selectedPoint.lat},${selectedPoint.lng}&z=${MAP_ZOOM}&output=embed`
    : '';

  const handleViewPoint = (point) => {
    setSelectedPoint(point);
    setIsMapVisible(true);
  };

  const handleCloseMap = () => {
    setIsMapVisible(false);
  };

  return (
    <BaseFeaturePageLayout>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          p: { xs: 2, md: 3 },
          bgcolor: '#F6F8FA',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: selectedPoint
              ? { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)' }
              : '1fr',
            gap: 2,
            flexGrow: 1,
            minHeight: 0
          }}
        >
          <Paper
            elevation={0}
            sx={{
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #E0E7EF',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: '#FFFFFF'
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E7EDF4' }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <InfoOutlined sx={{ color: '#008A98', fontSize: 20 }} />
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                  Lista de Puntos de Monitoreo
                </Typography>
              </Stack>
              <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                {filteredRows.length} puntos encontrados
              </Typography>
            </Stack>

            <Box sx={{ flexGrow: 1, minHeight: 0, px: 1.5, pb: 1.5 }}>
              <TableComponent
                rowData={filteredRows}
                columnDefs={columnDefs}
                initialVisibleColumns={ENVIRONMENTAL_MONITORING_INITIAL_VISIBLE_COLUMNS}
                totalRecord={filteredRows.length}
                filterable={true}
                pagination={true}
                perPage={12}
                pageOption={PAGE_OPTIONS}
              />
            </Box>
          </Paper>

          {selectedPoint && (
            <Slide
              in={isMapVisible}
              direction="left"
              timeout={280}
              mountOnEnter
              unmountOnExit
              onExited={() => setSelectedPoint(null)}
            >
            <Paper
              elevation={0}
              sx={{
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid #E0E7EF',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: '#FFFFFF'
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, borderBottom: '1px solid #E7EDF4' }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <MapOutlined sx={{ color: '#263A5D', fontSize: 22 }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A' }}>
                    Geovisor de Monitoreo
                  </Typography>
                </Stack>
                <IconButton
                  size="small"
                  aria-label="Cerrar geovisor"
                  onClick={handleCloseMap}
                  sx={{ color: '#475569' }}
                >
                  <Typography sx={{ fontSize: 20, fontWeight: 700, lineHeight: 1 }}>×</Typography>
                </IconButton>
              </Stack>

              <Box
                sx={{
                  position: 'relative',
                  flexGrow: 1,
                  minHeight: 360,
                  m: 1.5,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: '#E5E7EB'
                }}
              >
                <Box
                  component="iframe"
                  title={`Mapa de ${selectedPoint.puntoDefinido}`}
                  src={selectedPointMapUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 0
                  }}
                />

                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    right: 24,
                    top: 24,
                    width: 270,
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid rgba(15, 23, 42, 0.15)',
                    boxShadow: '0 12px 28px rgba(15, 23, 42, 0.18)'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 14,
                      right: 14,
                      width: 13,
                      height: 13,
                      borderRadius: '50%',
                      bgcolor: STATUS_ROW_COLORS[selectedPoint.statusKey] ?? '#CBD5E1',
                      border: '2px solid #FFFFFF',
                      boxShadow: '0 0 0 1px rgba(15, 23, 42, 0.12)'
                    }}
                  />
                  <Typography sx={{ fontWeight: 800, color: '#0F172A', mb: 0.25 }}>
                    {selectedPoint.puntoDefinido}
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 12, mb: 1.5 }}>
                    {selectedPoint.ubicacion}
                  </Typography>
                  {[
                    ['Sede', selectedPoint.sede],
                    ['UES', selectedPoint.ues],
                    ['Categoría', selectedPoint.categoria]
                  ].map(([label, value]) => (
                    <Stack
                      key={label}
                      direction="row"
                      justifyContent="space-between"
                      sx={{ py: 0.7, borderTop: '1px solid #EEF2F7' }}
                    >
                      <Typography sx={{ color: '#64748B', fontSize: 12 }}>{label}</Typography>
                      <Typography sx={{ color: '#0F172A', fontSize: 12, fontWeight: 700 }}>
                        {value}
                      </Typography>
                    </Stack>
                  ))}
                </Paper>

              </Box>
            </Paper>
            </Slide>
          )}
        </Box>
      </Box>
    </BaseFeaturePageLayout>
  );
}

export default EnvironmentalMonitoring;
