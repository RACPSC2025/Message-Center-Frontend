# Guía de Implementación: Endpoint `/tasklist_api/list_tasks`

## Objetivo
Implementar el endpoint `/tasklist_api/list_tasks` para que funcione con la configuración actual (`https://compliance.dev.sofactia.info/amatia/`) sin alterar el código existente.

## Requisitos Previos
- Tener acceso al código fuente del proyecto
- Tener instaladas las dependencias del proyecto
- Tener conocimientos básicos de Redux Toolkit y React

## Paso 1: Crear el nuevo slice

### 1.1 Crear el archivo del slice
Crea un nuevo archivo en la ruta:
```
src/stores/tasks/fetchListTasksSlice.js
```

### 1.2 Contenido del archivo
Copia y pega el siguiente código en el archivo `fetchListTasksSlice.js`:

```javascript
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const fetchListTasks = createAsyncThunk(
  'tasks/list_tasks',
  async (data = {}, { rejectWithValue }) => {
    try {
      // Usar la instancia de axios actual que ya tiene la configuración correcta
      const response = await axiosInstance.post('/amatia/tasklist_api/list_tasks', data);
      return response?.data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);
# Guía técnica: implementar y probar `/amatia/tasklist_api/list_tasks`

Última actualización: 2026-02-11

Propósito
- Proveer instrucciones claras y contrastadas para completar la integración del endpoint legacy `/amatia/tasklist_api/list_tasks`, documentando cómo implementarlo en el front, cómo probarlo sin afectar la funcionalidad existente y cómo realizar pruebas localmente.

Alcance y restricciones
- No se modificará la carga principal y en producción que usa `/tasklist_api/list_tasks_new_complete`.
- La única intervención visible en la UI será una salida por consola (`console.log`) con la respuesta del endpoint legacy para inspección.

Requisitos previos
- Repositorio clonado y dependencias instaladas.
- Acceso a `src/stores/tasks/` y a `src/features/tasks/TaskTableList.js`.
- Familiaridad básica con `redux-toolkit`, `axios` y React hooks.

1) Estado actual
- Existe un slice para el endpoint legacy en `src/stores/tasks/fetchListTasksSlice.js` exportando `fetchListTasksSpecial`.
- La vista principal de tareas usa `fetchListTaskNew` (endpoint moderno `list_tasks_new_complete`) y no debe ser alterada.

2) Qué hacer exactamente (resumen)
- Mejorar/acomodar la guía de implementación (`guia_list_task.md`) — ya actualizado en este repositorio.
- Añadir en `TaskTableList.js` una llamada NO invasiva a `fetchListTasksSpecial` que sólo muestre la respuesta en consola.

3) Implementación recomendada (front-end)

- Slice: usar el slice existente `fetchListTasksSlice.js` (si no existe, crear uno siguiendo el patrón de los otros slices en `src/stores/tasks/`).
- Thunk: `fetchListTasksSpecial` ya realiza
  ```js
  axiosInstance.post('/amatia/tasklist_api/list_tasks', data)
  ```

- Integración en la vista principal (no invasiva):
  - Importar `fetchListTasksSpecial` en `src/features/tasks/TaskTableList.js`.
  - Crear una función que dispare el thunk con los mismos parámetros de paginación que usa `fetchListTaskNew` (por ejemplo, `page = 1`).
  - Registrar el resultado únicamente en consola:
    - `console.log('Legacy /amatia/tasklist_api/list_tasks response:', responsePayload)`
  - No modificar estados (`setTasks`, `setTasksFilters`) ni la UI.

4) Ejemplo de llamada NO invasiva (resumen)

En `TaskTableList.js`:

```js
import { fetchListTasksSpecial } from '../../stores/tasks/fetchListTasksSlice';

// ... dentro del componente
const formData = new FormData();
formData.append('page', 1);
dispatch(fetchListTasksSpecial(formData)).then(res => {
  console.log('Legacy /amatia/tasklist_api/list_tasks response:', res?.payload);
}).catch(err => console.warn('Legacy list_tasks request failed:', err));
```

5) Pruebas y verificación
- Inicie la app: `npm start`.
- Abra la aplicación y la consola del navegador (F12 → Console).
- Verifique que la UI de tareas sigue funcionando exactamente igual.
- Busque en la consola la salida: `Legacy /amatia/tasklist_api/list_tasks response:` seguida del payload.

6) Errores comunes y cómo diagnosticar
- 401/403: revisar tokens en `lib/axios` y la configuración de `Auth-Token` / `System-Token`.
- Respuesta vacía o estructura distinta: comparar con `list_tasks_new_complete` la forma de `data` (paginación, campos anidados) y adaptar `formData` si es necesario.

7) Buenas prácticas
- Mantener la llamada legacy separada y opcional (solo para inspección) hasta que el backend confirme paridad funcional.
- No reemplazar la carga principal (`list_tasks_new_complete`) hasta validar la compatibilidad completa.

8) Siguientes pasos sugeridos
- Si la respuesta legacy es correcta y estable: preparar un plan de migración donde `list_tasks_new_complete` se retire o se unifique con el legacy.
- Añadir tests de integración que validen la paridad de datos entre ambos endpoints.

Contacto
- Si quieres, puedo:
  - Añadir ejemplos `curl` y payloads de prueba para este endpoint.
  - Añadir manejo opcional por feature flag para activar la llamada legacy solo en entornos no productivos.

---
Guía actualizada y lista para usar.