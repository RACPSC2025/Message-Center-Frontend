import dayjs from 'dayjs';

const TODAY = dayjs().startOf('day');

export const STATUS_META = Object.freeze({
  in_process: {
    label: 'En proceso',
    dotColor: '#E8A126'
  },
  granted: {
    label: 'Otorgado',
    dotColor: '#0B7A84'
  },
  pending: {
    label: 'Pendiente',
    dotColor: '#D97706'
  },
  withdrawn: {
    label: 'Desistido',
    dotColor: '#C62828'
  },
  closed: {
    label: 'Cerrado',
    dotColor: '#475569'
  }
});

const STATUS_KEY_BY_LABEL = Object.freeze({
  'En proceso': 'in_process',
  Otorgado: 'granted',
  Pendiente: 'pending',
  Desistido: 'withdrawn',
  Cerrado: 'closed'
});

export const PERMIT_COLUMN_DEFINITIONS = Object.freeze([
  {
    field: 'actions',
    headerName: 'Opciones',
    visible: true,
    uiOnly: true,
    width: 110,
    sortable: false,
    filter: false
  },
  {
    field: 'unidad',
    headerName: 'UNIDAD',
    visible: true,
    filterable: true,
    minWidth: 145
  },
  {
    field: 'sede',
    headerName: 'SEDE',
    visible: true,
    filterable: true,
    minWidth: 260,
    flex: 1.5
  },
  {
    field: 'tipoPermiso',
    headerName: 'TIPO DE PERMISO',
    visible: true,
    filterable: true,
    minWidth: 240,
    flex: 1.35
  },
  {
    field: 'tipoTramite',
    headerName: 'TIPO DE TRÁMITE',
    visible: true,
    filterable: true,
    minWidth: 200,
    flex: 1.05
  },
  {
    field: 'actoAdministrativoInicial',
    headerName: 'ACTO ADMINISTRATIVO INICIAL',
    visible: false,
    filterable: true
  },
  {
    field: 'expediente',
    headerName: 'EXPEDIENTE',
    visible: true,
    filterable: true,
    minWidth: 180,
    flex: 0.95
  },
  {
    field: 'autoridad',
    headerName: 'AUTORIDAD',
    visible: true,
    filterable: true,
    minWidth: 180,
    flex: 0.95
  },
  {
    field: 'justificacionSolicitud',
    headerName: 'JUSTIFICACION DE LA SOLICITUD',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaProyectadaEjecucion',
    headerName: 'FECHA PROYECTADA PARA LA EJECUCIÓN DE LA OBRA o APERTURAS',
    visible: false,
    filterable: false
  },
  {
    field: 'valorPagoEvaluacionAmbiental',
    headerName: 'VALOR DEL PAGO POR EVALUACIÓN AMBIENTAL',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaReportePagoEvaluacionAmbiental',
    headerName: 'FECHA DEL REPORTE DE PAGO POR EVALUACIÓN AMBIENTAL',
    visible: false,
    filterable: false
  },
  {
    field: 'numeroRadicadoReportePago',
    headerName: 'NÚMERO DE RADICADO DEL REPORTE DE PAGO',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaRadicacionPermiso',
    headerName: 'FECHA DE RADICACIÓN DEL PERMISO',
    visible: false,
    filterable: false,
    minWidth: 180,
    flex: 0.9
  },
  {
    field: 'numeroRadicadoSolicitudAutoridad',
    headerName: 'NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaProyectadaOtorgamiento',
    headerName: 'FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO',
    visible: false,
    filterable: false,
    minWidth: 210,
    flex: 1
  },
  {
    field: 'fechaRealOtorgamiento',
    headerName: 'FECHA REAL DE OTORGAMIENTO',
    visible: false,
    filterable: false
  },
  {
    field: 'duracionTramiteMeses',
    headerName: 'DURACIÓN DEL TRÁMITE (MESES)',
    visible: false,
    filterable: false
  },
  {
    field: 'semaforoAmbiental',
    headerName: 'SEMAFORO AMBIENTAL',
    visible: false,
    filterable: true
  },
  {
    field: 'autoInicioTramite',
    headerName: 'AUTO INICIO DE TRAMITE',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaEjecucionVisitaTecnica',
    headerName: 'FECHA EJECUCIÓN VISITA TÉCNICA',
    visible: false,
    filterable: false
  },
  {
    field: 'datosContactoAutoridadAmbiental',
    headerName: 'DATOS DE CONTACTO DEL FUNCIONARIO DE LA AUTORIDAD AMBIENTAL',
    visible: false,
    filterable: false
  },
  {
    field: 'actoAdministrativoRequerimientos',
    headerName: 'ACTO ADMINISTRATIVO DE REQUERIMIENTOS ADICIONALES',
    visible: false,
    filterable: false
  },
  {
    field: 'descripcionRequerimientosAdicionales',
    headerName: 'DESCRIPCION DE REQUERIMIENTOS ADICIONALES DEL ACTO ADMINISTRATIVO',
    visible: false,
    filterable: false
  },
  {
    field: 'fechaRespuestaRequerimientos',
    headerName: 'FECHA DE RESPUESTA A LOS REQUERIMIENTOS ADICIONALES',
    visible: false,
    filterable: false
  },
  {
    field: 'numeroRadicadoRespuestaAutoridad',
    headerName: 'No RADICADO DE LA RESPUESTA A LA AUTORIDAD AMBIENTAL',
    visible: false,
    filterable: false
  },
  {
    field: 'semaforoColor',
    headerName: 'SEMÁFORO',
    visible: true,
    filterable: false,
    width: 110,
    sortable: false
  },
  {
    field: 'estadoTramite',
    headerName: 'ESTADO DEL TRÁMITE',
    visible: true,
    filterable: true,
    minWidth: 190,
    flex: 1,
    filter: false
  }
]);

