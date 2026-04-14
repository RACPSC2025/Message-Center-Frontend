import {
  Edit,
  ErrorOutlineRounded,
  Visibility
} from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import TableComponent from '../../components/TableComponent';
import { PERMIT_ROWS, STATUS_META } from './permitManagerData';

const PAGE_OPTIONS = [20, 50, 100];

function formatTableDate(dateValue) {
  const parsedDate = dayjs(dateValue);
  if (!parsedDate.isValid()) {
    return '';
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
          <Box
            sx={{
              mt: 1.7
            }}
          >
            {footer}
          </Box>
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
  const filteredPermits = PERMIT_ROWS;

  const permitCount = filteredPermits.length;
  const activePermits = filteredPermits.filter((permit) => permit.status === 'approved').length;
  const inProgressPermits = filteredPermits.filter((permit) =>
    ['in_review', 'processing'].includes(permit.status)
  ).length;
  const totalRequirements = filteredPermits.reduce(
    (accumulator, permit) => accumulator + permit.requirementsTotal,
    0
  );
  const expiredRequirements = filteredPermits.reduce(
    (accumulator, permit) => accumulator + permit.expiredRequirements,
    0
  );
  const permitProgress = permitCount > 0
    ? Math.round(((activePermits + inProgressPermits) / permitCount) * 100)
    : 0;
  const requirementsProgress = totalRequirements > 0
    ? Math.round(((totalRequirements - expiredRequirements) / totalRequirements) * 100)
    : 0;

  const columnDefs = useMemo(
    () => [
      {
        field: 'permitId',
        headerName: 'ID',
        width: 132,
        pinned: 'left',
        cellRenderer: (params) => (
          <span style={{ color: '#5A6F93', fontWeight: 500 }}>#{params.value}</span>
        )
      },
      {
        field: 'permitNumber',
        headerName: 'Número',
        width: 190,
        pinned: 'left',
        cellRenderer: (params) => (
          <span style={{ color: '#0F172A', fontWeight: 700 }}>{params.value}</span>
        )
      },
      {
        field: 'applicant',
        headerName: 'Solicitante',
        minWidth: 260,
        flex: 1.8
      },
      {
        field: 'statusLabel',
        headerName: 'Estado de trámite',
        minWidth: 210,
        flex: 1.2,
        cellRenderer: (params) => {
          const statusMeta = STATUS_META[params.data.status] || STATUS_META.processing;
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
      },
      {
        field: 'requirementsTotal',
        headerName: 'Requisitos',
        minWidth: 135,
        maxWidth: 170,
        flex: 0.7,
        cellRenderer: (params) => (
          <Chip
            size="small"
            sx={{
              px: 0.5,
              borderRadius: '999px',
              bgcolor: '#E8F9FC',
              color: '#0B7A84',
              fontWeight: 700
            }}
            label={`${params.value} +`}
          />
        )
      },
      {
        field: 'dueDate',
        headerName: 'Vencimiento',
        minWidth: 170,
        flex: 1,
        cellRenderer: (params) => {
          const text =
            params.data.status === 'expired'
              ? t('expired', { defaultValue: 'Expired' })
              : formatTableDate(params.value);

          return (
            <Typography
              sx={{
                color: params.data.status === 'expired' ? '#D13F3F' : '#334155',
                fontWeight: params.data.status === 'expired' ? 700 : 500
              }}
            >
              {text}
            </Typography>
          );
        }
      },
      {
        field: 'actions',
        headerName: 'Acciones',
        width: 110,
        sortable: false,
        filter: false,
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
      }
    ],
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
              title={t('permit_manager_created_title', { defaultValue: 'Permisos Creados' })}
              description={t('permit_manager_created_description', {
                defaultValue: 'Gestión activa de autorizaciones administrativas y licencias.'
              })}
              progressValue={permitProgress}
              progressColor="#0B7A84"
              ringValue={permitCount}
              ringCaption={t('permit_manager_total', { defaultValue: 'TOTAL' })}
              footer={
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                  <FooterDotStat color="#0B7A84" text={`${activePermits} Activos`} />
                  <FooterDotStat color="#CBD5E1" text={`${inProgressPermits} Trámite`} />
                </Stack>
              }
            />

            <SummaryCard
              title={t('permit_manager_requirements_title', {
                defaultValue: 'Requisitos Generados'
              })}
              description={t('permit_manager_requirements_description', {
                defaultValue: 'Control detallado de documentación técnica y legal obligatoria.'
              })}
              progressValue={requirementsProgress}
              progressColor="#F2B51D"
              ringValue={totalRequirements}
              ringCaption={t('permit_manager_items', { defaultValue: 'ITEMS' })}
              footer={
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.8 }}>
                    <ErrorOutlineRounded sx={{ fontSize: 18, color: '#E53935' }} />
                    <Typography sx={{ color: '#E53935', fontWeight: 800, fontSize: '0.98rem' }}>
                      {expiredRequirements} Vencidos
                    </Typography>
                  </Box>
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
