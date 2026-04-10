# Contrato API (Borrador) - Gestor de Permisos

## 1. Metadatos
- modulo: gestor-permisos
- version_contrato: v1
- estado: borrador
- owner_funcional: por definir
- owner_tecnico: por definir
- fecha_actualizacion: 2026-04-10

## 2. Objetivo
Definir contratos base para administrar permisos, requisitos y su seguimiento operativo.

## 3. Base Path y Seguridad
- Base path sugerido: /message_center_api/colsubsidio/gestor_permisos/v1
- Auth-Token y System-Token requeridos.
- Formato JSON.

## 4. Endpoints
### 4.1 Listar permisos
- Metodo: GET
- Endpoint: /permisos
- Query params:
  - page, page_size, sort_by, sort_order, q
  - estado, solicitante, fecha_desde, fecha_hasta, responsable
- Response 200 (resumen):
```json
{
  "status": true,
  "data": {
    "items": [
      {
        "id": "PM-9021",
        "expediente": "EXP-2024-001",
        "solicitante": "Inmobiliaria del Norte S.A.",
        "estado": "aprobado",
        "fecha_vencimiento": "2025-10-12",
        "requisitos_total": 14,
        "requisitos_pendientes": 2
      }
    ]
  },
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 142,
      "total_pages": 15
    }
  }
}
```

### 4.2 Obtener detalle de permiso
- Metodo: GET
- Endpoint: /permisos/{permiso_id}
- Response 200: datos generales + requisitos + trazabilidad.

### 4.3 Crear permiso
- Metodo: POST
- Endpoint: /permisos
- Body minimo:
```json
{
  "expediente": "EXP-2026-001",
  "solicitante": "Empresa X",
  "estado": "en_revision",
  "fecha_vencimiento": "2026-12-31",
  "responsable_id": "USR-10"
}
```
- Response 201: permiso creado.

### 4.4 Actualizar permiso
- Metodo: PUT
- Endpoint: /permisos/{permiso_id}
- Body: campos editables del permiso.
- Response 200: permiso actualizado.

### 4.5 Cambiar estado de permiso
- Metodo: PATCH
- Endpoint: /permisos/{permiso_id}/estado
- Body:
```json
{
  "estado": "aprobado",
  "comentario": "Validacion final completada"
}
```
- Validacion: no cerrar si hay requisitos criticos pendientes.

### 4.6 Listar requisitos de permiso
- Metodo: GET
- Endpoint: /permisos/{permiso_id}/requisitos

### 4.7 Crear requisito
- Metodo: POST
- Endpoint: /permisos/{permiso_id}/requisitos
- Body minimo:
```json
{
  "tipo": "licencia_ambiental",
  "estado": "pendiente",
  "fecha_limite": "2026-08-30",
  "es_critico": true
}
```

### 4.8 Actualizar requisito
- Metodo: PUT
- Endpoint: /permisos/{permiso_id}/requisitos/{requisito_id}

### 4.9 Adjuntar evidencia a requisito
- Metodo: POST
- Endpoint: /permisos/{permiso_id}/requisitos/{requisito_id}/evidencias
- Body: referencia de archivo + metadata.

## 5. Errores Especificos
- PERMISOS_EXPEDIENTE_DUPLICADO (409)
- PERMISOS_FECHA_INVALIDA (422)
- PERMISOS_CIERRE_BLOQUEADO_REQUISITOS_CRITICOS (422)
- PERMISOS_REQUISITO_NO_ENCONTRADO (404)

## 6. Paginacion
- page (default 1)
- page_size (default 10)
- max page_size sugerido: 100

## 7. Eventos de Dominio
- gestor_permisos.permiso.created
- gestor_permisos.permiso.updated
- gestor_permisos.permiso.estado_changed
- gestor_permisos.requisito.created
- gestor_permisos.requisito.estado_changed
- gestor_permisos.permiso.due_date_alert

Payload minimo sugerido:
```json
{
  "event_name": "gestor_permisos.permiso.estado_changed",
  "occurred_at": "2026-04-10T12:00:00Z",
  "entity": { "id": "PM-9021", "type": "permiso" },
  "payload": {
    "estado_anterior": "en_revision",
    "estado_nuevo": "aprobado"
  }
}
```

## 8. Notas de Implementacion
- Este contrato es preliminar y debe alinearse con convenciones de backend existentes.
- Validar nomenclatura final de rutas con el equipo de API.
