# Módulo de Hallazgos (Findings) - Documentación

## 1. Estructura del Módulo

### 1.1 Archivos de Componentes (`src/features/findings/`)

| Archivo                     | Descripción                                                                           |
| --------------------------- | ------------------------------------------------------------------------------------- |
| `Findings.js`               | Página principal. Gestiona filtros, paginación, lista de tarjetas y estado del drawer |
| `FindingsCardViewList.js`   | Vista de tarjetas en grid (320px). Incluye `ImageCarousel` y `CompactPagination`      |
| `FindingsDrawer.js`         | Panel lateral derecho (60% width) con navegación por tabs y modo vista/edición        |
| `FindingDetailsTab.js`      | Formulario completo con datos del hallazgo organizado en secciones                    |
| `FindingRiskAnalysisTab.js` | Tab de análisis de riesgos con editor de texto rico y subida de archivos              |
| `FindingFiveWhysTab.js`     | Tab de análisis "5 Porqués" para análisis de causa raíz                               |
| `FindingActionPlansTab.js`  | Lista de planes de acción asociados al hallazgo                                       |
| `FindingAttachmentsTab.js`  | Lista de adjuntos con opciones de ver/descargar                                       |

### 1.2 Archivos del Store (`src/stores/findings/`)

| Archivo                        | Slice             | Estado                                                                                                                                                                                                                                                                 |
| ------------------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fetchFindingsSlice.js`        | `findings`        | `{ loading, data: [], pagination: { page, limit, total, total_pages }, error }`                                                                                                                                                                                        |
| `fetchFindingDetailsSlice.js`  | `findingDetails`  | `{ loading, data: null, error }`                                                                                                                                                                                                                                       |
| `fetchFindingsOptionsSlice.js` | `findingsOptions` | `{ loading, data: { status, finding_sources, finding_types, reporters, contractors, area_options, gerencia_options, risk_levels, employees, positions, basic_causes, immediate_causes, hazards, sub_hazards, potential_losses, unsafe_acts_behavior, users }, error }` |
| `fetchFindingsStatsSlice.js`   | `findingsStats`   | `{ loading, data: null, error }`                                                                                                                                                                                                                                       |

### 1.3 Archivos Relacionados

| Archivo                                           | Descripción                                           |
| ------------------------------------------------- | ----------------------------------------------------- |
| `src/stores/tasks/fetchFindingsListLevelSlice.js` | Slice para niveles jerárquicos en cascada             |
| `src/store.js`                                    | Registro de todos los slices                          |
| `src/routes/routes.js`                            | Configuración de rutas                                |
| `src/lib/axios.js`                                | Instancia de Axios con interceptores de autenticación |
| `src/features/MessageCenterFindings.js`           | Vista alternativa enfocada en acciones (tabla)        |

---

## 2. Funcionalidades

### 2.1 Funcionalidades Implementadas

| Funcionalidad                    | Estado      | Descripción                                                                                |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------ |
| **Lista de Hallazgos**           | ✅ Completo | Vista de tarjetas en grid con imágenes, chips de estado/nivel de riesgo, información clave |
| **Búsqueda por Texto**           | ✅ Completo | Filtro por contenido de texto en los campos del hallazgo                                   |
| **Filtro Jerárquico en Cascada** | ✅ Completo | 5 niveles (level1-5) con relaciones padre-hijo                                             |
| **Filtro por Estado**            | ✅ Completo | Abierto (1), En Proceso (2), Cerrado (3)                                                   |
| **Filtros Adicionales**          | ✅ Completo | Fuente, tipo, rango de fechas, reportero, empresa                                          |
| **Paginación**                   | ✅ Completo | Items por página (10/20/30/50/100), navegación, ir a página                                |
| **Ver Detalles**                 | ✅ Completo | Drawer con 3 tabs: Detalles, Análisis de causas, Análisis 5 porqués                        |
| **Editar Hallazgo**              | ✅ Completo | Edición inline con tracking de campos modificados, solo envía campos cambiados             |
| **Bloqueo por Cierre**           | ✅ Completo | Hallazgos con estado 3 (Cerrado) deshabilitan edición/eliminación                          |
| **Vista de Planes de Acción**    | ✅ Completo | Lista de solo lectura con descripción, responsable, revisor y estado                       |
| **Vista de Adjuntos**            | ✅ Completo | Lista con iconos de ver/descargar                                                          |
| **Modal de Previsualización**    | ✅ Completo | Modal a pantalla completa con navegación para imágenes                                     |

### 2.2 Funcionalidades Parciales (UI implementada, API pendiente)

| Funcionalidad                               | Estado     | Descripción                                                                          |
| ------------------------------------------- | ---------- | ------------------------------------------------------------------------------------ |
| **Observaciones de Análisis de Riesgo**     | ⚠️ UI only | Editor de texto rico implementado, llamada API es TODO                               |
| **Subida de Archivos (Análisis de Riesgo)** | ⚠️ UI only | Validación implementada (JPG, PNG, XLS, XLSX, DOC, DOCX, PDF, max 20MB), API es TODO |
| **Análisis 5 Porqués**                      | ⚠️ UI only | 5 campos secuenciales editables, guardado/subida son TODO                            |
| **Eliminar Hallazgo**                       | ⚠️ UI only | Diálogo de confirmación existe, llamada API es TODO                                  |

---

## 3. Endpoints Utilizados

| Endpoint                | Método | Thunk Redux            | Propósito                                      | Parámetros                                                                                                                                         |
| ----------------------- | ------ | ---------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/list`                 | GET    | `fetchFindings`        | Obtener lista paginada con filtros             | `page`, `limit`, `level1-5`, `status`, `finding_source`, `finding_type`, `date_from`, `date_to`, `reporting_person`, `company_who_report`, `texto` |
| `/detail/{id}`          | GET    | `fetchFindingDetails`  | Obtener detalles completos de un hallazgo      | `id` (path)                                                                                                                                        |
| `/get_dropdown_options` | GET    | `fetchFindingsOptions` | Obtener opciones para formularios dropdown     | Ninguno                                                                                                                                            |
| `/stats`                | GET    | `fetchFindingsStats`   | Obtener estadísticas de hallazgos              | Varios filtros                                                                                                                                     |
| `/update/{id}`          | PUT    | `updateFinding`        | Actualizar un hallazgo (parcial)               | `id` (path), datos (body)                                                                                                                          |
| `/get_levels`           | GET    | `fetchTaskListLevel`   | Obtener opciones de nivel jerárquico (cascada) | `level` (1-5), `id_level1-4` (IDs padre)                                                                                                           |