export const PERMIT_TABLE_COLUMNS = Object.freeze(
  PERMIT_COLUMN_DEFINITIONS.map(({ visible, filterable, uiOnly, ...column }) => column)
);

export const PERMIT_INITIAL_VISIBLE_COLUMNS = Object.freeze(
  PERMIT_COLUMN_DEFINITIONS.filter((column) => column.visible !== false).map((column) => column.field)
);

const MASK_TOKEN = '****';

const maskedReference = (prefix, index) => `${prefix}-${MASK_TOKEN}-${String(index + 1).padStart(3, '0')}`;
const maskedMoney = (index) => `$ ${MASK_TOKEN}.${String(100 + ((index * 73) % 900)).padStart(3, '0')}`;
const maskedPhone = (index) => `3${MASK_TOKEN}${String(100 + (index % 900)).padStart(3, '0')}`;

const PERMIT_TYPE_TEMPLATES = Object.freeze([
  {
    tipoPermiso: 'Concesión de aguas superficiales',
    unidades: ['HOTELERÍA'],
    sedes: ['Hotel Lanceros', 'Hotel Colonial', 'Club Náutico y Cantú', 'Piscilago'],
    autoridades: ['CORPOBOYACÁ', 'CAR'],
    tiposTramite: ['Prórroga y modificación', 'Renovación'],
    justificaciones: [
      'Pérdida de vigencia y actualización del consumo de agua',
      'Seguimiento normativo para continuidad operativa'
    ]
  },
  {
    tipoPermiso: 'Aprovechamiento Forestal',
    unidades: ['HOTELERÍA', 'EDUCACIÓN', 'ADMINISTRACIÓN'],
    sedes: ['Hotel Lanceros', 'Hotel Alcaraván', 'Colegio Chicalá', 'Edificio Calle 26'],
    autoridades: ['CORPOBOYACÁ', 'SDA'],
    tiposTramite: ['Nueva solicitud', 'Renovación'],
    justificaciones: [
      'Tala por emergencia y control fitosanitario',
      'Poda preventiva y adecuación de áreas'
    ]
  },
  {
    tipoPermiso: 'Concesión de aguas subterráneas y permiso de vertimientos',
    unidades: ['HOTELERÍA'],
    sedes: ['Hotel Alcaraván'],
    autoridades: ['CORMACARENA'],
    tiposTramite: ['Recurso de reposición', 'Renovación'],
    justificaciones: [
      'Pérdida de vigencia y actualización del permiso integral',
      'Respuesta a requerimientos técnicos del expediente'
    ]
  },
  {
    tipoPermiso: 'Ocupación de cauce',
    unidades: ['HOTELERÍA'],
    sedes: ['Club Náutico', 'Club Náutico y Cantú'],
    autoridades: ['CORPOBOYACÁ'],
    tiposTramite: ['Recurso de reposición', 'Renovación'],
    justificaciones: [
      'Ajuste de coordenadas y mantenimiento de muelle',
      'Regularización de intervención en cauce'
    ]
  },
  {
    tipoPermiso: 'Permiso de vertimientos',
    unidades: ['HOTELERÍA', 'RECREACIÓN'],
    sedes: ['Hotel Bosques', 'Club Bellavista', 'Piscilago'],
    autoridades: ['CAR', 'SDA'],
    tiposTramite: ['Renovación', 'Nueva solicitud'],
    justificaciones: [
      'Cumplimiento normativo y continuidad del servicio',
      'Nuevo punto de vertimiento y ajuste operacional'
    ]
  },
  {
    tipoPermiso: 'Concesión de agua para reúso',
    unidades: ['HOTELERÍA'],
    sedes: ['Hotel Alcaraván'],
    autoridades: ['CORMACARENA'],
    tiposTramite: ['Prórroga', 'Renovación'],
    justificaciones: [
      'Pérdida de vigencia y continuidad operativa',
      'Ajuste de condiciones para reúso del recurso'
    ]
  },
  {
    tipoPermiso: 'Permiso de prospección y exploración de aguas subterráneas',
    unidades: ['HOTELERÍA'],
    sedes: ['Hotel Alcaraván'],
    autoridades: ['CORMACARENA'],
    tiposTramite: ['Nueva solicitud'],
    justificaciones: [
      'Deterioro en pozo actual y necesidad de exploración',
      'Evaluación técnica para nueva fuente subterránea'
    ]
  },
  {
    tipoPermiso: 'Registro de Publicidad Exterior Visual',
    unidades: ['SALUD', 'MERCADOS', 'MEDICAMENTOS', 'RECREACIÓN', 'VIVIENDA', 'EDUCACIÓN'],
    sedes: [
      'Centro Médico Colsubsidio Portal Norte',
      'Clínica Infantil Colsubsidio',
      'Colsubsidio Clínica 127',
      'Clínica Oftalmológica',
      'Proyecto La Arboleda',
      'Proyecto Karakalí',
      'Centro Empresarial Recreativo "El Cubo"',
      'Mercado Ipanema',
      'Mercado Duitama',
      'Mercado Calle 26',
      'D228 Servicio Farmacéutico Los Molinos',
      'D320 Servicio Farmacéutico NEPS Av Oriental',
      'Colegio Ciudadela'
    ],
    autoridades: [
      'SDA',
      'Alcaldía de Villavicencio',
      'Subsecretaría de Espacio Público',
      'Secretaría de Planeación',
      'Departamento Administrativo de Planeación',
      'Alcaldía Municipal'
    ],
    tiposTramite: ['Nueva solicitud', 'Renovación', 'Cambio de marca', 'Solicitud', 'Desistimiento en curso'],
    justificaciones: [
      'Cumplimiento normativo y actualización del registro',
      'Cierre de sede y gestión administrativa del aviso',
      'Registro inicial y regularización documental'
    ]
  },
  {
    tipoPermiso: 'Concesión de aguas subterráneas',
    unidades: ['HOTELERÍA'],
    sedes: ['Piscilago'],
    autoridades: ['CAR'],
    tiposTramite: ['Renovación'],
    justificaciones: [
      'Cumplimiento normativo y continuidad del servicio',
      'Seguimiento técnico sobre captación subterránea'
    ]
  }
]);

