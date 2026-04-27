# Auth JWT — Integración con login_secure

Análisis de compatibilidad de `message-center` (React) con el nuevo flujo de autenticación
implementado en `auth_service/login_secure` (PHP/CodeIgniter 3).

Fecha de análisis: 2026-04-26

---

## Resumen ejecutivo

| Componente | Estado | Acción requerida |
|---|---|---|
| Header `Auth-Token` en axios | **OK** | Ninguna |
| Manejo de 401 en axios | **OK** | Ninguna |
| API base URL (runtime config) | **OK** | Ninguna |
| Rutas `message_center_api/*` | **OK** | Ninguna |
| Cookie `token_message_center` como fallback PHP | **OK (nuevo)** | Ninguna — controladores ya lo leen |
| **JWT no se guarda en localStorage** | **PENDIENTE** | `login-amatia-express/PasswordPage.tsx` debe guardar el token |
| **`LOCAL_AUTH_TOKEN` = bypass eliminado** | **ROTO en dev** | Actualizar `.env.development.local` con JWT real |
| Rutas `tasklist_api/tasklist_api/*` | **Funciona pero inconsistente** | Migrar a `message_center_api/Tasklist_api/*` (no urgente) |

**Estado actual:** Los controladores PHP en `message_center_api` aceptan el JWT via dos
mecanismos: header `Auth-Token` (axios) O cookie HTTPOnly `token_message_center` (browser).
La cookie cubre el caso donde React no guardó el token en localStorage antes de redirigir.

**Problema que persiste:** En requests AJAX explícitos donde el browser no envía la cookie
automáticamente (ej: cross-origin, o si la cookie expiró), React necesita el header
`Auth-Token`. Para eso, `login-amatia-express` debe guardar `response.token` en
`localStorage['Auth-Token']` tras el login exitoso.

**En desarrollo:** `LOCAL_AUTH_TOKEN` era el bypass hardcodeado que fue eliminado de todos
los controladores. Para desarrollar, obtener un JWT real via login y configurarlo en
`.env.development.local` como `REACT_APP_ADMIN_AUTH_TOKEN`.

---

## Archivos analizados

| Archivo | Rol |
|---|---|
| `src/lib/axios.js` | Instancia HTTP — interceptores de request/response |
| `src/utils/storage.js` | Lectura/escritura de tokens en localStorage |
| `src/config/constants.js` | Token hardcodeado para desarrollo (`LOCAL_AUTH_TOKEN`) |
| `src/config/runtimeConfig.js` | Lee `window.__APP_CONFIG__` (seteado por `config.js` IIFE, síncrono) |
| `public/config.js` | IIFE — detecta hostname, setea `window.__APP_CONFIG__` con apiUrl/baseName/environment |
| `D:/.../login-amatia-express/src/pages/PasswordPage.tsx` | Flujo de login — NO guarda JWT |
| `D:/.../login-amatia-express/src/api/auth.service.ts` | Llamada a `POST /auth_service/login_secure` |
| `D:/.../login-amatia-express/src/types/auth.types.ts` | Tipo `LoginResponse` — incluye `token?` |

---

## Detalle de hallazgos

Ver [jwt-integration.md](jwt-integration.md) para análisis completo con código exacto y pasos de corrección.
