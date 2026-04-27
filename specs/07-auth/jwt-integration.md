# JWT Integration — Análisis detallado

## 1. Flujo actual de tokens (cómo funciona hoy)

### En development (`NODE_ENV !== 'production'`)

```
src/lib/axios.js (línea 32-34)
  → token = LOCAL_AUTH_TOKEN  ← valor hardcodeado en constants.js
  → config.headers['Auth-Token'] = token
```

`LOCAL_AUTH_TOKEN` (src/config/constants.js línea 46):
```javascript
export const LOCAL_AUTH_TOKEN =
  ADMIN_AUTH_TOKEN || '$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa';
```

**Problema:** `$2y$10$HYG/Oj2NUm2wKLquLxct7.CBHw4.B2p3Hs67vimGaWZldraKmwcSa` era el bypass
token hardcodeado en los controladores PHP. Fue **eliminado de todos los controladores de
`message_center_api`**. Cualquier request en dev devuelve **401** si no hay JWT real.

`ADMIN_AUTH_TOKEN` puede sobreescribirlo via `REACT_APP_ADMIN_AUTH_TOKEN` en `.env.development.local`.
Ese archivo actualmente tiene:
```
REACT_APP_API_URL=http://ocensa-ambiental/
REACT_APP_BASE_NAME=/message-center
REACT_APP_DEFAULT_LANGUAGE=es
```
`REACT_APP_ADMIN_AUTH_TOKEN` **no está definido** → cae al fallback del bypass = JWT inválido en todos los endpoints.

### En production (`NODE_ENV === 'production'`)

```
src/lib/axios.js (línea 36-37)
  → token = storage.getToken()
  → storage.getToken() = localStorage.getItem('Auth-Token')
```

**Problema:** `login-amatia-express` no guarda el JWT en `localStorage['Auth-Token']` tras
el login. La key queda vacía → axios envía request sin `Auth-Token`.

**Mitigación parcial activa:** Los controladores PHP de `message_center_api` ahora aceptan
la cookie HTTPOnly `token_message_center` como fallback cuando `Auth-Token` header está vacío.
El browser envía esta cookie automáticamente — requests de navegación inicial funcionan.
Pero **requests AJAX donde no se envía la cookie** (ej: cross-origin, expiración) siguen
necesitando el header `Auth-Token` desde localStorage.

---

## 2. El gap crítico: login-amatia-express no persiste el JWT

### Flujo actual (incompleto)

```
login-amatia-express/PasswordPage.tsx
  1. POST /auth_service/login_secure
  2. response = { status: 1, messages: "...", token: "<JWT>", redirect_url: "http://..." }
  3. if (response.status) {
       onLoginSuccess()
       const redirectUrl = response.data?.redirect_url || APP_CONFIG.REDIRECT_URL
       //                   ↑ response.data es el objeto {user_id, usuario}
       //                     redirect_url está en el ROOT del response, no en .data
       //                     → usa APP_CONFIG.REDIRECT_URL como fallback → OK
       sessionStorage.setItem('redirect_url', redirectUrl)
       // ⚠️ EL TOKEN NUNCA SE GUARDA EN localStorage
     }
  4. LoadingScreen redirige a redirectUrl → message-center carga
  5. message-center: storage.getToken() → null → sin Auth-Token → 401
```

### Respuesta real de auth_service/login_secure

```json
{
  "status": 1,
  "messages": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "redirect_url": "https://ocensacentral.dev.sofacto.info/ambiental/message-center",
  "data": {
    "user_id": 42,
    "usuario": "jvasquez"
  }
}
```

El campo `token` está en el root del JSON, no dentro de `data`.  
`response.data?.token` (como define `LoginResponse`) busca en el objeto anidado → siempre `undefined`.  
El token correcto está en `(response as any).token` o simplemente `response.token`.

---

## 3. Cambios requeridos

### 3.1 CRÍTICO — `login-amatia-express/PasswordPage.tsx`

**Archivo:** `D:\Proyectos\unydos\login-amatia-express\src\pages\PasswordPage.tsx`

Agregar persistencia del JWT inmediatamente después de login exitoso:

```typescript
// Antes (línea ~51-59):
if (response.status) {
    onLoginSuccess();
    const redirectUrl = response.data?.redirect_url || APP_CONFIG.REDIRECT_URL;
    sessionStorage.setItem('redirect_url', redirectUrl);
}

// Después:
if (response.status) {
    onLoginSuccess();

    // Guardar JWT para que message-center y otros consumers lo usen
    const token = (response as unknown as { token?: string }).token;
    if (token) {
        localStorage.setItem('Auth-Token', token);
    }

    // redirect_url viene en root del response, no en .data
    const redirectUrl =
        (response as unknown as { redirect_url?: string }).redirect_url
        || response.data?.redirect_url
        || APP_CONFIG.REDIRECT_URL;
    sessionStorage.setItem('redirect_url', redirectUrl);
}
```

