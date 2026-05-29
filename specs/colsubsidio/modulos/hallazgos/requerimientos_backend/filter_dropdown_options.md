# Requerimiento Backend: Poblar opciones de ubicación en `get_dropdown_options`

## Contexto

Los filtros del módulo de Hallazgos consumen el endpoint `/message_center_api/inspecciones_api/get_dropdown_options` para poblar los dropdowns de la barra de filtros lateral.

Actualmente el endpoint retorna las siguientes keys correctamente pobladas:

| responseKey | Filtro |
|---|---|
| `status` | Estado |
| `finding_sources` | Fuente del hallazgo |
| `reporting_persons` | Persona que reporta |
| `contractors` | Contratista |

Sin embargo, los filtros de ubicación no tienen datos porque las siguientes keys vienen como arreglos vacíos:

| responseKey | Filtro | Estado actual |
|---|---|---|
| `area_options` | País / Compañía / Departamento / Ciudad | `[]` |
| `managements` | Gerencia | `[]` |

## Requerimiento

Poblar `area_options` y `managements` en la respuesta de `get_dropdown_options` con el mismo formato que las demás keys:

```json
{
  "success": true,
  "data": {
    "area_options": [
      { "value": "1", "label": "Colombia" },
      { "value": "2", "label": "Ecuador" }
    ],
    "managements": [
      { "value": "50", "label": "JEFE MECÁNICA Y CONTINGENCIAS" }
    ]
  }
}
```

## Formato esperado

Cada ítem debe tener al menos `value` (string o número) y `label` (string), consistente con las demás keys del mismo endpoint.

## Notas

- Antes los filtros apuntaban a `/message_center_api/tasklist_api/list_location` (endpoint inexistente, retornaba 404).
- Se migraron a `get_dropdown_options` que sí existe, pero las keys de ubicación vienen vacías.
- `area_options` agrupa los datos de nivel jerárquico (país, compañía, departamento, ciudad). Si se requiere granularidad por nivel, evaluar si el backend debe exponer keys separadas (ej. `countries`, `companies`, `departments`, `cities`) o si `area_options` contiene todos y el frontend filtra.