### Endpoints Pendientes (TODO en el código)

| Endpoint Necesario                | Método   | Propósito                                   |
| --------------------------------- | -------- | ------------------------------------------- |
| `/delete/{id}`                    | DELETE   | Eliminar un hallazgo                        |
| `/risk_analysis/{id}/save`        | PUT/POST | Guardar observaciones de análisis de riesgo |
| `/risk_analysis/{id}/upload`      | POST     | Subir archivo al análisis de riesgo         |
| `/risk_analysis/{id}/delete-file` | DELETE   | Eliminar archivo del análisis de riesgo     |
| `/five_whys/{id}/save`            | PUT/POST | Guardar análisis 5 porqués                  |
| `/five_whys/{id}/upload`          | POST     | Subir archivo al análisis 5 porqués         |
| `/five_whys/{id}/delete-file`     | DELETE   | Eliminar archivo del análisis 5 porqués     |

---

## 4. Modelo de Datos

### Estructura de un Hallazgo

```javascript
{
  id: number,
  status: number,                    // 1=Abierto, 2=En Proceso, 3=Cerrado
  finding_source: number,
  finding_source_name: string,
  finding_type: number,              // 1=No conformidad, 2=Observacion, 3=Oportunidad de mejora, 4=Otro
  finding_type_name: string,
  reporter_name: string,
  reporting_person: number,
  created_by_name: string,
  created_at: string,                // ISO datetime

  // Jerarquía de ubicación
  level1: number, region_name: string,
  level2: number, country_name: string,
  level3: number, location_name: string,
  level4: number, business_name: string,

  // 5Qs (Análisis)
  que_what: string,                  // Qué
  que_when: string,                  // Cuándo (fecha)
  que_how_much: string,              // Cuánto
  que_which: string,                 // Cuál
  que_where: string,                 // Dónde
  brief_description: string,

  // Responsabilidades
  closing_approval_responsible: number,
  closing_approval_responsible_name: string,
  risk_controlled_by: number,
  risk_controlled_by_name: string,
  people_notifly: string,            // IDs separados por coma
  people_notifly_names: string[],

  // Fechas
  closure_date_required: string,
  actual_closure_date: string,

  // Ubicación/organización
  area_ocurrencia: number,
  area_ocurrencia_name: string,
  gerencia_formulario: number,
  gerencia_formulario_name: string,
  contractor_id: number,
  contractor_name: string,
  contract_id: number,
  contract_name: string,

  // Datos relacionados
  attachments: [],                   // Objetos con url, thumbnail_url, old_name
  risk_analysis: { nivel_riesgo: number },
  action_plans_count: number,

  // Texto
  textofinding_es: string,
  textofinding_en: string,
}
```

