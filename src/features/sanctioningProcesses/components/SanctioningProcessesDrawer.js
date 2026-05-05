import { useEffect, useMemo, useState } from 'react';
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
  Button,
  Box,
  Chip,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import FormBuilder from '../../../components/FormBuilder';

const DETAIL_TABS = {
  FORM: 'formulario',
  PHASES: 'fases',
  LOG: 'bitacora',
  NEW_LOG: 'nueva-bitacora'
};

const PHASE_OPTIONS = [
  'FASE 0',
  'FASE 1',
  'FASE 2',
  'FASE 3',
  'FASE 4',
  'FASE 5',
  'FASE 6',
  'FASE 7',
  'FASE 8',
  'FASE 9',
  'FASE 10',
  'FASE 11'
];

const ALL_PHASES_OPTION = 'Todas';

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

const FASE_FIELDS = {
  'FASE 0': [
    // Fase 0 – Indagación preliminar
    {
      id: 'preliminary_attachment',
      label: 'Adjunto',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 0 – Indagación preliminar'
    },
    {
      id: 'preliminary_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 0 – Indagación preliminar'
    }
  ],
  'FASE 1': [
    // Fase 1 – Auto de inicio
    {
      id: 'administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 1 – Auto de inicio'
    },
    {
      id: 'administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 1 – Auto de inicio'
    },
    {
      id: 'notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 1 – Auto de inicio'
    },
    {
      id: 'attached_document',
      label: 'Documento Adjunto',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 1 – Auto de inicio'
    },
    {
      id: 'opening_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 1 – Auto de inicio'
    },
    // A. Gestión de diligencias administrativas
    {
      id: 'administrative_diligences_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'A. Gestión de diligencias administrativas'
    },
    // B. Solicitud de cesación
    {
      id: 'cessation_request_office',
      label: 'Oficio de solicitud de cesación',
      type: 'text',
      required: false,
      gridSize: '6',
      section: 'B. Solicitud de cesación'
    },
    {
      id: 'cessation_request_date',
      label: 'Fecha',
      type: 'date',
      required: false,
      gridSize: '6',
      section: 'B. Solicitud de cesación'
    },
    {
      id: 'cessation_request_number',
      label: 'Número de Radicado',
      type: 'text',
      required: false,
      gridSize: '6',
      section: 'B. Solicitud de cesación'
    },
    {
      id: 'cessation_request_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'B. Solicitud de cesación'
    },
    // C. Respuesta a solicitud de cesación
    {
      id: 'cessation_response_office',
      label: 'Oficio de respuesta de la cesación',
      type: 'text',
      required: false,
      gridSize: '6',
      section: 'C. Respuesta a solicitud de cesación'
    },
    {
      id: 'cessation_response_date',
      label: 'Fecha',
      type: 'date',
      required: false,
      gridSize: '6',
      section: 'C. Respuesta a solicitud de cesación'
    },
    {
      id: 'cessation_response_number',
      label: 'Número de Radicado',
      type: 'text',
      required: false,
      gridSize: '6',
      section: 'C. Respuesta a solicitud de cesación'
    },
    {
      id: 'cessation_response_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'C. Respuesta a solicitud de cesación'
    }
  ],
  'FASE 2': [
    // Fase 2 – Auto de formulación de cargos
    {
      id: 'formulation_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 2 – Auto de formulación de cargos'
    },
    {
      id: 'formulation_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 2 – Auto de formulación de cargos'
    },
    {
      id: 'formulation_notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 2 – Auto de formulación de cargos'
    },
    {
      id: 'formulation_execution_date',
      label: 'Fecha de ejecutoria',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 2 – Auto de formulación de cargos'
    },
    {
      id: 'formulation_documents',
      label: 'Documentos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 2 – Auto de formulación de cargos'
    },
    {
      id: 'formulation_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 2 – Auto de formulación de cargos'
    }
  ],
  'FASE 3': [
    // Fase 3 – Descargos
    {
      id: 'discharge_documents',
      label: 'Documentos adjuntos (escrito de descargos, anexos técnicos o jurídicos)',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 3 – Descargos'
    },
    {
      id: 'discharge_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 3 – Descargos'
    }
  ],
  'FASE 4': [
    // Fase 4 – Auto de pruebas
    {
      id: 'test_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 4 – Auto de pruebas'
    },
    {
      id: 'test_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 4 – Auto de pruebas'
    },
    {
      id: 'test_notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 4 – Auto de pruebas'
    },
    {
      id: 'test_execution_date',
      label: 'Fecha de ejecutoria',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 4 – Auto de pruebas'
    },
    {
      id: 'test_documents',
      label: 'Documentos adjuntos (auto de pruebas, listado de pruebas admitidas)',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 4 – Auto de pruebas'
    },
    {
      id: 'test_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 4 – Auto de pruebas'
    }
  ],
  'FASE 5': [
    // Fase 5 – Periodo probatorio
    {
      id: 'probatory_documents',
      label: 'Documentos adjuntos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 5 – Periodo probatorio'
    },
    {
      id: 'probatory_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 5 – Periodo probatorio'
    }
  ],
  'FASE 6': [
    // Fase 6 – Auto de alegatos de conclusión
    {
      id: 'conclusion_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    },
    {
      id: 'conclusion_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    },
    {
      id: 'conclusion_notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    },
    {
      id: 'conclusion_execution_date',
      label: 'Fecha de ejecutoria',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    },
    {
      id: 'conclusion_documents',
      label: 'Documentos adjuntos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    },
    {
      id: 'conclusion_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 6 – Auto de alegatos de conclusión'
    }
  ],
  'FASE 7': [
    // Fase 7 – Presentación de alegatos de conclusión
    {
      id: 'conclusion_presentation_documents',
      label: 'Documentos adjuntos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 7 – Presentación de alegatos de conclusión'
    },
    {
      id: 'conclusion_presentation_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 7 – Presentación de alegatos de conclusión'
    }
  ],
  'FASE 8': [
    // Fase 8 – Resolución para los recursos en vía gubernativa
    {
      id: 'resource_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    },
    {
      id: 'resource_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    },
    {
      id: 'resource_notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    },
    {
      id: 'resource_execution_date',
      label: 'Fecha de ejecutoria',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    },
    {
      id: 'resource_documents',
      label: 'Documentos adjuntos (resolución de recursos, actas de trámite)',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    },
    {
      id: 'resource_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 8 – Resolución para los recursos en vía gubernativa'
    }
  ],
  'FASE 9': [
    // Fase 9 – Resolución que resuelve recursos en vía gubernativa
    {
      id: 'resolution_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: true,
      gridSize: '6',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    },
    {
      id: 'resolution_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    },
    {
      id: 'resolution_notification_date',
      label: 'Fecha de notificación',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    },
    {
      id: 'resolution_execution_date',
      label: 'Fecha de ejecutoria',
      type: 'date',
      required: true,
      gridSize: '6',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    },
    {
      id: 'resolution_documents',
      label: 'Documentos adjuntos (resolución de recursos, actas de trámite)',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    },
    {
      id: 'resolution_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 9 – Resolución que resuelve recursos en vía gubernativa'
    }
  ],
  'FASE 10': [
    // Fase 10 – Etapa de cumplimiento de órdenes
    {
      id: 'compliance_documents',
      label: 'Documentos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 10 – Etapa de cumplimiento de órdenes'
    },
    {
      id: 'compliance_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 10 – Etapa de cumplimiento de órdenes'
    }
  ],
  'FASE 11': [
    // Fase 11 – Cierre y archivo del expediente
    {
      id: 'closure_administrative_act',
      label: 'Acto administrativo',
      type: 'text',
      required: false,
      gridSize: '6',
      section: 'Fase 11 – Cierre y archivo del expediente'
    },
    {
      id: 'closure_administrative_act_date',
      label: 'Fecha de acto administrativo',
      type: 'date',
      required: false,
      gridSize: '6',
      section: 'Fase 11 – Cierre y archivo del expediente'
    },
    {
      id: 'closure_documents',
      label: 'Documentos adjuntos',
      type: 'file',
      required: false,
      gridSize: '12',
      section: 'Fase 11 – Cierre y archivo del expediente'
    },
    {
      id: 'closure_observations',
      label: 'Observaciones',
      type: 'textarea',
      required: false,
      gridSize: '12',
      section: 'Fase 11 – Cierre y archivo del expediente'
    }
  ]
};

const normalizeText = (value) => String(value ?? '').split('\u000b').join(' ').trim();

const detectPhaseBucket = (textValue = '') => {
  const normalized = normalizeText(textValue).toUpperCase();

  if (normalized.includes('CIERRE')) {
    return 'FASE 11';
  }

  const phaseMatch = normalized.match(/FASE\s+(11|10|9|8|7|6|5|4|3|2|1|0)/i);

  if (phaseMatch) {
    const phaseKey = `FASE ${phaseMatch[1].toUpperCase()}`;
    return PHASE_OPTIONS.includes(phaseKey) ? phaseKey : 'FASE 0';
  }

  return 'FASE 0';
};

const getPhaseFromAction = (actionText = '') => {
  const normalized = normalizeText(actionText).toUpperCase();
  const phaseMatch = normalized.match(/FASE\s+(11|10|9|8|7|6|5|4|3|2|1|0)/i);
  return phaseMatch ? `FASE ${phaseMatch[1].toUpperCase()}` : 'FASE 0';
};

const splitLines = (value = '') =>
  normalizeText(value)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const getEntryTimestampValue = (timestamp = '') => {
  const normalized = normalizeText(timestamp);
  const match = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return 0;
  }

  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
};

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
  const grouped = PHASE_OPTIONS.reduce((acc, phase) => {
    acc[phase] = [];
    return acc;
  }, {});

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
    const currentPhase = detectPhaseBucket(selectedProcess?.current_legal_phase || 'FASE 0');
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
    const currentPhase = detectPhaseBucket(selectedProcess?.current_legal_phase || 'FASE 0');
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

  const [activeDetailTab, setActiveDetailTab] = useState(DETAIL_TABS.FORM);
  const [selectedPhase, setSelectedPhase] = useState(() => {
    return selectedProcess ? detectPhaseBucket(selectedProcess?.current_legal_phase || '') : PHASE_OPTIONS[0];
  });
  const [bitacoraPhaseFilter, setBitacoraPhaseFilter] = useState(ALL_PHASES_OPTION);
  const [bitacoraDateFilter, setBitacoraDateFilter] = useState('');
  const [showBitacoraFilters] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [newLogAttachments, setNewLogAttachments] = useState([]);
  
  // Función para manejar la selección de archivos
  const handleSelectNewLogFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    setNewLogAttachments((prevFiles) => {
      const nextFiles = [...prevFiles];

      selectedFiles.forEach((newFile) => {
        const fileExists = nextFiles.some(
          (existingFile) => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size
        );

        if (!fileExists) {
          nextFiles.push(newFile);
        }
      });

      return nextFiles;
    });
  };

  // Función para eliminar un archivo
  const handleRemoveNewLogFile = (fileIndex) => {
    setNewLogAttachments((prevFiles) => 
      prevFiles.filter((_, index) => index !== fileIndex)
    );
  };

  useEffect(() => {
    setActiveDetailTab(DETAIL_TABS.FORM);
    const detectedPhase = detectPhaseBucket(selectedProcess?.current_legal_phase || '');
    setSelectedPhase(detectedPhase);
    setBitacoraPhaseFilter(ALL_PHASES_OPTION);
    setBitacoraDateFilter('');
    setFormValues({
      administrative_act: '',
      headquarters: normalizeText(selectedProcess?.sede || ''),
      origin: normalizeText(selectedProcess?.ues || ''),
      opening_reason: '',
      process_statement: ''
    });
  }, [selectedProcess]);

  const normalizedPhase = PHASE_OPTIONS.includes(selectedPhase) ? selectedPhase : PHASE_OPTIONS[0];

  const generalLogEntries = useMemo(() => {
    return PHASE_OPTIONS.reduce((acc, phase) => {
      const entries = phaseLogs[phase] || [];
      const mappedEntries = entries.map((entry) => ({
        ...entry,
        phase
      }));

      return [...acc, ...mappedEntries];
    }, []);
  }, [phaseLogs]);

  const filteredGeneralLogEntries = useMemo(() => {
    const phaseFiltered =
      bitacoraPhaseFilter === ALL_PHASES_OPTION
        ? generalLogEntries
        : generalLogEntries.filter((entry) => entry.phase === bitacoraPhaseFilter);

    if (!bitacoraDateFilter) {
      return phaseFiltered;
    }

    const dateParts = bitacoraDateFilter.split('-');
    if (dateParts.length !== 3) {
      return phaseFiltered;
    }

    const expectedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    return phaseFiltered.filter((entry) => entry.timestamp === expectedDate);
  }, [generalLogEntries, bitacoraPhaseFilter, bitacoraDateFilter]);

  const groupedFormFields = useMemo(() => {
    const fields = FASE_FIELDS[selectedPhase] || FASE_FIELDS['FASE 0'];
    
    const groups = {};
    fields.forEach(field => {
      const sectionName = field.section || 'Sin Sección';
      if (!groups[sectionName]) {
        groups[sectionName] = [];
      }
      groups[sectionName].push(field);
    });
    return groups;
  }, [selectedPhase]);

  if (!selectedProcess) return null;

  const renderTimeline = (
    entries = [],
    emptyMessage = 'No hay eventos registrados.',
    showPhaseData = true
  ) => {
    const sortedEntries = [...entries].sort(
      (a, b) => getEntryTimestampValue(b?.timestamp) - getEntryTimestampValue(a?.timestamp)
    );

    if (sortedEntries.length === 0) {
      return <Typography sx={{ color: '#6c797c' }}>{emptyMessage}</Typography>;
    }

    return (
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
        {sortedEntries.map((entry, index) => {
          const baseTitle =
            entry.type === 'actuacion'
              ? `Actuacion ${index + 1}`
              : entry.type === 'respuesta'
              ? 'Carga de documentos / respuesta'
              : 'Alerta / estrategia';

          const title = showPhaseData && entry.phase ? `${entry.phase} - ${baseTitle}` : baseTitle;

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
    );
  };

  const renderInfoAccordion = () => (
    <Accordion sx={{ borderRadius: '12px !important', boxShadow: 0 }} defaultExpanded>
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
          {Object.entries(processData)
            .filter(([, value]) => String(value ?? '').trim() !== '')
            .map(([key, value]) => (
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
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100vw', md: '70vw' }, bgcolor: '#ffffff' }
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
            value={activeDetailTab}
            onChange={(_, value) => setActiveDetailTab(value)}
            sx={{
              '& .MuiTabs-indicator': { bgcolor: '#006971' },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
              '& .Mui-selected': { color: '#006971 !important' }
            }}
          >
            <Tab label="Formulario" value={DETAIL_TABS.FORM} />
            <Tab label="Fases" value={DETAIL_TABS.PHASES} />
            <Tab label="Bitacora" value={DETAIL_TABS.LOG} />
            <Tab label="Nueva Actuación" value={DETAIL_TABS.NEW_LOG} />
          </Tabs>
        </Box>
      </Box>

      <Box sx={{ p: 3, overflowY: 'auto' }}>
        {/* Formulario */}
        {activeDetailTab === DETAIL_TABS.FORM && (
          <>  
            {/* Selector de fases */}
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel id="phase-selector-label">Fase</InputLabel>

              <Select
                labelId="phase-selector-label"
                value={normalizedPhase}
                label="Fase"
                onChange={(event) => setSelectedPhase(event.target.value)}
              >
                {PHASE_OPTIONS.map((phaseOption) => (
                  <MenuItem key={phaseOption} value={phaseOption}>
                    {phaseOption}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f2f4f5',
                border: '1px solid rgba(187, 201, 204, 0.35)',
                minHeight: 220
              }}
            >
              <Typography sx={{ fontWeight: 700, color: '#191c1d', mb: 0.5 }}>
                Fase actual: {normalizeText(selectedPhase || 'Sin fase definida')}
              </Typography>

              <Box sx={{ mt: 2 }}>
                {Object.entries(groupedFormFields).map(([sectionTitle, sectionFields]) => (
                  <Box key={sectionTitle} sx={{ mb: 4 }}>
                    <Typography 
                      sx={{ 
                        fontWeight: 700, 
                        color: '#191c1d', 
                        mb: 2, 
                        fontSize: '1.1rem',
                        borderBottom: '2px solid #006971',
                        pb: 1
                      }}
                    >
                      {sectionTitle}
                    </Typography>
                    <FormBuilder
                      inputFields={sectionFields}
                      controlled={true}
                      initialValues={formValues}
                      onChange={(id, value) =>
                        setFormValues((prevState) => ({
                          ...prevState,
                          [id]: value
                        }))
                      }
                      showActionButton={false}
                    />
                  </Box>
                ))}
              </Box>
            </Box>
          </>
        )}

        {/* Fases */}
        {activeDetailTab === DETAIL_TABS.PHASES && (
          <Box>
            <Box
              sx={{
                mb: 2,
                p: 2,
                borderRadius: 2,
                bgcolor: '#f2f4f5',
                border: '1px solid rgba(187, 201, 204, 0.35)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <History sx={{ color: '#006971' }} />
                <Typography sx={{ fontWeight: 700 }}>Fases del proceso</Typography>
              </Box>

              <FormControl size="small" sx={{ minWidth: 240 }}>
                <InputLabel id="phase-selector-label">Fase</InputLabel>
                <Select
                  labelId="phase-selector-label"
                  value={normalizedPhase}
                  label="Fase"
                  onChange={(event) => setSelectedPhase(event.target.value)}
                >
                  {PHASE_OPTIONS.map((phaseOption) => (
                    <MenuItem key={phaseOption} value={phaseOption}>
                      {phaseOption}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {renderInfoAccordion()}
          </Box>
        )}

        {/* Bitacora */}
        {activeDetailTab === DETAIL_TABS.LOG && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setActiveDetailTab(DETAIL_TABS.NEW_LOG)}
              >
                Nueva actuacion
              </Button>
            </Box>

            {showBitacoraFilters && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1.5,
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel id="bitacora-phase-filter-label">Fase</InputLabel>
                    <Select
                      labelId="bitacora-phase-filter-label"
                      value={bitacoraPhaseFilter}
                      label="Fase"
                      onChange={(event) => setBitacoraPhaseFilter(event.target.value)}
                    >
                      <MenuItem value={ALL_PHASES_OPTION}>{ALL_PHASES_OPTION}</MenuItem>
                      {PHASE_OPTIONS.map((phaseOption) => (
                        <MenuItem key={`bitacora-${phaseOption}`} value={phaseOption}>
                          {phaseOption}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    size="small"
                    type="date"
                    label="Fecha"
                    value={bitacoraDateFilter}
                    onChange={(event) => setBitacoraDateFilter(event.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 180 }}
                  />
                </Box>
              </Box>
            )}

            <Accordion sx={{ borderRadius: '12px !important', boxShadow: 0 }} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <History sx={{ color: '#006971' }} />
                  <Typography sx={{ fontWeight: 700 }}>Bitacora general del proceso</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {renderTimeline(
                  showBitacoraFilters ? filteredGeneralLogEntries : generalLogEntries,
                  'No hay eventos registrados en la bitacora general.',
                  showBitacoraFilters
                )}
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* Formulario para nueva bitácora */}
        {activeDetailTab === DETAIL_TABS.NEW_LOG && (
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#f2f4f5',
              border: '1px solid rgba(187, 201, 204, 0.35)',
              minHeight: 220
            }}
          >
            <Typography sx={{ fontWeight: 700, color: '#191c1d', mb: 2 }}>
              Crear Nueva Entrada de Bitácora
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Actuación"
                multiline
                rows={3}
                placeholder='Ej: "Auto de inicio de apertura de proceso administrativo de Carácter Ambiental. Auto No. 02221 de 18/04/2016"'
              />

              <TextField
                fullWidth
                label="Observación"
                multiline
                rows={6}
                placeholder='Ej: "Resolución No. 03256000559 de 5 MAR. 2025 Por la cual se resuelve una solicitud de cesación..."'
              />

              <FormControl fullWidth>
                <InputLabel id="recipients-label">Destinatario</InputLabel>
                <Select
                  labelId="recipients-label"
                  id="recipients"
                  label="Destinatario"
                  defaultValue=""
                >
                  <MenuItem value="">Seleccionar destinatario</MenuItem>
                  <MenuItem value="autoridad">Autoridad Competente</MenuItem>
                  <MenuItem value="interesado">Interesado/Parte</MenuItem>
                  <MenuItem value="interno">Interno (Equipo Legal)</MenuItem>
                  <MenuItem value="secretaria">Secretaría Distrital</MenuItem>
                  <MenuItem value="procuraduria">Procuraduría</MenuItem>
                  <MenuItem value="otro">Otro</MenuItem>
                </Select>
              </FormControl>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component="label"
                  variant="outlined"
                  size="small"
                  sx={{ width: 'auto' }}
                >
                  Agregar Adjuntos
                  <input
                    type="file"
                    multiple
                    accept="image/png, image/jpg, image/jpeg, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={handleSelectNewLogFiles}
                    style={{ display: 'none' }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  {newLogAttachments.length} archivos seleccionados
                </Typography>
              </Box>

              {newLogAttachments.length > 0 && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {newLogAttachments.map((file, index) => (
                    <Box
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1
                      }}
                    >
                      <Typography variant="body2" sx={{ pr: 2 }}>
                        {file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveNewLogFile(index)}
                        aria-label="remove-file"
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" color="primary">
                  Guardar Entrada
                </Button>

                <Button variant="outlined" color="secondary">
                  Cancelar
                </Button>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
