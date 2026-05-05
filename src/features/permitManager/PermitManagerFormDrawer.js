import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, Button, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import BaseTab from '../../components/BaseTab';
import FormBuilder from '../../components/FormBuilder';
import { PERMIT_COLUMN_DEFINITIONS } from './permitManagerData';

const STATUS_KEY_BY_LABEL = Object.freeze({
  'En proceso': 'in_process',
  Otorgado: 'granted',
  Pendiente: 'pending',
  Desistido: 'withdrawn',
  Cerrado: 'closed'
});

const SEMAFORO_OPTIONS = ['Verde', 'Amarillo', 'Rojo', 'Sin dato'];

const MULTILINE_FIELDS = new Set([
  'justificacionSolicitud',
  'descripcionRequerimientosAdicionales',
  'datosContactoAutoridadAmbiental'
]);

const DATE_FIELDS = new Set([
  'fechaReportePagoEvaluacionAmbiental',
  'fechaRadicacionPermiso',
  'fechaProyectadaOtorgamiento',
  'fechaRealOtorgamiento',
  'fechaEjecucionVisitaTecnica',
  'fechaRespuestaRequerimientos',
  'fechaProyectadaEjecucion'
]);

const DROPDOWN_FIELDS = new Set([
  'unidad',
  'sede',
  'tipoPermiso',
  'tipoTramite',
  'autoridad',
  'estadoTramite',
  'semaforoAmbiental'
]);

const FORM_FIELDS = PERMIT_COLUMN_DEFINITIONS.filter((column) => !column.uiOnly);

const TAB_GROUPS = Object.freeze([
  {
    key: 'general',
    label: 'Información General',
    fields: [
      'unidad',
      'sede',
      'tipoPermiso',
      'tipoTramite',
      'actoAdministrativoInicial',
      'expediente',
      'autoridad',
      'justificacionSolicitud'
    ]
  },
  {
    key: 'filing',
    label: 'Radicación y Pago',
    fields: [
      'fechaProyectadaEjecucion',
      'valorPagoEvaluacionAmbiental',
      'fechaReportePagoEvaluacionAmbiental',
      'numeroRadicadoReportePago',
      'fechaRadicacionPermiso',
      'numeroRadicadoSolicitudAutoridad'
    ]
  },
  {
    key: 'tracking',
    label: 'Seguimiento',
    fields: [
      'fechaProyectadaOtorgamiento',
      'fechaRealOtorgamiento',
      'duracionTramiteMeses',
      'semaforoAmbiental',
      'autoInicioTramite',
      'fechaEjecucionVisitaTecnica',
      'estadoTramite'
    ]
  },
  {
    key: 'requirements',
    label: 'Requerimientos',
    fields: [
      'datosContactoAutoridadAmbiental',
      'actoAdministrativoRequerimientos',
      'descripcionRequerimientosAdicionales',
      'fechaRespuestaRequerimientos',
      'numeroRadicadoRespuestaAutoridad'
    ]
  }
]);

const EMPTY_FORM_VALUES = FORM_FIELDS.reduce(
  (accumulator, field) => ({
    ...accumulator,
    [field.field]: field.field === 'estadoTramite' ? 'En proceso' : ''
  }),
  { statusKey: 'in_process' }
);

function buildOptions(records, field) {
  return Array.from(new Set(records.map((record) => record[field]).filter(Boolean)))
    .sort((left, right) => String(left).localeCompare(String(right), 'es'))
    .map((value) => ({
      value,
      label: value
    }));
}

function withEmptyOption(options) {
  return [{ value: '', label: 'Seleccione' }, ...options];
}

function buildFieldOptions(records) {
  return {
    unidad: withEmptyOption(buildOptions(records, 'unidad')),
    sede: withEmptyOption(buildOptions(records, 'sede')),
    tipoPermiso: withEmptyOption(buildOptions(records, 'tipoPermiso')),
    tipoTramite: withEmptyOption(buildOptions(records, 'tipoTramite')),
    autoridad: withEmptyOption(buildOptions(records, 'autoridad')),
    estadoTramite: withEmptyOption(
      Object.keys(STATUS_KEY_BY_LABEL).map((value) => ({ value, label: value }))
    ),
    semaforoAmbiental: withEmptyOption(
      SEMAFORO_OPTIONS.map((value) => ({ value, label: value }))
    )
  };
}

function normalizeValue(field, value) {
  if (DATE_FIELDS.has(field)) {
    return value || null;
  }

  if (field === 'duracionTramiteMeses') {
    return value === 'N/A' ? '' : value;
  }

  return value ?? '';
}

