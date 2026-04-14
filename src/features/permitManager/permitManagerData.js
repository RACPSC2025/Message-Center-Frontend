import dayjs from 'dayjs';

const TODAY = dayjs().startOf('day');

export const STATUS_META = Object.freeze({
  approved: {
    label: 'Aprobado',
    dotColor: '#0B7A84'
  },
  in_review: {
    label: 'En revisión',
    dotColor: '#E8A126'
  },
  processing: {
    label: 'En trámite',
    dotColor: '#64748B'
  },
  expired: {
    label: 'Vencido',
    dotColor: '#C53535'
  }
});

const RESPONSIBLE_OPTIONS = Object.freeze([
  { value: 'noel_calderon', label: 'Noel Calderón' },
  { value: 'laura_mendez', label: 'Laura Méndez' },
  { value: 'camila_salazar', label: 'Camila Salazar' },
  { value: 'diego_martinez', label: 'Diego Martínez' },
  { value: 'andres_pardo', label: 'Andrés Pardo' },
  { value: 'juliana_castro', label: 'Juliana Castro' }
]);

const APPLICANT_POOL = Object.freeze([
  'Inmobiliaria del Norte S.A.',
  'Constructora Horizonte',
  'Almacenes Central S.L.',
  'Desarrollos Delta SAS',
  'Energía y Redes del Caribe',
  'Parques Industriales Andinos',
  'Logística Urbana Integral',
  'Operadora Vial Metropolitana',
  'Servicios Técnicos del Pacífico',
  'Compañía Minera del Centro',
  'Infraestructura Nova',
  'Gestión Ambiental Terranova'
]);

const ORGANIZATION_TREE = Object.freeze([
  {
    value: 'negocio_infraestructura',
    label: 'Infraestructura',
    companies: [
      {
        value: 'compania_norte',
        label: 'Compañía Norte',
        regions: [
          {
            value: 'region_centro',
            label: 'Centro',
            locations: [
              { value: 'ubicacion_bogota', label: 'Bogotá' },
              { value: 'ubicacion_tocancipa', label: 'Tocancipá' }
            ]
          },
          {
            value: 'region_caribe',
            label: 'Caribe',
            locations: [
              { value: 'ubicacion_barranquilla', label: 'Barranquilla' },
              { value: 'ubicacion_cartagena', label: 'Cartagena' }
            ]
          }
        ]
      },
      {
        value: 'compania_metropolitana',
        label: 'Compañía Metropolitana',
        regions: [
          {
            value: 'region_altiplano',
            label: 'Altiplano',
            locations: [
              { value: 'ubicacion_chia', label: 'Chía' },
              { value: 'ubicacion_zipaquira', label: 'Zipaquirá' }
            ]
          },
          {
            value: 'region_occidente',
            label: 'Occidente',
            locations: [
              { value: 'ubicacion_medellin', label: 'Medellín' },
              { value: 'ubicacion_rionegro', label: 'Rionegro' }
            ]
          }
        ]
      }
    ]
  },
  {
    value: 'negocio_operaciones',
    label: 'Operaciones',
    companies: [
      {
        value: 'compania_oriente',
        label: 'Compañía Oriente',
        regions: [
          {
            value: 'region_llanos',
            label: 'Llanos',
            locations: [
              { value: 'ubicacion_villavicencio', label: 'Villavicencio' },
              { value: 'ubicacion_yopal', label: 'Yopal' }
            ]
          },
          {
            value: 'region_sur',
            label: 'Sur',
            locations: [
              { value: 'ubicacion_pasto', label: 'Pasto' },
              { value: 'ubicacion_neiva', label: 'Neiva' }
            ]
          }
        ]
      },
      {
        value: 'compania_occidente',
        label: 'Compañía Occidente',
        regions: [
          {
            value: 'region_pacifico',
            label: 'Pacífico',
            locations: [
              { value: 'ubicacion_cali', label: 'Cali' },
              { value: 'ubicacion_buenaventura', label: 'Buenaventura' }
            ]
          },
          {
            value: 'region_andina',
            label: 'Andina',
            locations: [
              { value: 'ubicacion_manizales', label: 'Manizales' },
              { value: 'ubicacion_pereira', label: 'Pereira' }
            ]
          }
        ]
      }
    ]
  },
  {
    value: 'negocio_energia',
    label: 'Energía',
    companies: [
      {
        value: 'compania_costa',
        label: 'Compañía Costa',
        regions: [
          {
            value: 'region_norte_ext',
            label: 'Norte',
            locations: [
              { value: 'ubicacion_santa_marta', label: 'Santa Marta' },
              { value: 'ubicacion_valledupar', label: 'Valledupar' }
            ]
          },
          {
            value: 'region_guajira',
            label: 'Guajira',
            locations: [
              { value: 'ubicacion_riohacha', label: 'Riohacha' },
              { value: 'ubicacion_maicao', label: 'Maicao' }
            ]
          }
        ]
      },
      {
        value: 'compania_altiplano',
        label: 'Compañía Altiplano',
        regions: [
          {
            value: 'region_oriente_central',
            label: 'Oriente Central',
            locations: [
              { value: 'ubicacion_tunja', label: 'Tunja' },
              { value: 'ubicacion_sogamoso', label: 'Sogamoso' }
            ]
          },
          {
            value: 'region_sabana',
            label: 'Sabana',
            locations: [
              { value: 'ubicacion_soacha', label: 'Soacha' },
              { value: 'ubicacion_funza', label: 'Funza' }
            ]
          }
        ]
      }
    ]
  }
]);

