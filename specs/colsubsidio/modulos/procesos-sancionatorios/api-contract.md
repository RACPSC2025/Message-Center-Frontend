# Contrato API (Borrador) - Procesos Sancionatorios

## 1. Metadatos
- modulo: procesos-sancionatorios
- version_contrato: v1
- estado: borrador
- owner_funcional: por definir
- owner_tecnico: por definir
- fecha_actualizacion: 2026-04-10

## 2. Objetivo
Definir contratos base para administrar procesos sancionatorios, hitos, evidencias y resultados.

## 3. Base Path y Seguridad
- Base path sugerido: /message_center_api/colsubsidio/procesos_sancionatorios/v1
- Auth-Token y System-Token requeridos.
- Formato JSON.

## 4. Endpoints
### 4.1 Listar procesos
- Metodo: GET
- Endpoint: /procesos
- Query params:
  - page, page_size, sort_by, sort_order, q
  - gravedad, estado, fecha_notificacion_desde, fecha_notificacion_hasta
- Response 200 (resumen):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "PS-2024-001",
        "codigo": "EXP-2024-001",
        "norma_asociada": "ISO 14001:2015",
        "gravedad": "alta",
        "estado": "notificado",
        "fecha_limite": "2024-10-15"
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 36,
      "total_pages": 4
    }
  }
}
```

### 4.2 Obtener detalle de proceso
- Metodo: GET
- Endpoint: /procesos/{proceso_id}
- Response 200: datos del proceso + timeline de hitos + anexos.

### 4.3 Crear proceso
- Metodo: POST
- Endpoint: /procesos
- Body minimo:
```json
{
  "codigo": "EXP-2026-010",
  "norma_asociada": "Ley de Proteccion de Datos",
  "gravedad": "media",
  "estado": "notificado",
  "fecha_notificacion": "2026-04-10",
  "fecha_limite": "2026-05-10",
  "responsable_id": "USR-20"
}
```
- Response 201: proceso creado.

### 4.4 Actualizar proceso
- Metodo: PUT
- Endpoint: /procesos/{proceso_id}
- Body: campos editables del proceso.

### 4.5 Cambiar estado procesal
- Metodo: PATCH
- Endpoint: /procesos/{proceso_id}/estado
- Body:
```json
{
  "estado": "en_descargos",
  "comentario": "Se habilita etapa de respuesta"
}
```

### 4.6 Gestion de hitos
- Crear hito
  - Metodo: POST
  - Endpoint: /procesos/{proceso_id}/hitos
- Actualizar hito
  - Metodo: PUT
  - Endpoint: /procesos/{proceso_id}/hitos/{hito_id}
- Listar hitos
  - Metodo: GET
  - Endpoint: /procesos/{proceso_id}/hitos

Body minimo hito:
```json
{
  "tipo": "descargo",
  "fecha_limite": "2026-04-25",
  "estado": "pendiente",
  "responsable_id": "USR-20"
}
```

### 4.7 Adjuntar evidencia
- Metodo: POST
- Endpoint: /procesos/{proceso_id}/evidencias
- Body: referencia de archivo + metadata.

### 4.8 Cerrar proceso
- Metodo: POST
- Endpoint: /procesos/{proceso_id}/cierre
- Body minimo:
```json
{
  "resultado": "cerrado_sin_sancion",
  "comentario_cierre": "No se evidencia incumplimiento"
}
```

## 5. Errores Especificos
- SANCIONATORIO_CODIGO_DUPLICADO (409)
- SANCIONATORIO_NORMA_REQUERIDA (422)
- SANCIONATORIO_FECHA_LIMITE_REQUERIDA (422)
- SANCIONATORIO_CIERRE_SIN_RESULTADO (422)
- SANCIONATORIO_PROCESO_NO_ENCONTRADO (404)

## 6. Paginacion
- page (default 1)
- page_size (default 10)
- max page_size sugerido: 100

## 7. Eventos de Dominio
- procesos_sancionatorios.proceso.created
- procesos_sancionatorios.proceso.updated
- procesos_sancionatorios.proceso.estado_changed
- procesos_sancionatorios.hito.created
- procesos_sancionatorios.hito.vencido
- procesos_sancionatorios.proceso.closed

Payload minimo sugerido:
```json
{
  "event_name": "procesos_sancionatorios.hito.vencido",
  "occurred_at": "2026-04-10T12:00:00Z",
  "entity": { "id": "HITO-110", "type": "hito" },
  "payload": {
    "proceso_id": "PS-2024-001",
    "dias_vencido": 3,
    "gravedad": "alta"
  }
}
```

## 8. Notas de Implementacion
- Este contrato es preliminar y puede ajustarse por capacidades del backend.
- Validar politica de adjuntos (tamano, extensiones, retencion).
