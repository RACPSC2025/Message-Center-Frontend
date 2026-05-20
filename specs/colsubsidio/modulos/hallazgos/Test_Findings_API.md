# Postman Collection - Message Center Findings API

## Configuración Base

### URL Base
La API usa la variable `{{baseUrl}}` configurada desde `window.__APP_CONFIG__.apiUrl` en el frontend.

**Ejemplo:** `https://tu-dominio.com`

### Headers Requeridos (en todas las requests)

| Header           | Valor                                                                 |
|------------------|-----------------------------------------------------------------------|
| `Auth-Token`     | `$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa` |
| `System-Token`   | `cnch`                                                                |

> **Nota:** En desarrollo se usan los tokens hardcodeados arriba. En producción se obtienen del `localStorage`.

---

## Endpoints

### 1. Obtener Lista de Hallazgos (Paginada)

**Método:** `GET`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/list`

**Query Params:**

| Param               | Tipo     | Requerido | Descripción                                      | Ejemplo        |
|---------------------|----------|-----------|--------------------------------------------------|----------------|
| `page`              | integer  | No        | Número de página (default: 1)                    | `1`            |
| `limit`             | integer  | No        | Items por página (default: 10)                   | `20`           |
| `level1`            | integer  | No        | Filtro por región                                | `1`            |
| `level2`            | integer  | No        | Filtro por país                                  | `5`            |
| `level3`            | integer  | No        | Filtro por ubicación                             | `10`           |
| `level4`            | integer  | No        | Filtro por negocio                               | `15`           |
| `level5`            | integer  | No        | Filtro por sub-nivel                             | `20`           |
| `status`            | integer  | No        | Estado: 1=Abierto, 2=En Proceso, 3=Cerrado       | `1`            |
| `finding_source`    | integer  | No        | Fuente del hallazgo                              | `3`            |
| `finding_type`      | integer  | No        | Tipo: 1=No conformidad, 2=Observacion, 3=Oportunidad de mejora, 4=Otro | `2` |
| `date_from`         | string   | No        | Fecha inicio (formato YYYY-MM-DD)                | `2024-01-01`   |
| `date_to`           | string   | No        | Fecha fin (formato YYYY-MM-DD)                   | `2024-12-31`   |
| `reporting_person`  | integer  | No        | ID del reportero                                 | `7`            |
| `company_who_report`| integer  | No        | ID de la empresa que reportó                     | `2`            |
| `texto`             | string   | No        | Búsqueda por texto en campos del hallazgo        | `inspección`   |

**Ejemplo de Request:**
```
GET {{baseUrl}}/message_center_api/inspecciones_api/list?page=1&limit=10&status=1
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "status": 1,
      "finding_source": 1,
      "finding_source_name": "Inspección",
      "finding_type": 2,
      "finding_type_name": "Observacion",
      "reporter_name": "Juan Pérez",
      "created_at": "2024-03-15T10:30:00Z",
      "level1": 1,
      "region_name": "Región Norte",
      "level2": 5,
      "country_name": "Colombia",
      "level3": 10,
      "location_name": "Bogotá",
      "level4": 15,
      "business_name": "Planta Principal",
      "que_what": "Descripción del hallazgo",
      "que_when": "2024-03-15",
      "que_how_much": "Cantidad",
      "que_which": "Cuál",
      "que_where": "Dónde",
      "brief_description": "Descripción breve",
      "risk_analysis": {
        "nivel_riesgo": 12
      },
      "attachments": [
        {
          "url": "https://...",
          "thumbnail_url": "https://...",
          "old_name": "foto.jpg"
        }
      ],
      "action_plans_count": 2
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "total_pages": 5
  }
}
```

---

### 2. Obtener Detalles de un Hallazgo

**Método:** `GET`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/detail/{id}`

**Path Params:**

| Param | Tipo    | Requerido | Descripción          | Ejemplo |
|-------|---------|-----------|----------------------|---------|
| `id`  | integer | Sí        | ID del hallazgo      | `1`     |

