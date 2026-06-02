# Endpoints Implementados - Findings Module

## Lista de Endpoints

| # | Método | Endpoint | Descripción | Archivo del Store | Thunk |
|---|--------|----------|-------------|-------------------|-------|
| 1 | `GET`  | `/message_center_api/inspecciones_api/list` | Obtener lista paginada de hallazgos con filtros opcionales | `src/stores/findings/fetchFindingsSlice.js` | `fetchFindings` |
| 2 | `PUT`  | `/message_center_api/inspecciones_api/update/{id}` | Actualizar campos de un hallazgo (parcial) | `src/stores/findings/fetchFindingsSlice.js` | `updateFinding` |
| 3 | `GET`  | `/message_center_api/inspecciones_api/detail/{id}` | Obtener detalles completos de un hallazgo por ID | `src/stores/findings/fetchFindingDetailsSlice.js` | `fetchFindingDetails` |
| 4 | `GET`  | `/message_center_api/inspecciones_api/get_dropdown_options` | Obtener opciones para dropdowns de formularios | `src/stores/findings/fetchFindingsOptionsSlice.js` | `fetchFindingsOptions` |
| 5 | `GET`  | `/message_center_api/inspecciones_api/stats` | Obtener estadísticas de hallazgos con filtros opcionales | `src/stores/findings/fetchFindingsStatsSlice.js` | `fetchFindingsStats` |
| 6 | `GET`  | `/message_center_api/inspecciones_api/get_levels` | Obtener niveles jerárquicos en cascada (1-5) | `src/stores/tasks/fetchFindingsListLevelSlice.js` | `fetchTaskListLevel` |
