# dpoints Implementados - Findings ModuleLista de Endpoints

| ¿Funciona?              | Método | Endpoint                                                    | Descripción                                                | Archivo del Store                                  | Thunk                  |
| ----------------------- | ------ | ----------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- | ---------------------- |
| requerimiento pendiente | `GET`  | `/message_center_api/inspecciones_api/list`                 | Obtener lista paginada de hallazgos con filtros opcionales | `src/stores/findings/fetchFindingsSlice.js`        | `fetchFindings`        |
| si                      | `PUT`  | `/message_center_api/inspecciones_api/update/{id}`          | Actualizar campos de un hallazgo (parcial)                 | `src/stores/findings/fetchFindingsSlice.js`        | `updateFinding`        |
| no                      | `GET`  | `/message_center_api/inspecciones_api/detail/{id}`          | Obtener detalles completos de un hallazgo por ID           | `src/stores/findings/fetchFindingDetailsSlice.js`  | `fetchFindingDetails`  |
| requerimiento pendiente | `GET`  | `/message_center_api/inspecciones_api/get_dropdown_options` | Obtener opciones para dropdowns de formularios             | `src/stores/findings/fetchFindingsOptionsSlice.js` | `fetchFindingsOptions` |
| no existe               | `GET`  | `/message_center_api/inspecciones_api/stats`                | Obtener estadísticas de hallazgos con filtros opcionales   | `src/stores/findings/fetchFindingsStatsSlice.js`   | `fetchFindingsStats`   |
| si                      | `GET`  | `/message_center_api/inspecciones_api/get_levels`           | Obtener niveles jerárquicos en cascada (1-5)               | `src/stores/tasks/fetchFindingsListLevelSlice.js`  | `fetchTaskListLevel`   |

### Corrección

**Listado**:
Faltan algunos campos (revisar los que retorna el endpoint para actualizar)

**Obtener por id**:
Error 500

**Dropdown de formularios**:
Revisar documento filter_dropdown_options.md para ver los detalles

### Nuevos

**Eliminar un hallazgo, solo sí**:
Es administrador
Si no tiene algún registro en análisis de causas o de porqués asociados

**Crear un halazgo**

**Listar hallazgo por usuario**

**Modificar Análisis de 5 porques**

**Modificar Análisis causas**

**Listar los cambios de un hallazgo**

**Subir adjuntos**

**Ver seguimientos**

**Relación de un hallazgo con sus acciones**

**Cerrar hallazgo:** Debe cumplir ciertas condiciones de análisis de causas y análisis de 5 porqués