**Ejemplo de Request:**
```
GET {{baseUrl}}/message_center_api/inspecciones_api/detail/1
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": 1,
    "finding_source": 1,
    "finding_source_name": "Inspección",
    "finding_type": 2,
    "finding_type_name": "Observacion",
    "reporter_name": "Juan Pérez",
    "reporting_person": 7,
    "created_by_name": "Admin",
    "created_at": "2024-03-15T10:30:00Z",
    "level1": 1,
    "region_name": "Región Norte",
    "level2": 5,
    "country_name": "Colombia",
    "level3": 10,
    "location_name": "Bogotá",
    "level4": 15,
    "business_name": "Planta Principal",
    "que_what": "Qué",
    "que_when": "2024-03-15",
    "que_how_much": "Cuánto",
    "que_which": "Cuál",
    "que_where": "Dónde",
    "brief_description": "Descripción breve del hallazgo",
    "closing_approval_responsible": 3,
    "closing_approval_responsible_name": "Responsable Cierre",
    "risk_controlled_by": 5,
    "risk_controlled_by_name": "Controlador Riesgo",
    "people_notifly": "1,2,3",
    "people_notifly_names": ["Persona 1", "Persona 2", "Persona 3"],
    "closure_date_required": "2024-04-15",
    "actual_closure_date": null,
    "area_ocurrencia": 2,
    "area_ocurrencia_name": "Producción",
    "gerencia_formulario": 1,
    "gerencia_formulario_name": "Gerencia General",
    "contractor_id": 4,
    "contractor_name": "Contratista XYZ",
    "contract_id": 8,
    "contract_name": "Contrato 2024",
    "attachments": [],
    "risk_analysis": {
      "nivel_riesgo": 12
    },
    "action_plans_count": 2,
    "textofinding_es": "Texto en español",
    "textofinding_en": "Text in english"
  }
}
```

---

### 3. Obtener Opciones para Dropdowns

**Método:** `GET`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/get_dropdown_options`

**Query Params:** Ninguno

**Ejemplo de Request:**
```
GET {{baseUrl}}/message_center_api/inspecciones_api/get_dropdown_options
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "status": [
      { "id": 1, "name": "Abierto" },
      { "id": 2, "name": "En Proceso" },
      { "id": 3, "name": "Cerrado" }
    ],
    "finding_sources": [],
    "finding_types": [],
    "finding_classification": [],
    "reporters": [],
    "contractors": [],
    "area_options": [],
    "gerencia_options": [],
    "risk_levels": [],
    "employees": [],
    "positions": [],
    "basic_causes": [],
    "immediate_causes": [],
    "hazards": [],
    "sub_hazards": [],
    "potential_losses": [],
    "unsafe_acts_behavior": [],
    "users": []
  }
}
```

---

### 4. Obtener Estadísticas de Hallazgos

**Método:** `GET`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/stats`

**Query Params:** (opcionales, mismos filtros que el endpoint `/list`)

| Param              | Tipo    | Requerido | Descripción         |
|--------------------|---------|-----------|---------------------|
| `level1`           | integer | No        | Filtro por región   |
| `level2`           | integer | No        | Filtro por país     |
| `level3`           | integer | No        | Filtro por ubicación|
| `level4`           | integer | No        | Filtro por negocio  |
| `level5`           | integer | No        | Filtro por sub-nivel|
| `status`           | integer | No        | Estado              |
| `finding_source`   | integer | No        | Fuente              |
| `finding_type`     | integer | No        | Tipo                |
| `date_from`        | string  | No        | Fecha inicio        |
| `date_to`          | string  | No        | Fecha fin           |

**Ejemplo de Request:**
```
GET {{baseUrl}}/message_center_api/inspecciones_api/stats?status=1
```

---

### 5. Obtener Niveles Jerárquicos (Cascada)

