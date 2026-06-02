import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Autocomplete,
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BaseTab from '../../components/BaseTab';
import FormBuilder from '../../components/FormBuilder';
import { fetchAdministratorsList } from '../../stores/tasks/fetchAdministratorsListSlice';
import { PERMIT_COLUMN_DEFINITIONS } from './permitManagerData';

const SEMAFORO_DEFS = [
  {
    status: 1,
    color: '#4caf50',
    label: 'Sin desviaciones',
    description:
      'El trámite avanza sin desviaciones respecto a los tiempos y gestiones proyectadas.'
  },
  {
    status: 2,
    color: '#ffc107',
    label: 'Desviaciones atendibles',
    description:
      'Se presentan desviaciones por requerimientos que pueden ser atendidos sin modificar el tiempo proyectado para el otorgamiento del permiso.'
  },
  {
    status: 3,
    color: '#f44336',
    label: 'Desviaciones críticas',
    description:
      'Se presentan desviaciones que aumentan el tiempo proyectado para el otorgamiento del permiso.'
  }
];

const STATUS_KEY_BY_LABEL = Object.freeze({
  'En proceso': 'in_process',
  Otorgado: 'granted',
  'Pendiente Trámitar': 'pending',
  Desistido: 'withdrawn',
  Cerrado: 'closed'
});

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
  'estadoTramite'
]);

const FORM_FIELDS = PERMIT_COLUMN_DEFINITIONS.filter(
  (col) => !col.uiOnly && col.field !== 'semaforoColor'
);

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
    ],
    specialFields: ['responsables', 'revisores']
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
    ],
    specialFields: []
  },
  {
    key: 'tracking',
    label: 'Seguimiento',
    fields: [
      'fechaProyectadaOtorgamiento',
      'fechaRealOtorgamiento',
      'duracionTramiteMeses',
      'autoInicioTramite',
      'fechaEjecucionVisitaTecnica',
      'estadoTramite'
    ],
    specialFields: ['semaforo']
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
    ],
    specialFields: []
  }
]);

const EMPTY_FORM = {
  ...FORM_FIELDS.reduce(
    (acc, field) => ({
      ...acc,
      [field.field]: field.field === 'estadoTramite' ? 'En proceso' : ''
    }),
    {}
  ),
  semaforoStatus: null,
  semaforoColor: null,
  semaforoDescription: null,
  responsablesSelected: [],
  revisoresSelected: []
};

function normalizeAdmin(user) {
  // list_administradores returns {value, label}; permit records return {id_administradores, nombres, apellidos, fullname}
  const id = user.id_administradores ?? user.id ?? user.value ?? null;
  const fullname =
    user.fullname ||
    [user.nombres, user.apellidos].filter(Boolean).join(' ') ||
    user.label ||
    String(id);
  return { id_administradores: id, fullname, email: user.email || '' };
}

function buildInitialValues(item, mode) {
  if (mode !== 'edit' || !item) return { ...EMPTY_FORM };

  const base = {
    ...EMPTY_FORM,
    ...Object.fromEntries(
      FORM_FIELDS.map((field) => {
        let val = item[field.field] ?? '';
        if (DATE_FIELDS.has(field.field)) val = item[field.field] || null;
        if (field.field === 'duracionTramiteMeses') val = item[field.field] || '';
        return [field.field, val];
      })
    )
  };

  return {
    ...base,
    estadoTramite: item.estadoTramite || 'En proceso',
    semaforoStatus: item.semaforoStatus ?? null,
    semaforoColor: item.semaforoColor ?? null,
    semaforoDescription: item.semaforoDescription ?? null,
    responsablesSelected: (item.responsablesList || []).map(normalizeAdmin),
    revisoresSelected: (item.revisoresList || []).map(normalizeAdmin)
  };
}

