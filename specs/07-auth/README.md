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
| **JWT no se guarda en localStorage** | **ROTO** | `login-amatia-express/PasswordPage.tsx` debe guardar el token |
| **`LOCAL_AUTH_TOKEN` = bypass eliminado** | **ROTO en dev** | Actualizar `.env.development.local` o `axios.js` |
| Rutas `tasklist_api/tasklist_api/*` | **Funciona pero inconsistente** | Migrar a `message_center_api/Tasklist_api/*` (no urgente) |

**Conclusión:** La app `message-center` está correctamente configurada para consumir JWT via
`Auth-Token`. El problema está **aguas arriba**: `login-amatia-express` no persiste el token
en `localStorage` tras el login exitoso, por lo que `message-center` arrancaría sin token
en producción.

---

## Archivos analizados

| Archivo | Rol |
|---|---|
| `src/lib/axios.js` | Instancia HTTP — interceptores de request/response |
| `src/utils/storage.js` | Lectura/escritura de tokens en localStorage |
| `src/config/constants.js` | Token hardcodeado para desarrollo (`LOCAL_AUTH_TOKEN`) |
| `src/config/runtimeConfig.js` | Carga de `config.json` → `window.__APP_CONFIG__` |
| `public/config.json` | URL base de la API |
| `D:/.../login-amatia-express/src/pages/PasswordPage.tsx` | Flujo de login — NO guarda JWT |
| `D:/.../login-amatia-express/src/api/auth.service.ts` | Llamada a `POST /auth_service/login_secure` |
| `D:/.../login-amatia-express/src/types/auth.types.ts` | Tipo `LoginResponse` — incluye `token?` |

---

## Detalle de hallazgos

Ver [jwt-integration.md](jwt-integration.md) para análisis completo con código exacto y pasos de corrección.