**Método:** `GET`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/get_levels`

**Query Params:**

| Param         | Tipo    | Requerido | Descripción                                        | Ejemplo |
|---------------|---------|-----------|----------------------------------------------------|---------|
| `level`       | integer | Sí        | Nivel a consultar (1-5)                            | `2`     |
| `id_level1`   | integer | No*       | ID del nivel padre (requerido para level >= 2)     | `1`     |
| `id_level2`   | integer | No*       | ID del nivel padre (requerido para level >= 3)     | `5`     |
| `id_level3`   | integer | No*       | ID del nivel padre (requerido para level >= 4)     | `10`    |
| `id_level4`   | integer | No*       | ID del nivel padre (requerido para level = 5)      | `15`    |

*\* Requerido según el nivel solicitado*

**Ejemplos de Request:**

```
# Nivel 1 (sin padre)
GET {{baseUrl}}/message_center_api/inspecciones_api/get_levels?level=1

# Nivel 2 (requiere id_level1)
GET {{baseUrl}}/message_center_api/inspecciones_api/get_levels?level=2&id_level1=1

# Nivel 3 (requiere id_level1 e id_level2)
GET {{baseUrl}}/message_center_api/inspecciones_api/get_levels?level=3&id_level1=1&id_level2=5

# Nivel 4 (requiere id_level1, id_level2, id_level3)
GET {{baseUrl}}/message_center_api/inspecciones_api/get_levels?level=4&id_level1=1&id_level2=5&id_level3=10

# Nivel 5 (requiere todos los padres)
GET {{baseUrl}}/message_center_api/inspecciones_api/get_levels?level=5&id_level1=1&id_level2=5&id_level3=10&id_level4=15
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    { "id": 5, "name": "Colombia", "parent_id": 1 },
    { "id": 6, "name": "Ecuador", "parent_id": 1 }
  ]
}
```

---

### 6. Actualizar un Hallazgo

**Método:** `PUT`

**URL:** `{{baseUrl}}/message_center_api/inspecciones_api/update/{id}`

**Path Params:**

| Param | Tipo    | Requerido | Descripción          | Ejemplo |
|-------|---------|-----------|----------------------|---------|
| `id`  | integer | Sí        | ID del hallazgo      | `1`     |

**Headers:**

| Header         | Valor                  |
|----------------|------------------------|
| `Content-Type` | `application/json`     |

**Body (JSON):**

> **Nota:** Solo se deben enviar los campos que se desean actualizar (actualización parcial).

| Campo                        | Tipo    | Descripción                                    |
|------------------------------|---------|------------------------------------------------|
| `finding_source`             | integer | Fuente del hallazgo                            |
| `finding_type`               | integer | Tipo (1-4). Si es "4", usar `finding_type_other` |
| `finding_type_other`         | string  | Texto personalizado si tipo = "Otro"           |
| `reporting_person`           | integer | ID del reportero                               |
| `level1`                     | integer | Región                                         |
| `level2`                     | integer | País                                           |
| `level3`                     | integer | Ubicación                                      |
| `level4`                     | integer | Negocio                                        |
| `area_ocurrencia`            | integer | Área de ocurrencia                             |
| `gerencia_formulario`        | integer | Gerencia del formulario                        |
| `que_what`                   | string  | Qué                                            |
| `que_when`                   | string  | Cuándo (fecha YYYY-MM-DD)                      |
| `que_how_much`               | string  | Cuánto                                         |
| `que_which`                  | string  | Cuál                                           |
| `que_where`                  | string  | Dónde                                          |
| `brief_description`          | string  | Descripción breve                              |
| `closure_date_required`      | string  | Fecha de cierre requerida (YYYY-MM-DD)         |
| `closing_approval_responsible`| integer| Responsable de aprobación de cierre            |
| `risk_controlled_by`         | integer | Controlador de riesgo                          |
| `people_notifly`             | string  | IDs de personas a notificar (separados por coma) |
| `contractors`                | integer | ID del contratista                             |
| `contract`                   | integer | ID del contrato                                |
| `status`                     | integer | Estado (1=Abierto, 2=En Proceso, 3=Cerrado)    |

**Ejemplo de Request:**
```
PUT {{baseUrl}}/message_center_api/inspecciones_api/update/1
```

**Body:**
```json
{
  "status": 2,
  "brief_description": "Descripción actualizada del hallazgo",
  "closure_date_required": "2024-05-01"
}
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": 2,
    "brief_description": "Descripción actualizada del hallazgo",
    ...
  }
}
```

---

## Endpoints Pendientes (No Implementados)

Estos endpoints están definidos en la UI pero **NO** tienen implementación en el backend aún:

| Endpoint                              | Método   | Propósito                                |
|---------------------------------------|----------|------------------------------------------|
| `/message_center_api/inspecciones_api/delete/{id}` | DELETE   | Eliminar un hallazgo                     |
| `/message_center_api/inspecciones_api/risk_analysis/{id}/save` | PUT/POST | Guardar observaciones de análisis de riesgo |
| `/message_center_api/inspecciones_api/risk_analysis/{id}/upload` | POST     | Subir archivo al análisis de riesgo      |
| `/message_center_api/inspecciones_api/risk_analysis/{id}/delete-file` | DELETE   | Eliminar archivo del análisis de riesgo  |
| `/message_center_api/inspecciones_api/five_whys/{id}/save` | PUT/POST | Guardar análisis 5 porqués               |
| `/message_center_api/inspecciones_api/five_whys/{id}/upload` | POST     | Subir archivo al análisis 5 porqués      |
| `/message_center_api/inspecciones_api/five_whys/{id}/delete-file` | DELETE   | Eliminar archivo del análisis 5 porqués  |

---

## Configuración Rápida en Postman

### 1. Crear una Colección

1. Abrir Postman
2. Click en **Collections** → **New Collection**
3. Nombre: `Message Center - Findings API`

### 2. Configurar Variables de Colección

1. Click en los `...` de la colección → **Edit**
2. Ir a la pestaña **Variables**
3. Agregar:

| Variable      | Initial Value                                      | Current Value                                    | Type    |
|---------------|----------------------------------------------------|--------------------------------------------------|---------|
| `baseUrl`     | `https://tu-dominio.com`                           | `https://tu-dominio.com`                         | default |
| `authToken`   | `$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa` | `$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa` | default |
| `systemToken` | `cnch`                                             | `cnch`                                           | default |