function buildInitialValues(item, mode) {
  if (mode !== 'edit' || !item) {
    return EMPTY_FORM_VALUES;
  }

  return {
    ...EMPTY_FORM_VALUES,
    ...Object.fromEntries(
      FORM_FIELDS.map((field) => [field.field, normalizeValue(field.field, item[field.field])])
    ),
    statusKey: item.statusKey || STATUS_KEY_BY_LABEL[item.estadoTramite] || 'in_process'
  };
}

function buildPayload(values) {
  return {
    ...values,
    duracionTramiteMeses: values.duracionTramiteMeses || 'N/A',
    statusKey: STATUS_KEY_BY_LABEL[values.estadoTramite] || 'in_process'
  };
}

function mapFieldToInput(field, fieldOptions) {
  const isDropdown = DROPDOWN_FIELDS.has(field.field);
  const isMultiline = MULTILINE_FIELDS.has(field.field);
  const isDate = DATE_FIELDS.has(field.field);
  const isNumber = field.field === 'duracionTramiteMeses';

  return {
    id: field.field,
    label: field.headerName,
    type: isDropdown ? 'dropdown' : isMultiline ? 'textarea' : isDate ? 'date' : 'text',
    options: isDropdown ? fieldOptions[field.field] || [] : undefined,
    gridSize: isMultiline ? 12 : 6,
    required: false,
    formatValue: isDate ? 'YYYY-MM-DD' : undefined,
    inputProps: isNumber ? { min: 0 } : undefined
  };
}

export default function PermitManagerFormDrawer({
  open,
  mode = 'create',
  item = null,
  records = [],
  onClose = () => {},
  onSubmit = () => {}
}) {
  const [activeTab, setActiveTab] = useState(0);
  const fieldOptions = useMemo(() => buildFieldOptions(records), [records]);
  const initialValues = useMemo(() => buildInitialValues(item, mode), [item, mode]);
  const [formValues, setFormValues] = useState(initialValues);
  const isFirstTab = activeTab === 0;
  const isLastTab = activeTab === TAB_GROUPS.length - 1;

  useEffect(() => {
    if (open) {
      setFormValues(initialValues);
      setActiveTab(0);
    }
  }, [initialValues, open]);

  const inputFieldsByTab = useMemo(
    () =>
      TAB_GROUPS.map((group) => ({
        ...group,
        inputs: group.fields
          .map((fieldName) => FORM_FIELDS.find((field) => field.field === fieldName))
          .filter(Boolean)
          .map((field) => mapFieldToInput(field, fieldOptions))
      })),
    [fieldOptions]
  );

  const handleFieldChange = (fieldId, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [fieldId]: value
    }));
  };

  const handleSubmit = () => {
    onSubmit(buildPayload(formValues));
  };

  const handlePreviousTab = () => {
    setActiveTab((currentTab) => Math.max(currentTab - 1, 0));
  };

  const handleNextTab = () => {
    setActiveTab((currentTab) => Math.min(currentTab + 1, TAB_GROUPS.length - 1));
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: {
            xs: '100vw',
            sm: '80vw',
            md: '62vw',
            lg: '42vw'
          }
        }
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Typography color="white" variant="h6" sx={{ flexGrow: 1 }}>
            {mode === 'edit' ? 'Editar permiso ambiental' : 'Crear permiso ambiental'}
          </Typography>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, flex: 1 }}>
        <BaseTab
          items={inputFieldsByTab.map((group) => ({
            label: group.label,
            skipTranslation: true
          }))}
          activeTab={activeTab}
          tabContainerProps={{
            onChange: (_, newValue) => setActiveTab(newValue),
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 1,
              '& .MuiTabs-flexContainer': {
                justifyContent: 'space-between'
              }
            }
          }}
          tabItemProps={{
            sx: {
              flex: 1,
              minWidth: 0,
              px: 1,
              fontSize: '0.82rem'
            }
          }}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            pr: 1
          }}
        >
          <FormBuilder
            inputFields={inputFieldsByTab[activeTab]?.inputs || []}
            initialValues={formValues}
            controlled={true}
            onChange={handleFieldChange}
            showActionButton={false}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          {!isFirstTab && (
            <Button variant="text" color="inherit" onClick={handlePreviousTab}>
              Atrás
            </Button>
          )}
          {isFirstTab && (
            <Button variant="contained" color="inherit" onClick={onClose}>
              Cancelar
            </Button>
          )}
          {isLastTab ? (
            <Button variant="contained" color="primary" onClick={handleSubmit}>
              Guardar
            </Button>
          ) : (
            <Button variant="contained" color="primary" onClick={handleNextTab}>
              Siguiente
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
