# Contrato API Actions Module

## API: action_form_submit_amatia_express

### Endpoint

- POST /message_center_api/Action_api/action_form_submit_amatia_express

### Reglas de fuente de datos

- Campo principal: action_source
- Valores permitidos: hs_action, all_action_plan
- Si action_source no llega, el backend usa hs_action por defecto
- module_string_id no define la tabla destino en este endpoint

### Regla de frontend

Para creacion/submit de acciones en frontend:

- Enviar action_source con valor por defecto hs_action cuando no venga definido
- No depender de module_string_id para seleccionar la fuente
- Normalizar aliases de campos antes del submit (en `submitActionFormSlice`):
  - `module_string_id` / `action_table` -> `action_source`
  - `reviewer_person` -> `reviewer_person_id`
  - `responsibe_person` / `responsible_person` -> `responsible_person_id` (cuando aplica)
  - `id_region` / `id_planta` / `level3` / `level4` -> `level_1` / `level_2` / `level_3` / `level_4`
  - `hs_cause` -> `hs_causes`

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
