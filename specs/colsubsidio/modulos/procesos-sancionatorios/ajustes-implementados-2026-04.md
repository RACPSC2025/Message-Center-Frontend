# Ajustes Implementados - Procesos Sancionatorios (2026-04)

## 1. Objetivo del ajuste
Documentar los cambios realizados en frontend para alinear el modulo de Procesos Sancionatorios con el patron de Actions, los templates de diseno entregados y el esquema actualizado del API.

## 2. Tabla dinamica por headers del API

### Implementado
- Carga de configuracion de columnas desde `sanctioning_processes_table_headers_amatia_expres`.
- Mapeo dinamico de:
  - titulo por idioma (`title_es`, `title_en`),
  - orden por `order`,
  - ancho por `column_width`,
  - comportamiento por `column_type`,
  - editabilidad por `edit`.
- Visibilidad inicial por `display_in_table`.

### Regla funcional aplicada
- Si `display_in_table` es `FALSE`, la columna no aparece por defecto en la grilla.
- La columna sigue existiendo en el selector para que el usuario pueda habilitarla manualmente.

## 3. Consumo API de headers (patron Actions)

### Implementado
- El endpoint de headers se consume con patron equivalente al modulo Actions:
  - `POST` con `axiosInstance`.
- No se realizaron cambios en archivos globales de configuracion (`setupProxy`, `axios`, runtime config).

## 4. Fuente temporal de datos

### Implementado
- Se mantiene JSON temporal para filas de tabla en entorno de desarrollo.
- Se removio el JSON temporal de headers, ya que los headers provienen del API real.

## 5. Drawer de detalles (rediseno funcional)

### Estructura implementada
- Tabs fijas por fase legal:
  - `FASE I`
  - `FASE II`
  - `FASE III`
  - `CIERRE`
- Acordeones colapsados por defecto:
  - Informacion completa del registro.
  - Bitacora por fase legal.

### Visualizacion de textos largos
- Campos largos renderizados en tarjetas full-width con:
  - `white-space: pre-line`,
  - tipografia legible,
  - alto maximo y scroll interno.

Campos cubiertos:
- `legal_phases_actions`
- `cargo_description`
- `colsubsidio_response`
- `CASE_NUMBER_AND_CONTENT_OF_RESPONSE`

## 6. Bitacora por fase legal

### Implementado
- Timeline visual por fase con nodos por tipo de evento:
  - actuacion,
  - carga de documentos/respuesta,
  - estrategia.

### Metadatos de ejemplo agregados (demo)
Cada evento de bitacora ahora incluye ejemplos para visualizar:
- ejecutor (usuario),
- fecha de ejecucion,
- adjuntos por evento.

Tipos de adjuntos demostrados:
- PDF (`.pdf`)
- Excel (`.xlsx`)
- Word (`.docx`)
- Imagen (`.jpg`, `.png`)

## 7. Compatibilidad por cambio de esquema

### Cambio reportado en API
- Campo anterior: `colsubsidio_response`
- Campo actual: `CASE_NUMBER_AND_CONTENT_OF_RESPONSE`

### Implementado
- Compatibilidad bidireccional en frontend:
  - se prioriza `CASE_NUMBER_AND_CONTENT_OF_RESPONSE`,
  - fallback a `colsubsidio_response`.
- Esto evita regresiones con datasets historicos o temporales.

## 8. Estabilidad y errores corregidos

### Corregido
- Error en drawer al abrir detalle por supuestos de campos no existentes.
- Normalizacion de texto defensiva para caracteres de control.
- Correcciones para mantener orden de hooks estable.

## 9. Archivos frontend involucrados
- `src/features/sanctioningProcesses/SanctioningProcesses.js`
- `src/features/sanctioningProcesses/components/SanctioningProcessesTable.js`
- `src/features/sanctioningProcesses/components/SanctioningProcessesDrawer.js`
- `src/stores/sanctioningProcesses/fetchSanctioningProcessesTableHeadersSlice.js`
- `src/components/TableComponent.js`

## 10. Validacion recomendada
- Verificar que la tabla cargue headers dinamicos por API y respete `display_in_table`.
- Abrir varios registros y confirmar en bitacora:
  - nombre de usuario visible por evento,
  - fecha visible por evento,
  - chips de adjuntos (pdf/excel/word/imagen).
- Confirmar visualizacion de texto largo multilinea en drawer.
- Confirmar que el campo de respuesta se muestre con esquema nuevo y legacy.
