import { Edit, Visibility } from '@mui/icons-material';
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
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

function ProgressRing({ value, accentColor, displayValue, displayCaption = '' }) {
  const safeValue = Math.max(0, Math.min(value, 100));
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = safeValue / 100;
  const strokeDashoffset = circumference * (1 - progress);
  const displayText = String(displayValue ?? '');
  const numberFontSize = displayText.length >= 4 ? '1.3rem' : '1.75rem';

  return (
    <Box sx={{ position: 'relative', width: 110, height: 110 }}>
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={radius} fill="none" stroke="#E7EDF4" strokeWidth="8" />
        <circle
          cx="55"
          cy="55"
          r={radius}
          fill="none"
          stroke={accentColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 55 55)"
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Typography sx={{ fontSize: numberFontSize, fontWeight: 800, lineHeight: 1, color: accentColor }}>
          {displayText}
        </Typography>
        {displayCaption ? (
          <Typography sx={{ mt: 0.3, fontSize: '0.68rem', fontWeight: 800, color: '#64748B' }}>
            {displayCaption}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

function SummaryCard({
  title,
  description,
  progressValue,
  progressColor,
  ringValue,
  ringCaption,
  footer
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #E7EDF4',
        p: { xs: 2, md: 2.75 },
        minHeight: 132
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          minHeight: '100%'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
            {title}
          </Typography>
          <Typography
            sx={{
              mt: 0.45,
              fontSize: '0.92rem',
              lineHeight: 1.45,
              color: '#64748B'
            }}
          >
            {description}
          </Typography>
          <Box sx={{ mt: 1.7 }}>{footer}</Box>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            width: 132,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <ProgressRing
            value={progressValue}
            accentColor={progressColor}
            displayValue={ringValue}
            displayCaption={ringCaption}
          />
        </Box>
      </Box>
    </Paper>
  );
}

function FooterDotStat({ color, text }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography sx={{ color: '#1E293B', fontWeight: 700, fontSize: '0.98rem' }}>
        {text}
      </Typography>
    </Box>
  );
}

function PermitManager() {
  const { t } = useTranslation();
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
  const inProcessCount = filteredPermits.filter((permit) => permit.statusKey === 'in_process').length;
  const grantedCount = filteredPermits.filter((permit) => permit.statusKey === 'granted').length;
  const pendingCount = filteredPermits.filter((permit) => permit.statusKey === 'pending').length;
  const withdrawnCount = filteredPermits.filter((permit) => permit.statusKey === 'withdrawn').length;
  const activeCount = filteredPermits.filter((permit) =>
    ['in_process', 'pending'].includes(permit.statusKey)
  ).length;
  const totalUnits = new Set(filteredPermits.map((permit) => permit.unidad)).size;
  const recordProgress = permitCount > 0 ? Math.round((grantedCount / permitCount) * 100) : 0;
  const activeProgress = permitCount > 0 ? Math.round((activeCount / permitCount) * 100) : 0;

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
            px: { xs: 2, md: 3 },
            pt: 2.5,
            pb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
              gap: 2.5
            }}
          >
            <SummaryCard
              title={t('permit_manager_created_title', { defaultValue: 'Permisos Registrados' })}
              description={t('permit_manager_created_description', {
                defaultValue: 'Muestra anonimizada para seguimiento operativo por unidad y autoridad.'
              })}
              progressValue={recordProgress}
              progressColor="#0B7A84"
              ringValue={permitCount}
              ringCaption={t('permit_manager_total', { defaultValue: 'TOTAL' })}
              footer={
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <FooterDotStat color="#E8A126" text={`${inProcessCount} En proceso`} />
                  <FooterDotStat color="#0B7A84" text={`${grantedCount} Otorgados`} />
                </Stack>
              }
            />

            <SummaryCard
              title={t('permit_manager_active_title', { defaultValue: 'Trámites Activos' })}
              description={t('permit_manager_active_description', {
                defaultValue: 'Casos abiertos o pendientes priorizados para seguimiento.'
              })}
              progressValue={activeProgress}
              progressColor="#F2B51D"
              ringValue={activeCount}
              ringCaption={t('permit_manager_active', { defaultValue: 'ACTIVOS' })}
              footer={
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <FooterDotStat color="#D97706" text={`${pendingCount} Pendientes`} />
                  <FooterDotStat color="#64748B" text={`${withdrawnCount} Desistidos`} />
                  <FooterDotStat color="#CBD5E1" text={`${totalUnits} Unidades`} />
                </Stack>
              }
            />
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, minHeight: 0, px: { xs: 2, md: 3 }, pb: 2.5 }}>
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
                columnDefs={columnDefs}
                initialVisibleColumns={PERMIT_INITIAL_VISIBLE_COLUMNS}
                totalRecord={filteredPermits.length}
                filterable={true}
                pagination={true}
                perPage={20}
                pageOption={PAGE_OPTIONS}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </BaseFeaturePageLayout>
  );
}

export default PermitManager;