function buildApiPayload(values) {
  const idList = (arr) =>
    arr.length ? arr.map((u) => String(u.id_administradores)).join(',') : null;

  return {
    unidad: values.unidad || null,
    sede: values.sede || null,
    tipo_permiso: values.tipoPermiso || null,
    tipo_tramite: values.tipoTramite || null,
    acto_administrativo_inicial: values.actoAdministrativoInicial || null,
    expediente: values.expediente || null,
    autoridad: values.autoridad || null,
    justificacion_solicitud: values.justificacionSolicitud || null,
    fecha_proyectada_ejecucion: values.fechaProyectadaEjecucion || null,
    valor_pago_evaluacion: values.valorPagoEvaluacionAmbiental || null,
    fecha_reporte_pago_evaluacion: values.fechaReportePagoEvaluacionAmbiental || null,
    numero_radicado_reporte_pago: values.numeroRadicadoReportePago || null,
    fecha_radicacion_permiso: values.fechaRadicacionPermiso || null,
    numero_radicado_solicitud: values.numeroRadicadoSolicitudAutoridad || null,
    fecha_proyectada_otorgamiento: values.fechaProyectadaOtorgamiento || null,
    fecha_real_otorgamiento: values.fechaRealOtorgamiento || null,
    duracion_tramite_meses: values.duracionTramiteMeses || null,
    estado_tramite: values.estadoTramite || null,
    semaforo_status: values.semaforoStatus ?? null,
    semaforo_color: values.semaforoColor ?? null,
    semaforo_description: values.semaforoDescription || null,
    auto_inicio_tramite: values.autoInicioTramite || null,
    fecha_visita_tecnica: values.fechaEjecucionVisitaTecnica || null,
    datos_contacto_funcionario: values.datosContactoAutoridadAmbiental || null,
    acto_administrativo_requerimientos: values.actoAdministrativoRequerimientos || null,
    descripcion_requerimientos: values.descripcionRequerimientosAdicionales || null,
    fecha_respuesta_requerimientos: values.fechaRespuestaRequerimientos || null,
    numero_radicado_respuesta: values.numeroRadicadoRespuestaAutoridad || null,
    responsables: idList(values.responsablesSelected),
    revisores: idList(values.revisoresSelected)
  };
}

function buildFieldOptions(records) {
  const pick = (field) =>
    [{ value: '', label: 'Seleccione' }].concat(
      [...new Set(records.map((r) => r[field]).filter(Boolean))]
        .sort((a, b) => String(a).localeCompare(String(b), 'es'))
        .map((v) => ({ value: v, label: v }))
    );

  return {
    unidad: pick('unidad'),
    sede: pick('sede'),
    tipoPermiso: pick('tipoPermiso'),
    tipoTramite: pick('tipoTramite'),
    autoridad: pick('autoridad'),
    estadoTramite: [{ value: '', label: 'Seleccione' }].concat(
      Object.keys(STATUS_KEY_BY_LABEL).map((v) => ({ value: v, label: v }))
    )
  };
}

function mapFieldToInput(field, fieldOptions) {
  const isDropdown = DROPDOWN_FIELDS.has(field.field);
  const isMultiline = MULTILINE_FIELDS.has(field.field);
  const isDate = DATE_FIELDS.has(field.field);

  return {
    id: field.field,
    label: field.headerName,
    type: isDropdown ? 'dropdown' : isMultiline ? 'textarea' : isDate ? 'date' : 'text',
    options: isDropdown ? fieldOptions[field.field] || [] : undefined,
    gridSize: isMultiline ? 12 : 6,
    required: false,
    formatValue: isDate ? 'YYYY-MM-DD' : undefined
  };
}

