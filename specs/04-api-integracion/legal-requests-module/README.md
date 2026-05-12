# Modulo de Solicitudes Legales (Frontend + Backend)

## Objetivo
Este documento explica como funciona el modulo de solicitudes legales para que:
- una persona del equipo pueda mantenerlo sin depender de contexto previo;
- un modelo de IA pueda entender estructura, contratos API y reglas de implementacion.

## Fuente de verdad
- Este archivo en specs es la fuente de verdad del contrato funcional para frontend.
- Las notas en memoria del agente (por ejemplo, /memories/repo/legal-requests-api-contract.md) son solo apoyo y no reemplazan la documentacion oficial en specs.

## Alcance
Aplica al consumo frontend de las APIs del modulo:
- POST /message_center_api/Legal_api/get_request_from_legal
- POST /message_center_api/Legal_api/save_request

## Contexto tecnico
- Base URL API: [tu_dominio]/message_center_api/Legal_api/
- Auth: header Auth-Token (JWT)
- Idioma: header Selected-Language con valores es o en
- Cliente frontend: axiosInstance (src/lib/axios.js)
- Vista principal frontend actual: src/features/legalComunications/LegalComunicationsLedger.js
- Implementacion legacy de referencia: src/features/MessageCenterLegalMatriz/ComunicationsLedger.js

## Entrada desde tabla LegalMatriz

Integracion de navegacion frontend:

- Archivo origen: src/features/MessageCenterLegalMatriz.js (columna comunications)
- Ruta destino: `/view/legal_comunications`
- Componente destino: src/features/legalComunications/LegalComunications.js

Regla de implementacion:

- Antes de navegar, LegalMatriz persiste en Redux el requisito seleccionado bajo `filter.modules.LegalMatriz.filterData`.
- Claves requeridas:
  - `requisito_actual`
  - `id_requisito_actual`
  - `selected_requisito_id`
  - `isSelected_requisito_id = true`
- `LegalComunicationsLedger` usa `id_requisito_actual` para consultar la API de comunicaciones.
- El drawer `regulatory_communications` de `OptionsDrawer` permanece como flujo legacy/referencia, pero la navegacion principal ya apunta al modulo dedicado.

## Modelo de datos funcional
Una solicitud legal vive dentro de una cadena de relacion:
- request (principal)
- response (anidada)
- reminder (anidada)

Regla de jerarquia:
- solicitud principal: id_request_parent = null y order = 1
- solicitud anidada: id_request_parent = <id_principal> y order >= 2

## Endpoint 1: get_request_from_legal
### Request
Content-Type: application/json

{
  "id_requisito": 123
}

### Response (resumen)
- status: 1 exito / 0 error
- messages: texto descriptivo
- data: array de cadenas

Cada elemento de data es una cadena y contiene objetos de solicitud con:
- metadatos (id_request, request_type, status, order, id_request_parent, fechas, type_comunication)
- articulos[]
- destinatarios[]
- archivos[]

### Campo type_comunication
- Tipo: entero (0, 1, 2, 3)
- Registros históricos: valor 3 por defecto
- Representa el tipo de comunicación asociado a la solicitud

### Campos de archivos (cambio importante)
Cada archivo puede incluir:
- url (compatibilidad historica)
- preview_url (abrir en navegador, inline)
- download_url (forzar descarga, attachment)
- mime_type
- url_expires_in

Regla de uso frontend recomendada:
- Preview: usar preview_url; fallback a url
- Download: usar download_url; fallback a preview_url; fallback a url

## Endpoint 2: save_request
### Request
Content-Type: multipart/form-data

Campos requeridos:
- id_requisito
- request_type (request | response | reminder)
- status (open | in_progress | expired | resolved)
- order
- source_type (GOVT | USER | INTERNAL)
- source_name
- filing_date (YYYY-MM-DD)
- expected_response_date (YYYY-MM-DD)
- mode (LETTER | EMAIL | PORTAL | IN_PERSON | PHONE)
- created_by

Campos opcionales relevantes:
- comment
- observation
- source_reference
- description
- current_status
- due_date
- repeated
- id_request_parent
- articulos (JSON string)
- destinatarios (JSON string)
- archivos_adjuntos[] (files)

### Respuesta
- status
- messages
- data con id_request, archivos_subidos, archivos y posibles upload_warnings

## Contrato de estados
### status (flujo de solicitud)
- open
- in_progress
- expired
- resolved

### current_status (estado operativo)
- RECEIVED
- UNDER_REVIEW
- REPLIED
- AWAITING_CONFIRMATION
- CLOSED

## Reglas de frontend para integracion robusta
1. No asumir que todos los campos existen en todos los items.
2. Tratar campos de texto vacios como cadena vacia (""), no null.
3. Tratar due_date ausente como null.
4. Revalidar URL de archivos cuando expiren (url_expires_in).
5. En botones de archivo:
   - Preview: window.open(previewUrl, '_blank')
   - Download: abrir download_url (si backend firma con attachment)
6. Si el backend no envia download_url, mantener fallback a url sin romper la UI.

## Ejemplo de helper recomendado (frontend)

```javascript
export const getFilePreviewUrl = (file) => file?.preview_url || file?.url || '';

export const getFileDownloadUrl = (file) =>
  file?.download_url || file?.preview_url || file?.url || '';
```

## Checklist de implementacion
- [ ] El listado usa get_request_from_legal con id_requisito.
- [ ] El modulo dedicado `/view/legal_comunications` depende de `LegalMatriz.id_requisito_actual` en Redux.
- [ ] La UI agrupa por id_request_parent y order.
- [ ] Preview abre preview_url.
- [ ] Download usa download_url cuando exista.
- [ ] Se contempla expiracion de URL (url_expires_in).
- [ ] Se muestran articulos, destinatarios y archivos sin romper cuando vengan vacios.

## Convenciones para mantenimiento por IA
Cuando una IA actualice este modulo, debe:
1. Preservar compatibilidad con url historica.
2. Priorizar preview_url y download_url cuando existan.
3. No cambiar enums sin validar contrato backend.
4. Validar que cualquier cambio mantenga la jerarquia id_request_parent/order.
5. Documentar cambios de contrato API en este archivo.

## Historial de cambios
### 2026-05-12
- Se agrega campo `type_comunication` (TINYINT 0-3) a `amatia_requisitos_solicitudes`.
- `get_request_from_legal` retorna `type_comunication` en cada objeto de solicitud (principal y anidada).
- Registros existentes migrados a valor 3.


### 2026-04-25
- La navegacion desde la columna `comunications` de LegalMatriz cambia del drawer `regulatory_communications` al modulo dedicado `/view/legal_comunications`.
- El frontend mantiene el contexto del requisito seleccionado en Redux (`LegalMatriz.id_requisito_actual`) y el ledger nuevo reutiliza ese estado para consultar `get_request_from_legal`.

### 2026-03-18
- Se documenta soporte backend para preview_url y download_url en archivos adjuntos.
- Se define estrategia de consumo frontend con fallback por compatibilidad.
