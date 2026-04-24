import FormDrawer from '../../components/FormDrawer';
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
  'fechaRespuestaRequerimientos'
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
    gridSize: isMultiline ? 12 : field.field === 'sede' || field.field === 'tipoPermiso' ? 12 : 6,
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
  const fieldOptions = buildFieldOptions(records);
  const inputFields = FORM_FIELDS.map((field) => mapFieldToInput(field, fieldOptions));
  const initialValues = buildInitialValues(item, mode);

  return (
    <FormDrawer
      key={`${mode}-${item?.recordId || 'new'}`}
      open={open}
      handleClose={onClose}
      title={mode === 'edit' ? 'Editar permiso ambiental' : 'Crear permiso ambiental'}
      inputFields={inputFields}
      initialValues={initialValues}
      submitForm={(values, callback) => {
        onSubmit(buildPayload(values));
        callback();
      }}
    />
  );
}