**Nota sobre el tipo `LoginResponse`:** El tipo define `data.token` y `data.redirect_url` pero
el backend retorna ambos en el root del JSON. Actualizar `auth.types.ts` para reflejar la
estructura real:

```typescript
export interface LoginResponse {
    status: number | boolean;
    messages?: string;
    message?: string;
    token?: string;           // JWT — root level
    redirect_url?: string;    // Root level
    data?: {
        user_id?: number;
        usuario?: string;
        [key: string]: unknown;
    };
}
```

---

### 3.2 CRÍTICO — `message-center` en development

**Archivo:** `C:\wamp64\www\message-center\.env.development.local`

Agregar un JWT real para desarrollo:

```
REACT_APP_ADMIN_AUTH_TOKEN=<JWT generado por POST /auth_service/login_secure>
REACT_APP_COMPANY_GROUP=ocsamb
```

**Cómo obtener el JWT:**
```bash
curl -X POST http://ocensa-ambiental/auth_service/login_secure \
  -H "Client-Service: frontend-client" \
  -H "Auth-Key: simplerestapi" \
  -H "Content-Type: application/json" \
  -d '{"username":"tu_usuario","password":"tu_password"}'
# → copiar el campo "token" de la respuesta
```

**Alternativa más robusta** — modificar `src/lib/axios.js` para usar `storage.getToken()`
en todos los entornos (en dev el token viene de localStorage, igual que en prod):

```javascript
// Antes (src/lib/axios.js líneas 32-38):
if (process.env.NODE_ENV !== 'production') {
  token = LOCAL_AUTH_TOKEN;
  systemToken = SYSTEM_TOKEN;
} else {
  token = storage.getToken();
  systemToken = storage.getSystemToken();
}

// Después (unificado):
token = process.env.NODE_ENV !== 'production'
  ? (storage.getToken() || LOCAL_AUTH_TOKEN)  // localStorage primero, fallback a .env
  : storage.getToken();
systemToken = storage.getSystemToken() || SYSTEM_TOKEN;
```

Con este cambio, en dev el token en localStorage tiene prioridad (útil si el dev ya
está logueado en la misma URL local) y el `.env` solo actúa como fallback explícito.

---

## 4. Cookie fallback — mecanismo de autenticación secundario

Los controladores PHP en `message_center_api` verifican dos fuentes de JWT en orden:

```
1. Header Auth-Token: <jwt>   ← React vía axios interceptor
2. Cookie token_message_center  ← Browser envía automáticamente (HTTPOnly)
```

El servidor (`login_secure`) establece la cookie al hacer login exitoso. Si React no guardó
el JWT en localStorage, el browser igual autentica vía cookie en la primera carga.

**Implicaciones para el desarrollo React:**

| Escenario | Auth-Token header | Cookie | Resultado |
|---|---|---|---|
| login-express guardó JWT en localStorage | ✅ presente | ✅ presente | OK — header tiene prioridad |
| login-express NO guardó JWT (bug actual) | ❌ vacío | ✅ presente (mismo dominio) | OK — fallback cookie |
| Dev: localStorage vacío, cookie ausente | ❌ vacío | ❌ ausente | **401** — necesita JWT en `.env` |
| Token expirado en ambos lados | JWT inválido | JWT expirado | **401** — re-login |

**La cookie solo funciona si React y PHP están en el mismo dominio/subdominio.** En local
(`http://localhost:8080/`), React y PHP comparten dominio → cookie funciona. En producción,
ambos están en el mismo host (`ocensacentral.sofacto.info`) → cookie funciona.

**Para requests AJAX (axios):** la cookie se envía automáticamente si es mismo dominio y
`withCredentials` está habilitado (o no hay restricción CORS). El header `Auth-Token` tiene
prioridad cuando está presente — no depender solo de cookie para flujos críticos AJAX.

---

## 5. Lo que ya funciona correctamente — no requiere cambios

### 5.1 Header `Auth-Token` — correcto

`src/lib/axios.js` línea 46:
```javascript
config.headers['Auth-Token'] = token;
```

Los controladores PHP en `message_center_api` leen:
```php
$auth_token = $this->input->get_request_header('Auth-Token', TRUE);
```
Nombre del header coincide exactamente.

