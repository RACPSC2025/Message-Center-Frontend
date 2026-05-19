import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const STATUS_KEY_MAP = {
  'Pendiente Trámitar': 'pending',
  'En proceso': 'in_process',
  'Otorgado': 'granted',
  'Desistido': 'withdrawn',
  'Cerrado': 'closed'
};

const SEMAFORO_STATUS_MAP = {
  1: 'Verde',
  2: 'Amarillo',
  3: 'Rojo'
};

function normalizeRecord(record) {
  const statusKey = STATUS_KEY_MAP[record.estado_tramite] ?? 'in_process';
  const semaforoAmbiental =
    record.semaforo_ambiental ||
    SEMAFORO_STATUS_MAP[parseInt(record.semaforo_status, 10)] ||
    'Sin dato';

  return {
    recordId: `PMR-${String(record.id).padStart(4, '0')}`,
    id: record.id,
    unidad: record.unidad,
    sede: record.sede,
    tipoPermiso: record.tipo_permiso,
    tipoTramite: record.tipo_tramite,
    actoAdministrativoInicial: record.acto_administrativo_inicial,
    expediente: record.expediente,
    autoridad: record.autoridad,
    justificacionSolicitud: record.justificacion_solicitud,
    fechaProyectadaEjecucion: record.fecha_proyectada_ejecucion,
    valorPagoEvaluacionAmbiental: record.valor_pago_evaluacion,
    fechaReportePagoEvaluacionAmbiental: record.fecha_reporte_pago_evaluacion,
    numeroRadicadoReportePago: record.numero_radicado_reporte_pago,
    fechaRadicacionPermiso: record.fecha_radicacion_permiso,
    numeroRadicadoSolicitudAutoridad: record.numero_radicado_solicitud,
    fechaProyectadaOtorgamiento: record.fecha_proyectada_otorgamiento,
    fechaRealOtorgamiento: record.fecha_real_otorgamiento,
    duracionTramiteMeses: record.duracion_tramite_meses,
    semaforoAmbiental,
    semaforoStatus: record.semaforo_status,
    semaforoColor: record.semaforo_color,
    semaforoDescription: record.semaforo_description,
    autoInicioTramite: record.auto_inicio_tramite,
    fechaEjecucionVisitaTecnica: record.fecha_visita_tecnica,
    datosContactoAutoridadAmbiental: record.datos_contacto_funcionario,
    actoAdministrativoRequerimientos: record.acto_administrativo_requerimientos,
    descripcionRequerimientosAdicionales: record.descripcion_requerimientos,
    fechaRespuestaRequerimientos: record.fecha_respuesta_requerimientos,
    numeroRadicadoRespuestaAutoridad: record.numero_radicado_respuesta,
    estadoTramite: record.estado_tramite,
    statusKey,
    fechaActualizacionMatriz: record.fecha_actualizacion_matriz,
    responsables: record.responsables,
    revisores: record.revisores,
    responsablesList: record.responsables_list ?? [],
    revisoresList: record.revisores_list ?? [],
    idRequisito: record.id_requisito,
    region: record.region,
    country: record.country,
    business: record.business,
    plant: record.plant,
    contractorCompany: record.contractor_company
  };
}

function buildFilterOptions(records) {
  const pick = (field) =>
    [...new Set(records.map((r) => r[field]).filter(Boolean))]
      .sort()
      .map((v) => ({ value: v, label: v }));
  return {
    unidad: pick('unidad'),
    tipoPermiso: pick('tipoPermiso'),
    autoridad: pick('autoridad'),
    estadoTramite: pick('estadoTramite')
  };
}

const initialState = {
  tramitesList: {
    loading: false,
    data: [],
    total: 0,
    error: null
  },
  filterOptions: {
    unidad: [],
    tipoPermiso: [],
    autoridad: [],
    estadoTramite: []
  }
};

export const fetchTramitesAmbientales = createAsyncThunk(
  'permitManager/list_tramites_ambientales',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/Ambiental_Permit_api/list_tramites_ambientales',
        params
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchPermitManagerSlice = createSlice({
  name: 'permitManager',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchTramitesAmbientales.pending, (state) => {
      state.tramitesList.loading = true;
    });
    builder.addCase(fetchTramitesAmbientales.rejected, (state, action) => {
      state.tramitesList.loading = false;
      state.tramitesList.data = [];
      state.tramitesList.total = 0;
      state.tramitesList.error = action.payload ?? action.error.message;
    });
    builder.addCase(fetchTramitesAmbientales.fulfilled, (state, action) => {
      state.tramitesList.loading = false;
      const records = action.payload?.data?.records ?? [];
      const normalized = records.map(normalizeRecord);
      state.tramitesList.data = normalized;
      state.tramitesList.total = action.payload?.data?.total ?? 0;
      state.tramitesList.error = null;
      state.filterOptions = buildFilterOptions(normalized);
    });
  }
});

export default fetchPermitManagerSlice.reducer;