function SemaforoSelector({ value, onChange }) {
  const activeDef = SEMAFORO_DEFS.find((d) => d.status === value?.status) ?? null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        sx={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#546e7a',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 1
        }}
      >
        Semáforo
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 1 }}>
        {SEMAFORO_DEFS.map((def) => {
          const selected = value?.status === def.status;
          return (
            <Tooltip key={def.status} title={def.label} placement="top">
              <Box
                onClick={() => onChange(selected ? null : def)}
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  bgcolor: def.color,
                  cursor: 'pointer',
                  border: selected ? '3px solid #fff' : '3px solid transparent',
                  boxShadow: selected ? `0 0 0 2px ${def.color}` : 'none',
                  transition: 'box-shadow 0.15s, border 0.15s',
                  '&:hover': { opacity: 0.82 }
                }}
              />
            </Tooltip>
          );
        })}
      </Box>
      {activeDef && (
        <Box
          sx={{
            p: 1.25,
            borderRadius: '6px',
            bgcolor: `${activeDef.color}18`,
            border: `1px solid ${activeDef.color}55`
          }}
        >
          <Typography
            sx={{ fontSize: '0.75rem', fontWeight: 700, color: activeDef.color, mb: 0.25 }}
          >
            {activeDef.label}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#546e7a', lineHeight: 1.4 }}>
            {activeDef.description}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function UserMultiSelector({ label, value, options, onChange }) {
  return (
    <Autocomplete
      multiple
      size="small"
      options={options}
      value={value}
      getOptionLabel={(opt) => opt.fullname || String(opt.id_administradores)}
      isOptionEqualToValue={(opt, val) =>
        String(opt.id_administradores) === String(val.id_administradores)
      }
      onChange={(_, newValue) => onChange(newValue)}
      renderTags={(val, getTagProps) =>
        val.map((opt, index) => (
          <Chip
            key={opt.id_administradores}
            label={opt.fullname}
            size="small"
            sx={{ fontSize: '0.7rem', height: 22 }}
            {...getTagProps({ index })}
          />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant="outlined"
          sx={{
            '& .MuiInputLabel-root': { fontSize: '0.82rem' },
            '& .MuiInputBase-root': { fontSize: '0.82rem' }
          }}
        />
      )}
      sx={{ mt: 2 }}
      noOptionsText="Sin resultados"
    />
  );
}

export default function PermitManagerFormDrawer({
  open,
  mode = 'create',
  item = null,
  records = [],
  onClose = () => {},
  onSubmit = () => {}
}) {
  const dispatch = useDispatch();
  const adminRaw = useSelector((state) => state.fetchAdministratorsList?.data?.data ?? []);
  const adminOptions = useMemo(() => adminRaw.map(normalizeAdmin), [adminRaw]);

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
      if (adminRaw.length === 0) {
        dispatch(fetchAdministratorsList());
      }
    }
  }, [open, initialValues]);

  const inputFieldsByTab = useMemo(
    () =>
      TAB_GROUPS.map((group) => ({
        ...group,
        inputs: group.fields
          .map((name) => FORM_FIELDS.find((f) => f.field === name))
          .filter(Boolean)
          .map((field) => mapFieldToInput(field, fieldOptions))
      })),
    [fieldOptions]
  );

  const handleFieldChange = (fieldId, value) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSemaforoChange = (def) => {
    setFormValues((prev) => ({
      ...prev,
      semaforoStatus: def?.status ?? null,
      semaforoColor: def?.color ?? null,
      semaforoDescription: def?.description ?? null
    }));
  };

  const handleSubmit = () => {
    onSubmit(buildApiPayload(formValues));
  };

  const currentGroup = TAB_GROUPS[activeTab];
  const semaforoValue =
    formValues.semaforoStatus != null
      ? { status: formValues.semaforoStatus, color: formValues.semaforoColor, description: formValues.semaforoDescription }
      : null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: '80vw', md: '62vw', lg: '42vw' },
          display: 'flex',
          flexDirection: 'column'
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
          items={inputFieldsByTab.map((group) => ({ label: group.label, skipTranslation: true }))}
          activeTab={activeTab}
          tabContainerProps={{
            onChange: (_, newValue) => setActiveTab(newValue),
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 1,
              '& .MuiTabs-flexContainer': { justifyContent: 'space-between' }
            }
          }}
          tabItemProps={{ sx: { flex: 1, minWidth: 0, px: 1, fontSize: '0.82rem' } }}
        />

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 1 }}>
          <FormBuilder
            inputFields={inputFieldsByTab[activeTab]?.inputs || []}
            initialValues={formValues}
            controlled={true}
            onChange={handleFieldChange}
            showActionButton={false}
          />

          {currentGroup.specialFields?.includes('semaforo') && (
            <SemaforoSelector value={semaforoValue} onChange={handleSemaforoChange} />
          )}

          {currentGroup.specialFields?.includes('responsables') && (
            <UserMultiSelector
              label="Responsables"
              value={formValues.responsablesSelected}
              options={adminOptions}
              onChange={(val) => handleFieldChange('responsablesSelected', val)}
            />
          )}

          {currentGroup.specialFields?.includes('revisores') && (
            <UserMultiSelector
              label="Revisores"
              value={formValues.revisoresSelected}
              options={adminOptions}
              onChange={(val) => handleFieldChange('revisoresSelected', val)}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
          {!isFirstTab && (
            <Button variant="text" color="inherit" onClick={() => setActiveTab((t) => t - 1)}>
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
            <Button variant="contained" color="primary" onClick={() => setActiveTab((t) => t + 1)}>
              Siguiente
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}
