import { Add, Edit, Visibility } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import TableComponent from '../../components/TableComponent';
import { selectAppliedFilterModel, selectFilterItemValue } from '../../stores/filterSlice';
import {
  PERMIT_INITIAL_VISIBLE_COLUMNS,
  PERMIT_TABLE_COLUMNS,
  STATUS_META
} from './permitManagerData';
import {
  createTramiteAmbiental,
  fetchTramitesAmbientales,
  updateTramiteAmbiental
} from '../../stores/permitManager/fetchPermitManagerSlice';
import PermitManagerDrawer from './PermitManagerDrawer';
import PermitManagerFormDrawer from './PermitManagerFormDrawer';
import PermitManagerKanban from './PermitManagerKanban';

const PAGE_OPTIONS = [20, 50, 100];

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

function buildNextRecordId(records) {
  const maxId = records.reduce((currentMax, record) => {
    const numericPart = Number(String(record.recordId ?? '').replace(/\D/g, '')) || 0;
    return Math.max(currentMax, numericPart);
  }, 0);

  return `PMR-${String(maxId + 1).padStart(4, '0')}`;
}

function PermitManager() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { data: apiPermits } = useSelector((state) => state.permitManager.tramitesList);
  const [permits, setPermits] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPermitId, setSelectedPermitId] = useState(null);
  const [formDrawerOpen, setFormDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [editingPermit, setEditingPermit] = useState(null);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const filterData = useSelector((state) => selectAppliedFilterModel(state, 'permit_manager'));
  const selectedView = useSelector(
    (state) => selectFilterItemValue(state, 'permit_manager', 'selectedPermitView') ?? 'kanban'
  );

  const apiParams = useMemo(() => {
    const params = { limit: 500 };
    if (filterData?.filter_unit) params.unidad = filterData.filter_unit;
    if (filterData?.filter_sede) params.sede = filterData.filter_sede;
    if (filterData?.filter_permit_type) params.tipo_permiso = filterData.filter_permit_type;
    if (filterData?.filter_authority) params.autoridad = filterData.filter_authority;
    if (filterData?.filter_status) params.estado_tramite = filterData.filter_status;
    if (filterData?.filter_semaforo) params.semaforo_status = filterData.filter_semaforo;
    return params;
  }, [
    filterData?.filter_unit,
    filterData?.filter_sede,
    filterData?.filter_permit_type,
    filterData?.filter_authority,
    filterData?.filter_status,
    filterData?.filter_semaforo
  ]);

  useEffect(() => {
    dispatch(fetchTramitesAmbientales(apiParams));
  }, [dispatch, apiParams]);

  useEffect(() => {
    setPermits(apiPermits);
  }, [apiPermits]);

  const filteredPermits = useMemo(() => {
    let result = permits;

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
  }, [filterData, permits]);

  const selectedPermit = useMemo(
    () => permits.find((permit) => permit.recordId === selectedPermitId) ?? null,
    [permits, selectedPermitId]
  );

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
          case 'semaforoColor':
            return {
              ...column,
              cellRenderer: (params) => {
                const hexColor = params.value || null;
                return (
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', height: '100%' }}>
                    <Tooltip title={params.data.semaforoDescription || ''} placement="top">
                      <Box
                        sx={{
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          bgcolor: hexColor || '#ffffff',
                          border: '1px solid #cfd8dc'
                        }}
                      />
                    </Tooltip>
                  </Box>
                );
              }
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
    setSelectedPermitId(permit.recordId);
    setDrawerOpen(true);
  };

  const handleOpenCreateDrawer = () => {
    setFormMode('create');
    setEditingPermit(null);
    setFormDrawerOpen(true);
    setOpenSpeedDial(false);
  };

  const handleOpenEditDrawer = (permit) => {
    setFormMode('edit');
    setEditingPermit(permit);
    setFormDrawerOpen(true);
  };

  const handleCloseFormDrawer = () => {
    setFormDrawerOpen(false);
    setEditingPermit(null);
  };

  const handleSubmitPermit = async (apiPayload) => {
    if (formMode === 'edit' && editingPermit?.id) {
      await dispatch(updateTramiteAmbiental({ id: editingPermit.id, ...apiPayload }));
    } else {
      await dispatch(createTramiteAmbiental(apiPayload));
    }
    dispatch(fetchTramitesAmbientales(apiParams));
    handleCloseFormDrawer();
  };

  const speedDialActions = [{ icon: <Add />, name: 'Crear permiso ambiental' }];

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
            flexGrow: 1,
            minHeight: 0,
            px: { xs: 2, md: 3 },
            pt: 0.5,
            pb: 2,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {selectedView === 'table' ? (
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
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenDrawer(params.data);
                                  }}
                                >
                                  <Visibility fontSize="small" sx={{ color: '#0B7A84' }} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('permit_manager_edit', { defaultValue: 'Editar permiso' })}>
                                <IconButton
                                  size="small"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleOpenEditDrawer(params.data);
                                  }}
                                >
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
          onClose={() => {
            setDrawerOpen(false);
            setSelectedPermitId(null);
          }}
        />

        <PermitManagerFormDrawer
          open={formDrawerOpen}
          mode={formMode}
          item={editingPermit}
          records={permits}
          onClose={handleCloseFormDrawer}
          onSubmit={handleSubmitPermit}
        />

        <SpeedDialComponent
          openSpeedDial={openSpeedDial}
          handleOpenSpeedDial={() => setOpenSpeedDial(true)}
          handleCloseSpeedDial={() => setOpenSpeedDial(false)}
          speedDialActions={speedDialActions}
          handleClick={() => {}}
          handleActionClick={handleOpenCreateDrawer}
        />
      </Box>
    </BaseFeaturePageLayout>
  );
}

export default PermitManager;