---

## 5. Gestión de Estado (Redux/RTK)

### Acciones Asíncronas (Thunks)

| Slice                         | Thunks                           |
| ----------------------------- | -------------------------------- |
| `fetchFindingsSlice`          | `fetchFindings`, `updateFinding` |
| `fetchFindingDetailsSlice`    | `fetchFindingDetails`            |
| `fetchFindingsOptionsSlice`   | `fetchFindingsOptions`           |
| `fetchFindingsStatsSlice`     | `fetchFindingsStats`             |
| `fetchFindingsListLevelSlice` | `fetchTaskListLevel`             |

### Acciones Síncronas (Reducers)

| Slice                         | Reducers                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------- |
| `fetchFindingsSlice`          | `resetFindings`                                                                                   |
| `fetchFindingDetailsSlice`    | `resetFindingDetails`                                                                             |
| `fetchFindingsOptionsSlice`   | `resetOptions`                                                                                    |
| `fetchFindingsListLevelSlice` | `resetLevels`, `resetLevel2AndBelow`, `resetLevel3AndBelow`, `resetLevel4AndBelow`, `resetLevel5` |

---

## 6. Patrones y Convenciones Notables

1. **Tracking de Campos Modificados**: `FindingDetailsTab` usa un `Set` para rastrear campos modificados. Solo se envían los campos cambiados al API.
2. **Dropdowns en Cascada**: La jerarquía de 5 niveles usa un patrón cascada donde seleccionar un padre limpia los hijos y obtiene las opciones del siguiente nivel.
3. **Toggle Vista/Edición**: El drawer soporta modos vista y edición. La edición está deshabilitada para hallazgos cerrados (status === 3).
4. **Manejo de Tipo "Otro"**: Cuando `finding_type === "4"`, aparece un campo de texto adicional `finding_type_other`. Al guardar, este valor reemplaza el campo tipo.
5. **Carrusel de Imágenes con Modal**: Las tarjetas incluyen carrusel con navegación por flechas, indicadores de puntos, contador y modal a pantalla completa.
6. **Validación de Archivos**: Ambos tabs (Análisis de Riesgo y 5 Porqués) validan tamaño (20MB máx) y formatos permitidos (JPG, PNG, XLS, XLSX, DOC, DOCX, PDF).
7. **Idioma**: Toda la interfaz está en español.
8. **Autenticación**: Instancia de Axios con interceptores que agregan headers `Auth-Token` y `System-Token`, y maneja redirecciones 401.

---

## 7. Resumen del Estado

| Categoría              | Estado                        |
| ---------------------- | ----------------------------- |
| **Listado y Filtros**  | ✅ Completo                   |
| **Vista de Detalles**  | ✅ Completo                   |
| **Edición**            | ✅ Completo                   |
| **Análisis de Riesgo** | ⚠️ UI completa, API pendiente |
| **Análisis 5 Porqués** | ⚠️ UI completa, API pendiente |
| **Eliminación**        | ⚠️ UI completa, API pendiente |
| **Planes de Acción**   | ✅ Solo lectura               |
| **Adjuntos**           | ✅ Solo lectura               |
