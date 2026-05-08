# Corrección: message_center_api/tasklist_api/save_task — payload requerido por tipo

Endpoint: `POST /message_center_api/tasklist_api/save_task`

---

## Bugs corregidos en el backend

| # | Problema | Afectaba |
|---|----------|---------|
| 1 | `$fechas_actividades` era variable local, inaccesible en `save_logtask` | `activity_type = 3` |
| 2 | `_save_task_recure()` no existía en la clase | `activity_type = 5` |
| 3 | `_generate_permanent_log_tasks()` llamada con firma incorrecta | `activity_type = 5` |
| 4 | `insert_logtask()` no recibía `$post` | `activity_type = 5` |
| 5 | `responsible` y `reviewer` comentados — no se guardaban | todos los tipos |

---

## Campos comunes (obligatorios en los tres tipos)

```json
{
  "task_title": "string",
  "task_description": "string",
  "activity_type": "1 | 3 | 5",
  "location": 1,
  "region": 43,
  "country": 199,
  "business": 134,
  "plant": 874,
  "responsible": "409",
  "reviewer": "409",
  "fase": "2",
  "subfase": "3",
  "plan": "1",
  "sub_plan": "1",
  "recure_every": "1",
  "range": "0",
  "range_value": "",
  "id_alert": "189",
  "activity_type": "5",
  "pma_id": "3",
  "program_id": "7",
  "sub_program_id": "5",
  "project_management_id": "1",
  "environmental_program_id": "5",
  "agreement_manager_id": "3",
  "contractor_company": "17",
  "corrective_plan": "on",
  "manage_costs": "on",
  "tags": [],
  "who": [],
  "geovisor_link": ""
}
```

Notas:
- `responsible` y `reviewer`: ID numérico de `position_assignments`. Enviar como string.
- `region`, `country`, `business`, `plant`: **IDs numéricos** de las tablas `siso_regionales`, `siso_paises`, `siso_negocios`, `siso_plantas`.
- `location`: ID numérico de nivel.
- Si `fase` y `subfase` están vacíos, el backend asigna la fase "General Fase" automáticamente.

---

## Tipo 1 — Tarea única

`activity_type: "1"`

Campos adicionales requeridos:

```json
{
  "activity_type": "1",
  "start_date": "2026-05-08",
  "end_date": "2026-12-31"
}
```

- `start_date` y `end_date`: formato `YYYY-MM-DD`.
- Si `end_date` está vacío, el backend asigna `+10 años` desde hoy.

---

## Tipo 3 — Tarea cíclica (días/meses/años seleccionados)

`activity_type: "3"`

Campos adicionales requeridos:

```json
{
  "activity_type": "3",
  "losdias": "0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0",
  "losmeses": "0,0,0,1,0,0,0,0,0,0,0,1",
  "losanos": "0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0"
}
```

Formato de `losdias`, `losmeses`, `losanos`:
- Array de `0` y `1` separados por coma.
- `losdias`: 30 posiciones. Posición `i` corresponde al día `dias[i]` (1…30). `1` = seleccionado.
- `losmeses`: 12 posiciones. Posición `i` corresponde al mes `i+1`. `1` = seleccionado.
- `losanos`: 20 posiciones. La mitad izquierda son años pasados, la mitad derecha futuros, centrado en el año actual. `1` = seleccionado.
- Enviar como **strings**, no arrays.

Campo opcional:

```json
{
  "todos_dias": "1"
}
```

Cuando `todos_dias = 1`, se ignoran los bits de `losdias` y se usan todos los días del mes.

Las fechas resultantes son el producto cartesiano de días × meses × años seleccionados. El backend genera un `logtask` por cada fecha.

---

## Tipo 5 — Tarea permanente/recurrente (cron)

`activity_type: "5"`

Campos adicionales requeridos:

```json
{
  "activity_type": "5",
  "cron_start_date": "2026-05-08",
  "cron_end_date": "",
  "plan": "2",
  "sub_plan": "2",
  "recure_every": "1",
  "range": "0",
  "range_value": ""
}
```

### `plan` — tipo de recurrencia

| Valor | Frecuencia | `sub_plan` requerido |
|-------|-----------|----------------------|
| `"1"` | Diaria | No aplica |
| `"2"` | Semanal | Día de la semana (ver tabla) |
| `"3"` | Mensual | Día del mes (`"1"` – `"28"`) |
| `"4"` | Anual | Mes del año (`"1"` – `"12"`) |

### `sub_plan` para `plan = "2"` (semanal) — valores numéricos

| Valor | Día |
|-------|-----|
| `"1"` | Lunes |
| `"2"` | Martes |
| `"3"` | Miércoles |
| `"4"` | Jueves |
| `"5"` | Viernes |
| `"6"` | Sábado |
| `"7"` | Domingo |

### `range` — límite de ocurrencias

| Valor | Comportamiento |
|-------|---------------|
| `"0"` | Sin límite (permanente) |
| `"2"` | Termina en `cron_end_date` |

- `cron_end_date`: `YYYY-MM-DD` o vacío (`""`) si `range = "0"`.
- `recure_every`: cada cuántas unidades repetir. `"1"` = cada semana, `"2"` = cada dos semanas, etc.
- Si `plan = "2"` y `sub_plan` es un día de semana, el backend calcula el próximo martes/miércoles/etc. a partir de `cron_start_date`.

---

## Respuesta del API

```json
{ "status": 200, "messages": "success" }
```

En caso de error:

```json
{ "status": 0, "messages": "error" }
```
