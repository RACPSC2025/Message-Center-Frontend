# Plantilla Estandar de Contrato API

## 1. Metadatos del Contrato
- modulo:
- version_contrato: v1
- estado: borrador | validado | aprobado
- owner_funcional:
- owner_tecnico:
- fecha_actualizacion:

## 2. Contexto
Descripcion breve del objetivo del modulo y alcance de la API.

## 3. Convenciones Generales
- Base path sugerido: /message_center_api/<dominio>/<modulo>
- Formato: JSON (UTF-8)
- Zona horaria: ISO-8601 (UTC recomendado)
- Idioma de mensajes: es/en (segun necesidad)
- Versionado: /v1 en ruta o via cabecera

Cabeceras requeridas:
- Auth-Token: <token>
- System-Token: <token-sistema>
- Content-Type: application/json

## 4. Estructura de Respuesta
Respuesta exitosa:
```json
{
  "status": true,
  "message": "ok",
  "data": {},
  "meta": {
    "trace_id": "uuid",
    "timestamp": "2026-04-10T12:00:00Z"
  }
}
```

Respuesta con error:
```json
{
  "status": false,
  "message": "Validation error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "campo",
        "reason": "requerido"
      }
    ]
  },
  "meta": {
    "trace_id": "uuid",
    "timestamp": "2026-04-10T12:00:00Z"
  }
}
```

## 5. Paginacion, Filtro y Orden
Request (query params):
- page: numero de pagina (default 1)
- page_size: tamano de pagina (default 10)
- sort_by: campo de orden
- sort_order: asc | desc
- q: texto libre
- filters: objeto de filtros por campo

Respuesta paginada:
```json
{
  "status": true,
  "message": "ok",
  "data": {
    "items": []
  },
  "meta": {
    "pagination": {
      "page": 1,
      "page_size": 10,
      "total_items": 142,
      "total_pages": 15,
      "has_next": true,
      "has_prev": false
    },
    "trace_id": "uuid"
  }
}
```

## 6. Catalogo Estandar de Errores
- 400 BAD_REQUEST: formato invalido.
- 401 UNAUTHORIZED: token invalido o ausente.
- 403 FORBIDDEN: rol sin permisos.
- 404 NOT_FOUND: recurso no encontrado.
- 409 CONFLICT: duplicidad o estado inconsistente.
- 422 VALIDATION_ERROR: reglas de negocio no cumplidas.
- 429 RATE_LIMITED: exceso de solicitudes.
- 500 INTERNAL_ERROR: error no controlado.

Formato de codigo recomendado:
- <MODULO>_<DOMINIO>_<TIPO>
- Ejemplo: PERMISOS_EXPEDIENTE_DUPLICADO

## 7. Modelo de Eventos de Dominio
Objetivo: notificar cambios relevantes para sincronizacion, auditoria y UX en tiempo real.

Campos minimos del evento:
```json
{
  "event_name": "<modulo>.<entidad>.<accion>",
  "event_version": 1,
  "occurred_at": "2026-04-10T12:00:00Z",
  "actor": {
    "id": "123",
    "type": "user"
  },
  "entity": {
    "id": "ABC-001",
    "type": "<entidad>"
  },
  "payload": {}
}
```

Nombres sugeridos:
- <modulo>.created
- <modulo>.updated
- <modulo>.status_changed
- <modulo>.due_date_alert
- <modulo>.closed

## 8. Seccion de Endpoints (Plantilla)
### 8.1 Listar recursos
- Metodo:
- Endpoint:
- Query params:
- Response 200:
- Errores:

### 8.2 Obtener detalle
- Metodo:
- Endpoint:
- Path params:
- Response 200:
- Errores:

### 8.3 Crear recurso
- Metodo:
- Endpoint:
- Body:
- Response 201:
- Errores:

### 8.4 Actualizar recurso
- Metodo:
- Endpoint:
- Body:
- Response 200:
- Errores:

### 8.5 Transiciones de estado
- Metodo:
- Endpoint:
- Body:
- Response 200:
- Errores:

## 9. Reglas de Idempotencia y Concurrencia
- Soporte opcional de Idempotency-Key en operaciones POST criticas.
- Concurrencia optimista recomendada via version o updated_at.

## 10. Checklist de Aprobacion
- Campos minimos definidos.
- Casos de error definidos.
- Paginacion y filtros definidos.
- Eventos definidos.
- Seguridad y permisos definidos.
- Ejemplos de request/response validados.
