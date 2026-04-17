import { useMemo, useState } from 'react';
import {
  Close,
  ExpandMore,
  Description,
  History,
  AttachFile,
  WarningAmber,
  PictureAsPdf,
  TableChart,
  Image,
  InsertDriveFile
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Chip,
  Drawer,
  IconButton,
  Tab,
  Tabs,
  Typography
} from '@mui/material';

const LEGAL_PHASE_TABS = ['FASE I', 'FASE II', 'FASE III', 'CIERRE'];

const FIELD_LABELS = {
  id: 'ID',
  process_id: 'ID Proceso',
  ues: 'UES',
  sede: 'Sede',
  expediente: 'Expediente',
  autoridad: 'Autoridad',
  current_legal_phase: 'Fase Legal Actual',
  legal_phases_actions: 'Fases Legales - Actuaciones',
  process_stage: 'Etapa del Proceso',
  cargo_description: 'Cargo',
  tema: 'Tema',
  colsubsidio_response: 'Radicado y Contenido de Respuesta Colsubsidio',
  CASE_NUMBER_AND_CONTENT_OF_RESPONSE: 'Radicado y Contenido de Respuesta Colsubsidio',
  estrategia: 'Estrategia',
  estimated_sanction_amount: 'Monto de la posible sancion'
};

const LONG_TEXT_FIELDS = [
  'legal_phases_actions',
  'cargo_description',
  'colsubsidio_response',
  'CASE_NUMBER_AND_CONTENT_OF_RESPONSE'
];

const EXECUTOR_BY_TYPE = {
  actuacion: ['Laura Gomez', 'Daniel Rojas', 'Mariana Torres'],
  respuesta: ['Andres Villalba', 'Paula Cardenas', 'Carolina Ramirez'],
  estrategia: ['Equipo Legal Colsubsidio']
};

const ATTACHMENT_CYCLE = [
  [
    { name: 'auto_apertura.pdf', type: 'pdf' },
    { name: 'matriz_seguimiento.xlsx', type: 'excel' }
  ],
  [
    { name: 'respuesta_descargos.docx', type: 'word' },
    { name: 'evidencia_visita_01.jpg', type: 'image' }
  ],
  [{ name: 'acta_reunion.pdf', type: 'pdf' }],
  [
    { name: 'consolidado_pruebas.xlsx', type: 'excel' },
    { name: 'anexo_fotografico.png', type: 'image' }
  ]
];

const normalizeText = (value) => String(value ?? '').split('\u000b').join(' ').trim();

const detectPhaseBucket = (textValue = '') => {
  const normalized = normalizeText(textValue).toUpperCase();

  if (normalized.includes('CIERRE')) {
    return 'CIERRE';
  }

  if (normalized.includes('FASE III')) {
    return 'FASE III';
  }

  if (normalized.includes('FASE II')) {
    return 'FASE II';
  }

  if (normalized.includes('FASE I')) {
    return 'FASE I';
  }

  return 'FASE I';
};

const getPhaseFromAction = (actionText = '') => {
  const phaseMatch = normalizeText(actionText).match(/(FASE\s+[IVX]+\s*:\s*[^\r\n]+)/i);
  return phaseMatch ? phaseMatch[1].toUpperCase() : 'FASE SIN CLASIFICAR';
};

