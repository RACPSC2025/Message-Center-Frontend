import { CheckCircle, Edit, TableChart, ViewWeek, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import TableComponent from '../../components/TableComponent';
import { selectAppliedFilterModel } from '../../stores/filterSlice';
import {
  PERMIT_INITIAL_VISIBLE_COLUMNS,
  PERMIT_ROWS,
  PERMIT_TABLE_COLUMNS,
  STATUS_META
} from './permitManagerData';
import PermitManagerDrawer from './PermitManagerDrawer';
import PermitManagerKanban from './PermitManagerKanban';

const PAGE_OPTIONS = [20, 50, 100];
const VIEW_TABS = [
  { id: 'tabla', label: 'Tabla', Icon: TableChart },
  { id: 'kanban', label: 'Kanban', Icon: ViewWeek }
];
const HEADER_PLACEHOLDER_FILTERS = ['Negocio', 'Compañía', 'Región', 'Ubicación'];

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function formatTableDate(dateValue) {
  if (!dateValue) {
    return 'N/A';
  }

  const parsedDate = dayjs(dateValue);
  if (!parsedDate.isValid()) {
    return dateValue;
  }

  return parsedDate.format('DD MMM, YYYY');
}

function PermitManager() {
  const { t } = useTranslation();
  const [selectedView, setSelectedView] = useState('kanban');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const filterData = useSelector((state) => selectAppliedFilterModel(state, 'permit_manager'));

  const filteredPermits = useMemo(() => {
    let result = PERMIT_ROWS;

    const keyword = normalizeText(filterData?.filter_keywords);
    if (keyword) {
      result = result.filter((row) =>
        [
          row.unidad,
          row.sede,
          row.tipoPermiso,
          row.tipoTramite,
          row.expediente,
          row.autoridad,
          row.actoAdministrativoInicial,
          row.numeroRadicadoSolicitudAutoridad,
          row.estadoTramite
        ]
          .map((value) => normalizeText(value))
          .some((value) => value.includes(keyword))
      );
    }

    if (filterData?.filter_unit) {
      result = result.filter((row) => row.unidad === filterData.filter_unit);
    }

    if (filterData?.filter_sede) {
      result = result.filter((row) => row.sede === filterData.filter_sede);
    }

    if (filterData?.filter_permit_type) {
      result = result.filter((row) => row.tipoPermiso === filterData.filter_permit_type);
    }

    if (filterData?.filter_authority) {
      result = result.filter((row) => row.autoridad === filterData.filter_authority);
    }

    if (filterData?.filter_status) {
      result = result.filter((row) => row.estadoTramite === filterData.filter_status);
    }

    return result;
  }, [filterData]);

  const permitCount = filteredPermits.length;

  const columnDefs = useMemo(
    () =>
      PERMIT_TABLE_COLUMNS.map((column) => {
        switch (column.field) {
          case 'actions':
            return {
              ...column,
              cellRenderer: () => (
                <Stack direction="row" spacing={0.25} alignItems="center">
                  <Tooltip title={t('permit_manager_view', { defaultValue: 'Ver detalle' })}>
                    <IconButton size="small">
                      <Visibility fontSize="small" sx={{ color: '#0B7A84' }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('permit_manager_edit', { defaultValue: 'Editar permiso' })}>
                    <IconButton size="small">
                      <Edit fontSize="small" sx={{ color: '#52627A' }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )
            };
          case 'expediente':
            return {
              ...column,
              cellRenderer: (params) => (
                <span style={{ color: '#0F172A', fontWeight: 700 }}>{params.value || 'N/A'}</span>
              )
            };
          case 'estadoTramite':
            return {
              ...column,
              cellRenderer: (params) => {
                const statusMeta = STATUS_META[params.data.statusKey] || STATUS_META.in_process;
                return (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius: '50%',
                        bgcolor: statusMeta.dotColor
                      }}
                    />
                    <span style={{ color: '#0F172A', fontWeight: 600 }}>{params.value}</span>
                  </Box>
                );
              }
            };
          case 'fechaRadicacionPermiso':
          case 'fechaProyectadaOtorgamiento':
            return {
              ...column,
              cellRenderer: (params) => (
                <Typography sx={{ color: '#334155', fontWeight: 500 }}>
                  {formatTableDate(params.value)}
                </Typography>
              )
            };
          default:
            return column;
        }
      }),
    [t]
  );

  const handleOpenDrawer = (permit) => {
    setSelectedPermit(permit);
    setDrawerOpen(true);
  };

  return (
    <BaseFeaturePageLayout>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 3 },
            py: 1,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #EDF2F4',
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            {HEADER_PLACEHOLDER_FILTERS.map((label) => (
              <FormControl key={label} size="small" sx={{ minWidth: 94 }}>
                <Select
                  value=""
                  displayEmpty
                  onChange={() => {}}
                  sx={{
                    height: '40px',
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#C7D1DB' },
                    color: '#5E6B78',
                    fontSize: '0.88rem',
                    bgcolor: '#FFFFFF'
                  }}
                  renderValue={() => <span style={{ color: '#5E6B78' }}>{label}</span>}
                >
                  <MenuItem value="">{label}</MenuItem>
                </Select>
              </FormControl>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={() => {}}
              sx={{
                height: '40px',
                px: 2,
                borderRadius: '4px',
                borderColor: '#62D5F5',
                color: '#00BCD4',
                fontWeight: 800,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                '&:hover': {
                  borderColor: '#62D5F5',
                  bgcolor: 'rgba(98,213,245,0.05)'
                }
              }}
            >
              Limpiar filtros
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.98rem',
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap'
                }}
              >
                {permitCount} trámite{permitCount !== 1 ? 's' : ''} encontrados
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3.5, alignItems: 'flex-end', pb: 0.5 }}>
              {VIEW_TABS.map(({ id, label, Icon }) => {
                const isActive = selectedView === id;

                return (
                  <Box
                    key={id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={() => setSelectedView(id)}
                  >
                    <Box sx={{ color: isActive ? '#F57C00' : '#B0BEC5', mb: 0.2 }}>
                      <Icon color={isActive ? 'warning' : 'action'} fontSize="medium" />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: isActive ? '#263238' : '#B0BEC5',
                        textTransform: 'capitalize'
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            px: { xs: 2, md: 3 },
            py: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {selectedView === 'tabla' ? (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #E7EDF4',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ flexGrow: 1, minHeight: 0, px: 2.5, pb: 2 }}>
                <TableComponent
                  rowData={filteredPermits}
                  columnDefs={columnDefs.map((column) =>
                    column.field === 'actions'
                      ? {
                          ...column,
                          cellRenderer: (params) => (
                            <Stack direction="row" spacing={0.25} alignItems="center">
                              <Tooltip title={t('permit_manager_view', { defaultValue: 'Ver detalle' })}>
                                <IconButton size="small" onClick={() => handleOpenDrawer(params.data)}>
                                  <Visibility fontSize="small" sx={{ color: '#0B7A84' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('permit_manager_edit', { defaultValue: 'Editar permiso' })}>
                                <IconButton size="small">
                                  <Edit fontSize="small" sx={{ color: '#52627A' }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          )
                        }
                      : column
                  )}
                  initialVisibleColumns={PERMIT_INITIAL_VISIBLE_COLUMNS}
                  totalRecord={filteredPermits.length}
                  filterable={true}
                  pagination={true}
                  perPage={20}
                  pageOption={PAGE_OPTIONS}
                />
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                border: '1px solid #E7EDF4',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                <PermitManagerKanban items={filteredPermits} onCardClick={handleOpenDrawer} />
              </Box>
            </Paper>
          )}
        </Box>

        <PermitManagerDrawer
          open={drawerOpen}
          item={selectedPermit}
          onClose={() => setDrawerOpen(false)}
        />
      </Box>
    </BaseFeaturePageLayout>
  );
}

export default PermitManager;