### 5.2 Manejo de 401 — correcto

`src/lib/axios.js` líneas 72-77:
```javascript
if (error.response.status === 401) {
    const responseData = error.response.data;
    if (responseData && responseData.status === 401 && responseData.redirect_url) {
        window.location.href = responseData.redirect_url;
    }
}
```

Los controladores PHP retornan exactamente:
```json
{ "status": 401, "messages": "Unauthenticated Access", "redirect_url": "...logout" }
```
El handler de axios captura correctamente y redirige.

### 5.3 Rutas `message_center_api/*` — correctas

Ejemplos verificados en el codebase:
- `GET /message_center_api/legal_api/get_configuration_amatia_express`
- `POST /message_center_api/action_api/get_actions_amatia_express`
- `GET /message_center_api/inspecciones_api/list`
- `GET /message_center_api/events_api/dashboard_events`

Todos apuntan a controladores que ya tienen JWT activado.

### 5.4 Runtime config (API URL) — correcto

`public/config.js` (IIFE) → `window.__APP_CONFIG__.apiUrl` → `getAPIUrl()` → `axios.baseURL`

La URL base se determina en runtime según `window.location.hostname` — no requiere rebuild
para cambiar de entorno. `src/config/runtimeConfig.js` lee `window.__APP_CONFIG__` directamente
(síncrono); el fetch a `config.json` fue eliminado.

### 5.5 `System-Token` — sin impacto en auth

`src/lib/axios.js` línea 47:
```javascript
config.headers['System-Token'] = systemToken;
```

Ningún controlador de `message_center_api` valida este header para autenticación.
Es consumido por lógica de negocio en algunos endpoints (subdomain routing) pero no
bloquea el acceso si está vacío o incorrecto.

---

## 6. Consideración futura — URLs `tasklist_api/tasklist_api/*`

En `src/components/BaseFilter.js` (y otros), el app llama:
```javascript
`/tasklist_api/tasklist_api/get_level${nextLevel}`
```

Este módulo PHP original (`tasklist_api/controllers/Tasklist_api.php`) **NO fue modificado**.
Aún tiene el bypass token check (funciona con el bypass O con JWT real en el else branch).

Una vez que el bypass desaparezca del módulo original (o si se deshabilita), estas
llamadas deben migrar a:
```javascript
`/message_center_api/Tasklist_api/get_level${nextLevel}`
```

**Prioridad:** baja — el módulo original sigue operativo. Migrar cuando se consolide
`message_center_api/Tasklist_api` como el controlador canónico.

---

## 7. Inconsistencia en `storage.clearToken()`

`src/utils/storage.js`:
```javascript
getToken: () => {
    return window.localStorage.getItem('Auth-Token');  // lee 'Auth-Token'
},
clearToken: () => {
    window.localStorage.removeItem(`${storagePrefix}token`);  // borra 'amatia_auth_token' ← bug
},
```

`clearToken()` borra una key diferente a la que `getToken()` lee. Al hacer logout, el token
JWT permanece en `localStorage['Auth-Token']`. Este bug existía antes de este análisis.

**Fix:**
```javascript
clearToken: () => {
    window.localStorage.removeItem('Auth-Token');
},
```

---

## 8. Checklist de verificación

```
login-amatia-express (PENDIENTE — cambios no aplicados aún):
[ ] PasswordPage.tsx guarda localStorage['Auth-Token'] = response.token tras login exitoso
[ ] auth.types.ts refleja estructura real: token y redirect_url en root, no en data{}
[ ] Login exitoso → localStorage['Auth-Token'] contiene JWT válido
[ ] Reload de message-center → storage.getToken() retorna JWT → axios lo incluye en Auth-Token

message-center desarrollo (PENDIENTE):
[ ] .env.development.local tiene REACT_APP_ADMIN_AUTH_TOKEN=<JWT real obtenido por login>
[ ] GET /message_center_api/events_api/dashboard_events → 200 (no 401)

message-center producción (verificar):
[ ] Flujo: login → redirect → message-center carga → endpoints API devuelven 200
[ ] Si carga inicial OK (cookie) pero recarga falla (sin header): pendiente fix localStorage
[ ] Logout: clearToken() borra 'Auth-Token' (ver bug sección 6)

PHP controllers (APLICADO):
[x] Todos los controladores message_center_api aceptan header Auth-Token
[x] Todos los controladores message_center_api aceptan cookie token_message_center como fallback
[x] 401 responde con JSON {status:401, messages, redirect_url} y HTTP 401 correcto
```