const splitLines = (value = '') =>
  normalizeText(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const formatMockDate = (seed) => {
  const day = ((seed * 3) % 27) + 1;
  const month = (seed % 12) + 1;
  const year = 2026;

  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
};

const getMockEntryMeta = (type, index) => {
  const users = EXECUTOR_BY_TYPE[type] || EXECUTOR_BY_TYPE.actuacion;
  const actor = users[index % users.length];
  const attachments = ATTACHMENT_CYCLE[index % ATTACHMENT_CYCLE.length];

  return {
    actor,
    timestamp: formatMockDate(index + 1),
    attachments
  };
};

const attachmentIconByType = {
  pdf: PictureAsPdf,
  excel: TableChart,
  word: Description,
  image: Image,
  default: InsertDriveFile
};

const buildPhaseLogs = (selectedProcess) => {
  const actionsLines = splitLines(selectedProcess?.legal_phases_actions);
  const grouped = {
    'FASE I': [],
    'FASE II': [],
    'FASE III': [],
    CIERRE: []
  };

  actionsLines.forEach((line, index) => {
    const phase = detectPhaseBucket(getPhaseFromAction(line));
    const metadata = getMockEntryMeta('actuacion', index);

    grouped[phase].push({
      id: `${phase}-action-${index + 1}`,
      type: 'actuacion',
      content: line,
      actor: metadata.actor,
      timestamp: metadata.timestamp,
      attachments: metadata.attachments
    });
  });

  const responseContent =
    selectedProcess?.CASE_NUMBER_AND_CONTENT_OF_RESPONSE || selectedProcess?.colsubsidio_response;

  const responseLines = splitLines(responseContent);
  responseLines.forEach((line, index) => {
    const currentPhase = detectPhaseBucket(selectedProcess?.current_legal_phase || 'FASE I');
    const metadata = getMockEntryMeta('respuesta', index);

    grouped[currentPhase].push({
      id: `${currentPhase}-response-${index + 1}`,
      type: 'respuesta',
      content: line,
      actor: metadata.actor,
      timestamp: metadata.timestamp,
      attachments: metadata.attachments
    });
  });

  if (normalizeText(selectedProcess?.estrategia)) {
    const currentPhase = detectPhaseBucket(selectedProcess?.current_legal_phase || 'FASE I');
    const metadata = getMockEntryMeta('estrategia', 0);

    grouped[currentPhase].push({
      id: `${currentPhase}-strategy-1`,
      type: 'estrategia',
      content: `Estrategia: ${normalizeText(selectedProcess.estrategia)}`,
      actor: metadata.actor,
      timestamp: metadata.timestamp,
      attachments: metadata.attachments
    });
  }

  return grouped;
};

export default function SanctioningProcessesDrawer({
  open = false,
  handleClose = () => {},
  selectedProcess = null
}) {
  const processData = selectedProcess || {};

  const phaseLogs = useMemo(() => buildPhaseLogs(processData), [processData]);

  const [activeTab, setActiveTab] = useState(LEGAL_PHASE_TABS[0]);

  const normalizedTab = LEGAL_PHASE_TABS.includes(activeTab) ? activeTab : LEGAL_PHASE_TABS[0];
  const currentTabLogs = phaseLogs[normalizedTab] || [];

  const infoEntries = Object.entries(processData).filter(([, value]) =>
    String(value ?? '').trim() !== ''
  );

  if (!selectedProcess) {
    return null;
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: {
            xs: '100vw',
            md: '70vw'
          },
          bgcolor: '#ffffff'
        }
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: '1px solid rgba(187, 201, 204, 0.35)',
          bgcolor: '#f8fafb'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box>
            <Chip
              label={`Expediente ${normalizeText(selectedProcess?.expediente || '-')}`}
              size="small"
              sx={{ mb: 1, bgcolor: 'rgba(0, 105, 113, 0.1)', color: '#006971', fontWeight: 700 }}
            />
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#191c1d' }}>
              Historial Detallado del Proceso
            </Typography>
            <Typography sx={{ color: '#3c494c', mt: 0.5 }}>
              Estado consolidado: {normalizeText(selectedProcess?.current_legal_phase || 'Sin fase definida')}
            </Typography>
          </Box>

          <IconButton onClick={handleClose} aria-label="close drawer">
            <Close />
          </IconButton>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Tabs
            value={normalizedTab}
            onChange={(_, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#006971' },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: '#006971 !important' }
            }}
          >
            {LEGAL_PHASE_TABS.map((phase) => (
              <Tab key={phase} label={phase} value={phase} />
            ))}
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        <Accordion sx={{ mb: 2, borderRadius: '12px !important', boxShadow: 0 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Description sx={{ color: '#006971' }} />
              <Typography sx={{ fontWeight: 700 }}>Informacion completa del registro</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                gap: 2,
                p: 2,
                bgcolor: '#f2f4f5',
                borderRadius: 2
              }}
            >
              {infoEntries.map(([key, value]) => (
                <Box
                  key={key}
                  sx={{
                    gridColumn: LONG_TEXT_FIELDS.includes(key) ? { xs: '1 / -1', sm: '1 / -1' } : 'auto'
                  }}
                >
                  <Typography sx={{ fontSize: '0.72rem', color: '#6c797c', fontWeight: 700 }}>
                    {(FIELD_LABELS[key] || key).toUpperCase()}
                  </Typography>

                  {LONG_TEXT_FIELDS.includes(key) ? (
                    <Box
                      sx={{
                        mt: 0.7,
                        px: 1.25,
                        py: 1,
                        bgcolor: '#ffffff',
                        borderRadius: 1.5,
                        border: '1px solid rgba(187, 201, 204, 0.35)',
                        maxHeight: 190,
                        overflowY: 'auto'
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: '0.84rem',
                          lineHeight: 1.6,
                          color: '#191c1d',
                          whiteSpace: 'pre-line',
                          textAlign: 'justify'
                        }}
                      >
                        {normalizeText(value || '-')}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography sx={{ fontSize: '0.9rem', color: '#191c1d', whiteSpace: 'pre-line' }}>
                      {key === 'estimated_sanction_amount'
                        ? new Intl.NumberFormat('es-CO', {
                            style: 'currency',
                            currency: 'COP',
                            maximumFractionDigits: 0
                          }).format(Number(value || 0))
                        : normalizeText(value || '-')}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion sx={{ borderRadius: '12px !important', boxShadow: 0 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: '#006971' }} />
              <Typography sx={{ fontWeight: 700 }}>Bitacora por fase legal</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {currentTabLogs.length === 0 ? (
              <Typography sx={{ color: '#6c797c' }}>
                No hay eventos registrados para {normalizedTab}.
              </Typography>
            ) : (
              <Box
                sx={{
                  position: 'relative',
                  pl: 1,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 18,
                    top: 8,
                    bottom: 8,
                    width: '2px',
                    bgcolor: '#e6e8e9'
                  }
                }}
              >
                {currentTabLogs.map((entry, index) => {
                  const title =
                    entry.type === 'actuacion'
                      ? `Actuacion ${index + 1}`
                      : entry.type === 'respuesta'
                      ? 'Carga de documentos / respuesta'
                      : 'Alerta / estrategia';

                  const entryAttachments = entry.attachments || [];

                  const nodeIcon =
                    entry.type === 'actuacion' ? (
                      <History sx={{ color: '#006971', fontSize: 16 }} />
                    ) : entry.type === 'respuesta' ? (
                      <AttachFile sx={{ color: '#006971', fontSize: 16 }} />
                    ) : (
                      <WarningAmber sx={{ color: '#b81d27', fontSize: 16 }} />
                    );

                  return (
                    <Box key={entry.id} sx={{ position: 'relative', pl: 6, mb: 2.5 }}>
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 4,
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          bgcolor: entry.type === 'estrategia' ? 'rgba(255, 137, 131, 0.25)' : 'rgba(50, 188, 200, 0.15)',
                          border: '4px solid #fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1
                        }}
                      >
                        {nodeIcon}
                      </Box>

                      <Box sx={{ p: 2, bgcolor: '#f2f4f5', borderRadius: 2, border: '1px solid rgba(187, 201, 204, 0.2)' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                          <Typography sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#191c1d', textTransform: 'uppercase' }}>
                            {title}
                          </Typography>
                          <Typography sx={{ fontSize: '0.68rem', color: '#6c797c', fontWeight: 600 }}>
                            {entry.timestamp}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar sx={{ width: 20, height: 20, bgcolor: '#006971', fontSize: '0.65rem' }}>
                            {normalizeText(entry.actor || 'S').charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography sx={{ fontSize: '0.75rem', color: '#3c494c', fontWeight: 600 }}>
                            {entry.actor}
                          </Typography>
                        </Box>

                        <Typography sx={{ color: '#3c494c', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                          {entry.content}
                        </Typography>

                        <Box sx={{ mt: 1.5 }}>
                          <Typography sx={{ fontSize: '0.68rem', color: '#6c797c', fontWeight: 700, mb: 0.8 }}>
                            ADJUNTOS ({entryAttachments.length})
                          </Typography>

                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                            {entryAttachments.map((file, fileIndex) => {
                              const FileIcon = attachmentIconByType[file.type] || attachmentIconByType.default;

                              return (
                                <Chip
                                  key={`${entry.id}-file-${fileIndex}`}
                                  icon={<FileIcon sx={{ fontSize: 16 }} />}
                                  label={file.name}
                                  size="small"
                                  sx={{
                                    bgcolor: '#ffffff',
                                    border: '1px solid rgba(187, 201, 204, 0.45)',
                                    color: '#3c494c',
                                    '& .MuiChip-label': { fontSize: '0.7rem', fontWeight: 600 }
                                  }}
                                />
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
    </Drawer>
  );
}
