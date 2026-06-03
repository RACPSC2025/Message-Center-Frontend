export const MONITORING_STATUS_META = Object.freeze({
  compliant: { label: 'Cumplido', color: '#2E7D32', background: '#E7F6EA' },
  pending: { label: 'Pendiente', color: '#D97706', background: '#FFF4DA' },
  alert: { label: 'Alerta', color: '#C62828', background: '#FFE8E8' },
  scheduled: { label: 'Programado', color: '#0B7A84', background: '#E4F7F9' }
});

export const MONITORING_CATEGORY_OPTIONS = Object.freeze([
  { value: 'Agua', label: 'Agua' },
  { value: 'Aire', label: 'Aire' },
  { value: 'Suelo', label: 'Suelo' },
  { value: 'Ruido', label: 'Ruido' }
]);

export const MONITORING_YEAR_OPTIONS = Object.freeze([
  { value: '2026', label: '2026' },
  { value: '2025', label: '2025' }
]);

export const MONITORING_STRUCTURE_OPTIONS = Object.freeze([
  { value: 'Recreación', label: 'Recreación' },
  { value: 'Administrativa', label: 'Administrativa' },
  { value: 'Salud', label: 'Salud' },
  { value: 'Hotelería', label: 'Hotelería' }
]);

export const MONITORING_SITE_OPTIONS = Object.freeze([
  { value: 'Club Bellavista', label: 'Club Bellavista' },
  { value: 'Sede 26', label: 'Sede 26' },
  { value: 'Clínica Norte', label: 'Clínica Norte' },
  { value: 'Hotel Lanceros', label: 'Hotel Lanceros' }
]);

export const MONITORING_ANALYSIS_TYPE_OPTIONS = Object.freeze([
  { value: 'Cuerpo de agua', label: 'Cuerpo de agua' },
  { value: 'Alcantarillado', label: 'Alcantarillado' },
  { value: 'Emisiones', label: 'Emisiones' },
  { value: 'Gestión mensual', label: 'Gestión mensual' }
]);

export const MONITORING_STATUS_OPTIONS = Object.freeze(
  Object.entries(MONITORING_STATUS_META).map(([value, meta]) => ({
    value,
    label: meta.label
  }))
);

const monitoringTemplates = [
  {
    ues: 'Recreación',
    sede: 'Club Bellavista',
    punto: 'Pozo No. 1',
    ubicacion: 'BV-01 - Bogotá',
    categoria: 'Agua',
    tipoAnalisis: 'Cuerpo de agua',
    parametros: 18,
    responsable: 'Gestión Ambiental',
    statusKey: 'compliant'
  },
  {
    ues: 'Administrativa',
    sede: 'Sede 26',
    punto: 'Salida Trampa Grasas',
    ubicacion: 'S26-TG1 - Bogotá',
    categoria: 'Agua',
    tipoAnalisis: 'Alcantarillado',
    parametros: 8,
    responsable: 'Operaciones',
    statusKey: 'pending'
  },
  {
    ues: 'Recreación',
    sede: 'Club Bellavista',
    punto: 'Emisión Chimenea Caldera',
    ubicacion: 'LC-R9H1 - Bogotá',
    categoria: 'Aire',
    tipoAnalisis: 'Emisiones',
    parametros: 4,
    responsable: 'Mantenimiento',
    statusKey: 'alert'
  },
  {
    ues: 'Salud',
    sede: 'Clínica Norte',
    punto: 'Residuos Hospitalarios',
    ubicacion: 'CN-RH2 - Bogotá',
    categoria: 'Suelo',
    tipoAnalisis: 'Gestión mensual',
    parametros: 6,
    responsable: 'Calidad',
    statusKey: 'scheduled'
  },
  {
    ues: 'Hotelería',
    sede: 'Hotel Lanceros',
    punto: 'Vertimiento Principal',
    ubicacion: 'HL-VP1 - Paipa',
    categoria: 'Agua',
    tipoAnalisis: 'Alcantarillado',
    parametros: 12,
    responsable: 'Servicios Generales',
    statusKey: 'compliant'
  },
  {
    ues: 'Administrativa',
    sede: 'Sede 26',
    punto: 'Medición Ruido Perimetral',
    ubicacion: 'S26-RP1 - Bogotá',
    categoria: 'Ruido',
    tipoAnalisis: 'Gestión mensual',
    parametros: 3,
    responsable: 'Seguridad y Salud',
    statusKey: 'pending'
  }
];

export const environmentalMonitoringRows = Object.freeze(
  Array.from({ length: 24 }, (_, index) => {
    const template = monitoringTemplates[index % monitoringTemplates.length];
    const month = String(2 + (index % 8)).padStart(2, '0');
    const day = String(3 + (index % 23)).padStart(2, '0');
    const nextMonth = String(4 + (index % 7)).padStart(2, '0');
    const nextDay = String(5 + (index % 22)).padStart(2, '0');

    return {
      id: `MA-${String(index + 1).padStart(4, '0')}`,
      uesSede: `${template.ues} / ${template.sede}`,
      ues: template.ues,
      sede: template.sede,
      puntoDefinido: `${template.punto} ${index + 1}`,
      ubicacion: template.ubicacion,
      categoria: template.categoria,
      tipoAnalisis: template.tipoAnalisis,
      parametros: `${template.parametros} parámetros`,
      estado: MONITORING_STATUS_META[template.statusKey].label,
      statusKey: template.statusKey,
      fechaUltimoMonitoreo: `2026-${month}-${day}`,
      proximoMonitoreo: `2026-${nextMonth}-${nextDay}`,
      responsable: template.responsable,
      lat: 4.65 + index * 0.006,
      lng: -74.08 - index * 0.004
    };
  })
);

export const ENVIRONMENTAL_MONITORING_INITIAL_VISIBLE_COLUMNS = Object.freeze([
  'actions',
  'uesSede',
  'puntoDefinido',
  'categoria',
  'tipoAnalisis',
  'estado',
  'proximoMonitoreo'
]);