const flattenOrganizationTree = (tree) =>
  tree.flatMap((business) =>
    business.companies.flatMap((company) =>
      company.regions.flatMap((region) =>
        region.locations.map((location) => ({
          id_level1: business.value,
          businessLabel: business.label,
          id_level2: company.value,
          companyLabel: company.label,
          id_level3: region.value,
          regionLabel: region.label,
          id_level4: location.value,
          locationLabel: location.label
        }))
      )
    )
  );

const ORGANIZATION_LOCATIONS = flattenOrganizationTree(ORGANIZATION_TREE);

const FIXED_PERMITS = Object.freeze([
  {
    permitId: 'PM-9021',
    permitNumber: 'EXP-2024-001',
    applicant: 'Inmobiliaria del Norte S.A.',
    status: 'approved',
    statusLabel: STATUS_META.approved.label,
    requirementsTotal: 14,
    expiredRequirements: 0,
    dueDate: TODAY.add(180, 'day').format('YYYY-MM-DD'),
    createdDate: TODAY.subtract(80, 'day').format('YYYY-MM-DD'),
    responsibleId: 'noel_calderon',
    responsibleName: 'Noel Calderón',
    id_level1: 'negocio_infraestructura',
    businessLabel: 'Infraestructura',
    id_level2: 'compania_norte',
    companyLabel: 'Compañía Norte',
    id_level3: 'region_centro',
    regionLabel: 'Centro',
    id_level4: 'ubicacion_bogota',
    locationLabel: 'Bogotá'
  },
  {
    permitId: 'PM-8842',
    permitNumber: 'EXP-2024-015',
    applicant: 'Constructora Horizonte',
    status: 'in_review',
    statusLabel: STATUS_META.in_review.label,
    requirementsTotal: 8,
    expiredRequirements: 2,
    dueDate: TODAY.add(14, 'day').format('YYYY-MM-DD'),
    createdDate: TODAY.subtract(60, 'day').format('YYYY-MM-DD'),
    responsibleId: 'laura_mendez',
    responsibleName: 'Laura Méndez',
    id_level1: 'negocio_infraestructura',
    businessLabel: 'Infraestructura',
    id_level2: 'compania_norte',
    companyLabel: 'Compañía Norte',
    id_level3: 'region_caribe',
    regionLabel: 'Caribe',
    id_level4: 'ubicacion_barranquilla',
    locationLabel: 'Barranquilla'
  },
  {
    permitId: 'PM-9104',
    permitNumber: 'EXP-2023-098',
    applicant: 'Almacenes Central S.L.',
    status: 'expired',
    statusLabel: STATUS_META.expired.label,
    requirementsTotal: 22,
    expiredRequirements: 4,
    dueDate: TODAY.subtract(5, 'day').format('YYYY-MM-DD'),
    createdDate: TODAY.subtract(140, 'day').format('YYYY-MM-DD'),
    responsibleId: 'camila_salazar',
    responsibleName: 'Camila Salazar',
    id_level1: 'negocio_operaciones',
    businessLabel: 'Operaciones',
    id_level2: 'compania_occidente',
    companyLabel: 'Compañía Occidente',
    id_level3: 'region_pacifico',
    regionLabel: 'Pacífico',
    id_level4: 'ubicacion_cali',
    locationLabel: 'Cali'
  }
]);

const STATUS_SEQUENCE = ['approved', 'in_review', 'processing', 'approved', 'expired'];
const DUE_DATE_OFFSETS = [120, 35, 12, 180, -7, 60, 24, 95, -20, 150];
const CREATED_DATE_OFFSETS = [20, 30, 45, 60, 75, 95, 110, 130];

const buildGeneratedPermits = (count) =>
  Array.from({ length: count }, (_, index) => {
    const location = ORGANIZATION_LOCATIONS[index % ORGANIZATION_LOCATIONS.length];
    const status = STATUS_SEQUENCE[index % STATUS_SEQUENCE.length];
    const responsible = RESPONSIBLE_OPTIONS[index % RESPONSIBLE_OPTIONS.length];
    const dueDate = TODAY.add(
      DUE_DATE_OFFSETS[index % DUE_DATE_OFFSETS.length] + Math.floor(index / 10) * 6,
      'day'
    );
    const createdDate = TODAY.subtract(
      CREATED_DATE_OFFSETS[index % CREATED_DATE_OFFSETS.length] + index * 2,
      'day'
    );
    const requirementsTotal = 6 + ((index * 3) % 17);
    const dueDateDiff = dueDate.diff(TODAY, 'day');

    return {
      permitId: `PM-${9200 + index}`,
      permitNumber: `EXP-${2024 + (index % 2)}-${String(index + 21).padStart(3, '0')}`,
      applicant: APPLICANT_POOL[index % APPLICANT_POOL.length],
      status,
      statusLabel: STATUS_META[status].label,
      requirementsTotal,
      expiredRequirements: dueDateDiff < 0 ? 1 + (index % 4) : dueDateDiff <= 15 ? 1 : 0,
      dueDate: dueDate.format('YYYY-MM-DD'),
      createdDate: createdDate.format('YYYY-MM-DD'),
      responsibleId: responsible.value,
      responsibleName: responsible.label,
      ...location
    };
  });

export const PERMIT_ROWS = Object.freeze([...FIXED_PERMITS, ...buildGeneratedPermits(115)]);