const STATUS_SEQUENCE = Object.freeze([
  'En proceso',
  'Otorgado',
  'Pendiente',
  'En proceso',
  'Desistido',
  'Cerrado'
]);
const SEMAPHORE_SEQUENCE = Object.freeze(['Verde', 'Amarillo', 'Rojo', 'Sin dato', 'Amarillo']);
const PROJECT_EXECUTION_SEQUENCE = Object.freeze([
  'Establecimiento abierto',
  'Proyecto en ejecución',
  `Apertura programada ${MASK_TOKEN}`,
  'Operación regular'
]);

const pickByIndex = (values, index, offset = 0) => values[(index + offset) % values.length];

const formatIsoDate = (dateValue) => dateValue.format('YYYY-MM-DD');

const buildPermitRows = (templates, recordsPerType) =>
  templates.flatMap((template, typeIndex) =>
    Array.from({ length: recordsPerType }, (_, index) => {
      const rowIndex = typeIndex * recordsPerType + index;
      const radicationDate = TODAY.subtract(420 - rowIndex * 2, 'day');
      const projectedGrantDate = radicationDate.add(120 + (index % 5) * 18, 'day');
      const statusLabel = pickByIndex(STATUS_SEQUENCE, index, typeIndex);
      const statusKey = STATUS_KEY_BY_LABEL[statusLabel] || 'in_process';
      const grantDate =
        statusKey === 'granted' || statusKey === 'closed'
          ? projectedGrantDate.add((index % 3) * 6 - 4, 'day')
          : null;
      const visitDate = index % 4 === 0 ? radicationDate.add(25 + (index % 6) * 4, 'day') : null;
      const responseDate = index % 5 === 0 ? radicationDate.add(65 + (index % 4) * 7, 'day') : null;

      return {
        recordId: `PMR-${String(rowIndex + 1).padStart(4, '0')}`,
        unidad: pickByIndex(template.unidades, index),
        sede: pickByIndex(template.sedes, index, typeIndex),
        tipoPermiso: template.tipoPermiso,
        tipoTramite: pickByIndex(template.tiposTramite, index, typeIndex),
        actoAdministrativoInicial: `Acto adm. ${MASK_TOKEN}-${String(typeIndex + 1).padStart(2, '0')}-${String(index + 1).padStart(3, '0')}`,
        expediente: maskedReference(`EXP-${typeIndex + 1}`, index),
        autoridad: pickByIndex(template.autoridades, index, typeIndex),
        justificacionSolicitud: `${pickByIndex(template.justificaciones, index)} ${MASK_TOKEN}`,
        fechaProyectadaEjecucion: pickByIndex(PROJECT_EXECUTION_SEQUENCE, index, typeIndex),
        valorPagoEvaluacionAmbiental: index % 3 === 0 ? maskedMoney(rowIndex) : 'N/A',
        fechaReportePagoEvaluacionAmbiental: index % 3 === 0 ? formatIsoDate(radicationDate.add(10, 'day')) : null,
        numeroRadicadoReportePago: index % 3 === 0 ? maskedReference('RP', rowIndex) : 'N/A',
        fechaRadicacionPermiso: formatIsoDate(radicationDate),
        numeroRadicadoSolicitudAutoridad: maskedReference('RAD', rowIndex),
        fechaProyectadaOtorgamiento: formatIsoDate(projectedGrantDate),
        fechaRealOtorgamiento: grantDate ? formatIsoDate(grantDate) : null,
        duracionTramiteMeses: grantDate ? String(Math.max(1, grantDate.diff(radicationDate, 'month'))) : 'N/A',
        semaforoAmbiental: pickByIndex(SEMAPHORE_SEQUENCE, index, typeIndex),
        autoInicioTramite: index % 2 === 0 ? `Auto ${MASK_TOKEN}-${String(index + 10).padStart(3, '0')}` : 'N/A',
        fechaEjecucionVisitaTecnica: visitDate ? formatIsoDate(visitDate) : null,
        datosContactoAutoridadAmbiental: `Funcionario ${MASK_TOKEN} / ${maskedPhone(rowIndex)}`,
        actoAdministrativoRequerimientos:
          index % 4 === 0 ? `Req. ${MASK_TOKEN}-${String(rowIndex + 50).padStart(4, '0')}` : 'N/A',
        descripcionRequerimientosAdicionales:
          index % 4 === 0 ? `Documentación complementaria y soportes técnicos ${MASK_TOKEN}` : 'Sin requerimientos reportados',
        fechaRespuestaRequerimientos: responseDate ? formatIsoDate(responseDate) : null,
        numeroRadicadoRespuestaAutoridad: responseDate ? maskedReference('RTA', rowIndex) : 'N/A',
        estadoTramite: statusLabel,
        statusKey
      };
    })
  );

export const PERMIT_ROWS = Object.freeze(buildPermitRows(PERMIT_TYPE_TEMPLATES, 30));

const buildOptions = (rows, field) =>
  Array.from(new Set(rows.map((row) => row[field]).filter(Boolean))).map((value) => ({
    value,
    label: value
  }));

export const PERMIT_UNIT_OPTIONS = Object.freeze(buildOptions(PERMIT_ROWS, 'unidad'));
export const PERMIT_TYPE_OPTIONS = Object.freeze(buildOptions(PERMIT_ROWS, 'tipoPermiso'));
export const PERMIT_AUTHORITY_OPTIONS = Object.freeze(buildOptions(PERMIT_ROWS, 'autoridad'));
export const PERMIT_STATUS_OPTIONS = Object.freeze(buildOptions(PERMIT_ROWS, 'estadoTramite'));
