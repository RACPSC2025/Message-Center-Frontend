# Contrato API Actions Module

## API: action_form_submit_amatia_express

### Endpoint

- POST /message_center_api/Action_api/action_form_submit_amatia_express

### Reglas de fuente de datos

- Campo principal: action_source
- Valores permitidos: hs_action, all_action_plan
- Si action_source no llega, el backend usa hs_action por defecto
- module_string_id no define la tabla destino en este endpoint


### Reglas de frontend y validación (2024-06)

#### 1. Validación de niveles (level_1 requerido, los demás opcionales)

- Solo `level_1` es obligatorio en el formulario de acciones. `level_2`, `level_3` y `level_4` son opcionales y solo se muestran si existen opciones para el nivel anterior.
- Esta validación está centralizada en `src/config/validationConfig.js` bajo `REQUIRED_FIELDS_CONFIG`.

#### 2. Lógica unificada de niveles (filtros y formulario)

- Tanto los filtros como el formulario usan la misma lógica y endpoints para obtener opciones de niveles:
  - Endpoints: `/message_center_api/Action_api/list_level1`, `/list_level2`, `/list_level3`, `/list_level4` (POST)
  - Lógica compartida en `src/features/actions/actionLevelService.js` (funciones `buildActionLevelsFormData` y `fetchActionLevelOptions`).
- Se utiliza deep clone (`radash/clone`) antes de mutar el modelo de formulario para evitar errores de mutación sobre objetos readonly.
- El estado de selección de niveles se actualiza de forma atómica para evitar pérdida de selección al cambiar valores rápidamente.

#### 3. Normalización de payload antes de submit

- Antes de enviar el formulario, los campos se normalizan en `submitActionFormSlice.js`:
  - `module_string_id` / `action_table` -> `action_source`
  - `reviewer_person` -> `reviewer_person_id`
  - `responsibe_person` / `responsible_person` -> `responsible_person_id` (cuando aplica)
  - `id_region` / `id_planta` / `level3` / `level4` -> `level_1` / `level_2` / `level_3` / `level_4`
  - `hs_cause` -> `hs_causes`

#### 4. Fixes recientes y referencias

- Se corrigió un error de mutación de estado ("Cannot assign to read only property 'level_2'") usando deep clone antes de mutar el modelo de formulario.
- Se corrigió la pérdida de selección de niveles haciendo la actualización de estado atómica en el formulario.
- Tanto los filtros como el formulario usan la misma fuente de datos y lógica para niveles, garantizando consistencia.

Referencias de implementación:
- `src/features/actions/Actions.js` (toggle table/report, lógica de filtros y submit, deep clone)
- `src/features/actions/ActionsDrawer.js` (formulario, fixes de selección y deep clone)
- `src/features/actions/actionLevelService.js` (lógica unificada de niveles)
- `src/config/validationConfig.js` (solo level_1 requerido)
- `src/stores/actions/submitActionFormSlice.js` (normalización de payload)

### Request JSON (ejemplo hs_action)

```json
{
  "action_source": "hs_action",
  "current_date": "2026-03-19",
  "action_category": "2",
  "action_status": "1",
  "type_intervention": "9",
  "what_description": "prueba",
  "how_description": "prueba",
  "action_start_date": "2026-03-19",
  "action_closing_date": "2026-06-12",
  "reviewer_person_id": "1276",
  "id_alert": "182",
  "level_1": "43",
  "level_2": "199",
  "level_3": "134",
  "level_4": "874",
  "contractor": "55",
  "hs_process": "1104",
  "hs_fuente": "1233",
  "hs_causes": "999",
  "description_fuente": "prueba",
  "cause_description": "prueba",
  "responsible_person": "1234"
}
```

### Request JSON (ejemplo all_action_plan)

```json
{
  "action_source": "all_action_plan",
  "action_category": "2",
  "action_status": "open",
  "what_description": "accion all_action_plan",
  "how_description": "detalle",
  "action_start_date": "2026-03-19",
  "action_closing_date": "2026-06-12",
  "responsible_person_id": "1234",
  "reviewer_person_id": "1276",
  "level_1": "43",
  "level_2": "11",
  "level_3": "7",
  "level_4": "80",
  "module_id": "10",
  "common_relation_id_1": "20"
}
```

### Response esperada

```json
{
  "status": 1,
  "messages": "Action Added Successfully",
  "data": {
    "action_id": 1501
  }
}
```

### Estado de implementacion frontend

- src/features/actions/Actions.js define action_source = hs_action por defecto al enviar submit
- src/features/actions/ActionsDrawer.js envia `action_source` (no `module_string_id`) al submit
- src/features/MessageCenterActions.js envia `action_source` (no `module_string_id`) al submit
- src/stores/actions/submitActionFormSlice.js refuerza `action_source = hs_action` y normaliza aliases de payload para compatibilidad con respuesta de detalle/formulario
