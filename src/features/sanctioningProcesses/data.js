// Estadísticas calculadas
export const statsData = [
  {
    title: 'Sanciones Activas',
    subtitle: 'Requieren atención inmediata',
    value: 3, // Basado en estados "notificado" y "en_descargos"
    percentage: 60, // 3 de 5 totales
    color: '#006971'
  },
  {
    title: 'En Descargos',
    subtitle: 'En proceso de respuesta',
    value: 2, // Basado en estados "en_descargos"
    percentage: 40, // 2 de 5 totales
    color: '#eab308'
  },
  {
    title: 'Aprobadas',
    subtitle: 'Últimos 30 días',
    value: 1, // Basado en estados "aprobado"
    percentage: 20, // 1 de 5 totales
    color: '#006971'
  }
];

// Lista de procesos sancionatorios
export const mockApiResponse = {
  status: true,
  data: {
    items: [
      {
        id: "PS-2024-001",
        codigo: "EXP-2024-001",
        norma_asociada: "ISO 14001:2015",
        gravedad: "alta",
        estado: "notificado",
        fecha_limite: "2024-10-15"
      },
      {
        id: "PS-2024-002",
        codigo: "EXP-2024-012",
        norma_asociada: "Ley de Protección de Datos",
        gravedad: "media",
        estado: "en_descargos",
        fecha_limite: "2024-10-28"
      },
      {
        id: "PS-2023-003",
        codigo: "EXP-2023-442",
        norma_asociada: "Regulación de Seguridad y Salud Ocupacional",
        gravedad: "baja",
        estado: "en_evaluacion",
        fecha_limite: "2024-10-02"
      },
      {
        id: "PS-2024-004",
        codigo: "EXP-2024-015",
        norma_asociada: "Ley de Protección Ambiental",
        gravedad: "alta",
        estado: "en_descargos",
        fecha_limite: "2024-11-20"
      },
      {
        id: "PS-2024-005",
        codigo: "EXP-2024-008",
        norma_asociada: "Normas de Calidad ISO 9001",
        gravedad: "media",
        estado: "cerrado_sin_sancion",
        fecha_limite: "2024-09-30"
      },
      {
        id: "PS-2024-006",
        codigo: "EXP-2024-023",
        norma_asociada: "Reglamento de Seguridad Industrial",
        gravedad: "alta",
        estado: "en_apelacion",
        fecha_limite: "2024-11-15"
      },
      {
        id: "PS-2024-007",
        codigo: "EXP-2024-031",
        norma_asociada: "Normas de Higiene Ocupacional",
        gravedad: "media",
        estado: "cerrado_con_sancion",
        fecha_limite: "2024-09-15"
      },
      {
        id: "PS-2023-008",
        codigo: "EXP-2023-089",
        norma_asociada: "Ley de Seguridad Vial",
        gravedad: "baja",
        estado: "notificado",
        fecha_limite: "2024-12-01"
      },
      {
        id: "PS-2024-009",
        codigo: "EXP-2024-045",
        norma_asociada: "Reglamento de Manejo de Residuos",
        gravedad: "alta",
        estado: "en_evaluacion",
        fecha_limite: "2024-11-30"
      },
      {
        id: "PS-2024-010",
        codigo: "EXP-2024-052",
        norma_asociada: "Normas de Calidad del Aire",
        gravedad: "media",
        estado: "en_descargos",
        fecha_limite: "2024-12-15"
      },
      {
        id: "PS-2023-011",
        codigo: "EXP-2023-112",
        norma_asociada: "Reglamento de Seguridad Eléctrica",
        gravedad: "alta",
        estado: "cerrado_con_sancion",
        fecha_limite: "2024-08-20"
      },
      {
        id: "PS-2024-012",
        codigo: "EXP-2024-067",
        norma_asociada: "Normas de Manejo de Sustancias Químicas",
        gravedad: "alta",
        estado: "en_evaluacion",
        fecha_limite: "2024-12-20"
      },
      {
        id: "PS-2024-013",
        codigo: "EXP-2024-078",
        norma_asociada: "Ley de Protección contra Incendios",
        gravedad: "media",
        estado: "notificado",
        fecha_limite: "2024-12-25"
      },
      {
        id: "PS-2023-014",
        codigo: "EXP-2023-145",
        norma_asociada: "Reglamento de Equipos de Protección Personal",
        gravedad: "baja",
        estado: "cerrado_sin_sancion",
        fecha_limite: "2024-08-10"
      },
      {
        id: "PS-2024-015",
        codigo: "EXP-2024-089",
        norma_asociada: "Normas de Gestión de Riesgos",
        gravedad: "alta",
        estado: "en_apelacion",
        fecha_limite: "2024-12-30"
      },
      {
        id: "PS-2024-016",
        codigo: "EXP-2024-094",
        norma_asociada: "Ley de Conservación del Agua",
        gravedad: "media",
        estado: "en_descargos",
        fecha_limite: "2025-01-05"
      },
      {
        id: "PS-2023-017",
        codigo: "EXP-2023-178",
        norma_asociada: "Reglamento de Almacenamiento Seguro",
        gravedad: "baja",
        estado: "notificado",
        fecha_limite: "2025-01-10"
      },
      {
        id: "PS-2024-018",
        codigo: "EXP-2024-103",
        norma_asociada: "Normas de Control de Contaminación",
        gravedad: "alta",
        estado: "en_evaluacion",
        fecha_limite: "2025-01-15"
      },
      {
        id: "PS-2024-019",
        codigo: "EXP-2024-118",
        norma_asociada: "Ley de Seguridad en Espacios Confinados",
        gravedad: "alta",
        estado: "cerrado_con_sancion",
        fecha_limite: "2024-07-25"
      },
      {
        id: "PS-2024-020",
        codigo: "EXP-2024-125",
        norma_asociada: "Reglamento de Manejo de Residuos Peligrosos",
        gravedad: "alta",
        estado: "en_descargos",
        fecha_limite: "2025-01-20"
      }
    ]
  },
  meta: {
    pagination: {
      page: 1,
      page_size: 10
    }
  }
};