### 3. Configurar Headers por Defecto

En la colección, ir a la pestaña **Authorization**:

- **Type:** `No Auth` (los headers se agregan manualmente)

O ir a la pestaña **Headers** y agregar:

| Header         | Value                                        |
|----------------|----------------------------------------------|
| `Auth-Token`   | `{{authToken}}`                              |
| `System-Token` | `{{systemToken}}`                            |

### 4. Agregar Requests

Para cada endpoint de arriba:

1. Click en **Add Request** en la colección
2. Nombrar la request (ej: `1. List Findings`)
3. Configurar método y URL
4. Agregar query params si aplica
5. Guardar

---

## Referencia Rápida de Valores

### Estados

| Valor | Significado   |
|-------|---------------|
| `1`   | Abierto       |
| `2`   | En Proceso    |
| `3`   | Cerrado       |

### Tipos de Hallazgo

| Valor | Significado          |
|-------|----------------------|
| `1`   | No conformidad       |
| `2`   | Observacion          |
| `3`   | Oportunidad de mejora|
| `4`   | Otro                 |

### Niveles de Riesgo (nivel_riesgo)

| Rango      | Significado     |
|------------|-----------------|
| `0`        | No evaluado     |
| `1-7`      | Bajo            |
| `8-15`     | Medio           |
| `16+`      | Alto            |

---

## Troubleshooting

### Error 401 - Unauthorized
- Verificar que `Auth-Token` y `System-Token` estén correctos
- Los tokens pueden expirar, obtener nuevos tokens del `localStorage` del navegador

### Error 404 - Not Found
- Verificar que la URL base sea correcta
- Verificar que el ID del hallazgo exista

### Error de CORS
- Si se hacen requests desde Postman, CORS no aplica
- Si se hacen requests desde el browser, el backend debe permitir CORS
