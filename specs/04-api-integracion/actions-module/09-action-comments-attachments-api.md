# 09 - Action Comments and Attachments API

## Objetivo
Documentar el uso, request y response de los endpoints de comentarios y adjuntos de acciones trabajados en esta sesión:

1. get_actions_list_comments_amatia_express
2. upload_comments_attachment_amatia_express
3. create_actions_comment_amatia_express

Base path esperada (segun configuracion de rutas del proyecto):
- message_center_api/action_api/<endpoint>

Notas generales:
- Zona horaria operativa: America/Bogota.
- Formatos soportados: JSON y multipart/form-data segun endpoint.
- Adjuntos en esta version: se almacenan en S3 usando helper s3_files.

---

## 1) get_actions_list_comments_amatia_express

### Uso
Retorna comentarios de una accion, separados por rol (responsable, revisor y otros), incluyendo adjuntos por comentario y un arreglo global de adjuntos de la accion con URL firmada S3.

Orden de comentarios:
- Se listan de mas reciente a mas antigua por fecha de creacion del comentario (comment_time DESC).

Importante:
- Este endpoint NO depende de dashboard_actions para obtener datos base.
- La accion se valida y se consulta contra la tabla fuente (hs_action o all_action_plan).

### Metodo
POST

### Content-Type recomendado
application/json

### Request (campos)
- action_id: requerido. ID de la accion.
- action_table: opcional. Acepta aliases y valores canonicos.

### Reglas de action_table
Si action_table no llega, llega vacio o null:
- default: hs_action

Valores permitidos:
- hs
- hs_action
- incident_root
- all_action_plan

Resolucion interna de tabla fuente:
- hs o hs_action -> hs_action
- incident_root o all_action_plan -> all_action_plan

Regla de comment_type para buscar comentarios:
- Si action_table es hs o hs_action, comment_type = hs
- En los demas casos, comment_type = action_table

### Ejemplo request JSON
{
  "action_id": "30",
  "action_table": "hs"
}

### Response OK
{
  "status": 1,
  "messages": "Success",
  "data": {
    "action_id": "30",
    "action_table": "hs",
    "source_table": "hs_action",
    "responsible_person": "123",
    "reviewer_person": "456",
    "responsible_comments": [
      {
        "comment_id": "540",
        "comment": "Texto",
        "comment_by": "123",
        "created_date": "2026-04-09 10:20:00",
        "comment_time": "2026-04-09 10:20:00",
        "modified": "0000-00-00 00:00:00",
        "deleted": "0000-00-00 00:00:00",
        "module_id": null,
        "author_name": "Nombre Apellido",
        "author_email": "correo@dominio.com",
        "attachments": [
          {
            "id": "901",
            "comment_id": "540",
            "upload_id": "30",
            "old_filename": "archivo.pdf",
            "new_filename": "archivo.pdf",
            "path": "<s3_key>",
            "created_date": "2026-04-09 10:21:00",
            "created_by": "1",
            "description": null,
            "attachment_type": null,
            "file_name": "archivo.pdf",
            "url": "<signed_url>"
          }
        ]
      }
    ],
    "reviewer_comments": [],
    "other_comments": [],
    "attachments": [
      {
        "attachment_id": "901",
        "comment_id": "540",
        "file_name": "archivo.pdf",
        "url": "<signed_url>",
        "s3_key": "<s3_key>",
        "created_date": "2026-04-09 10:21:00",
        "created_by": "1"
      }
    ]
  }
}

### Errores comunes
- status 0, messages "Provide action_id"
- status 0, messages "Invalid action_table. Allowed: incident_root, hs, hs_action, all_action_plan"
- status 0, messages "source_table does not exist: <tabla>"
- status 0, messages "Action not found in source table"

### Explicacion de campos relevantes en response
- action_table: valor recibido en request (o default aplicado).
- source_table: tabla real usada internamente tras resolver alias.
- responsible_comments / reviewer_comments / other_comments: clasificacion por comment_by comparado con responsable/revisor de la accion.
- attachments (nivel accion): todos los adjuntos de la accion segun upload_id + source_table.
- attachments (nivel comentario): adjuntos del comentario puntual.
- url: URL firmada temporal de S3 para descarga/visualizacion.
- s3_key/path: clave del objeto en S3.
- created_date: alias de comment_time para consumo explicito de fecha de creacion.
- comment_time: fecha/hora de creacion registrada en comment_master.
- modified: fecha/hora de modificacion de comment_master.
- deleted: fecha/hora de borrado logico de comment_master.

---

## 2) upload_comments_attachment_amatia_express

### Uso
Sube uno o varios archivos a S3 y registra cada adjunto en incedent_upload para una accion/comentario existente.

### Metodo
POST

### Content-Type requerido
multipart/form-data

### Request (campos)
- action_id: requerido.
- comment_id: requerido.
- user_id: opcional. Si no llega, default 1.
- comment_type: opcional. Puede llegar null o vacio.
- upload_file: opcional si se usa imagefiles.
- imagefiles: opcional si se usa upload_file.

Notas de archivos:
- Soporta un archivo o multiples archivos.
- Campos de archivo aceptados: upload_file o imagefiles.

### Persistencia en incedent_upload
Por cada archivo exitoso:
- comment_id = request.comment_id
- upload_id = request.action_id
- created_by = user_id
- old_filename/new_filename = nombre original
- type = comment_type recibido (incluye null o vacio)
- path = s3_key retornado por S3

### Ejemplo request multipart
Campos texto:
- action_id = 30
- comment_id = 540
- user_id = 1
- comment_type = hs_action

Archivos:
- upload_file[] = archivo1.pdf
- upload_file[] = imagen1.png

### Response OK total
{
  "status": 1,
  "messages": "File uploaded successfully",
  "data": {
    "files": [
      {
        "attachment_id": 1001,
        "file_name": "archivo1.pdf",
        "s3_key": "<s3_key_1>"
      },
      {
        "attachment_id": 1002,
        "file_name": "imagen1.png",
        "s3_key": "<s3_key_2>"
      }
    ],
    "files_field": "upload_file"
  }
}

### Response con advertencias parciales
{
  "status": 303,
  "messages": "Files uploaded with warnings",
  "data": {
    "files": [
      {
        "attachment_id": 1001,
        "file_name": "archivo1.pdf",
        "s3_key": "<s3_key_1>"
      }
    ],
    "files_field": "upload_file",
    "upload_warnings": [
      "Error uploading file: imagen1.png"
    ]
  }
}

### Errores comunes
- status 0, messages "Provide action_id"
- status 0, messages "Provide comment_id"
- status 0, messages "No files provided"
- status 0, messages "Failed to upload the file" (si ninguno sube)

### Explicacion de campos relevantes
- files: lista de adjuntos creados en BD.
- files_field: nombre del campo de archivos detectado (upload_file o imagefiles).
- upload_warnings: errores por archivo cuando hay exito parcial.

---

## 3) create_actions_comment_amatia_express

### Uso
Crea comentario en comment_master para una accion, opcionalmente actualiza estado/porcentaje en la tabla fuente, y opcionalmente sube adjuntos a S3.

### Metodo
POST

### Content-Type soportado
- application/json
- multipart/form-data (cuando hay adjuntos)

### Request (campos)
- action_id: requerido.
- comment: requerido.
- action_source: opcional.
- comment_by: opcional.
- user_id: opcional.
- action_status: opcional.
- percentage: opcional.
- upload_file o imagefiles: opcional (uno o multiples archivos).

### Reglas de action_source
Si action_source no llega, vacio o null:
- default: hs

Valores permitidos:
- incident_root
- hs
- hs_action
- all_action_plan

Resolucion interna de tabla fuente:
- hs o hs_action -> hs_action
- incident_root o all_action_plan -> all_action_plan

Regla de comment_type al insertar en comment_master:
- Si action_source es hs o hs_action, comment_type = hs
- En otros casos, comment_type = action_source

### Actualizacion opcional de accion
- action_status solo se actualiza si llega en request y existe columna action_status.
- percentage solo se actualiza si llega en request, es numerico y existe columna percentage.
- Auditoria:
  - hs_action: updated_at
  - all_action_plan: last_status_change_date, last_status_change_by
- Si action_status indica cerrado (closed o 2), intenta setear real_closing_date si existe columna.

### Adjuntos
- Usa helper s3_files.
- Sube a S3 y guarda en incedent_upload:
  - type = source_table resuelta (hs_action o all_action_plan)
  - path = s3_key
- Soporta uno o multiples archivos.

### Ejemplo request JSON
{
  "action_id": "30",
  "action_source": "hs",
  "comment": "Seguimiento realizado",
  "comment_by": "123",
  "user_id": "123",
  "action_status": "closed",
  "percentage": "100"
}

### Ejemplo request multipart (con adjuntos)
Campos texto:
- action_id = 30
- action_source = hs
- comment = Seguimiento con evidencia
- user_id = 123

Archivos:
- upload_file[] = acta.pdf
- upload_file[] = foto.jpg

### Response OK total
{
  "status": 1,
  "messages": "Comment created and action updated successfully",
  "data": {
    "comment_id": 540,
    "action_id": "30",
    "action_source": "hs",
    "source_table": "hs_action",
    "action_status": "closed",
    "percentage": 100,
    "attachments": [
      {
        "attachment_id": 1001,
        "file_name": "acta.pdf",
        "s3_key": "<s3_key_1>"
      }
    ],
    "upload_warnings": []
  }
}

### Response con advertencias de adjuntos
{
  "status": 303,
  "messages": "Comment created and action updated with attachment warnings",
  "data": {
    "comment_id": 540,
    "action_id": "30",
    "action_source": "hs",
    "source_table": "hs_action",
    "action_status": null,
    "percentage": null,
    "attachments": [
      {
        "attachment_id": 1001,
        "file_name": "acta.pdf",
        "s3_key": "<s3_key_1>"
      }
    ],
    "upload_warnings": [
      "S3 error for foto.jpg: <detalle>"
    ]
  }
}

### Errores comunes
- status 0, messages "Provide action_id"
- status 0, messages "Provide comment"
- status 0, messages "Invalid action_source. Allowed: incident_root, hs, hs_action, all_action_plan"
- status 0, messages "source_table does not exist: <tabla>"
- status 0, messages "Action not found"

### Explicacion de campos relevantes
- comment_id: id creado en comment_master.
- action_source: valor original recibido en request (o default aplicado).
- source_table: tabla resuelta internamente.
- action_status / percentage: null si no fueron enviados.
- attachments: adjuntos subidos exitosamente en esta operacion.
- upload_warnings: advertencias por archivos fallidos en exito parcial.

---

## Resumen de mapeos clave

### Alias de fuente
- hs -> hs_action
- hs_action -> hs_action
- incident_root -> all_action_plan
- all_action_plan -> all_action_plan

### comment_type efectivo
- Para hs y hs_action: hs
- Para incident_root y all_action_plan: el mismo valor recibido

### type en incedent_upload
- upload_comments_attachment_amatia_express: usa comment_type recibido tal cual (incluye null/vacio).
- create_actions_comment_amatia_express: usa source_table resuelta (hs_action/all_action_plan).

---

## Recomendaciones de consumo
1. En list_comments, enviar siempre action_table cuando sea posible para evitar ambiguedad.
2. Para adjuntos, usar nombres de archivo unicos en cliente cuando aplique.
3. Manejar status 303 como exito parcial (mostrar advertencias al usuario).
4. Guardar y reutilizar s3_key cuando se requiera traza o reconsulta de adjuntos.

---

## Integracion frontend (Message Center Actions)

Esta seccion documenta el comportamiento aplicado en frontend para el modulo Actions, en linea con los endpoints amatia_express.

### Pantalla objetivo
- src/features/MessageCenterActionComments.js
- src/features/actions/ActionsComments.js

### 1) Creacion de comentario con estado, porcentaje y adjuntos

Endpoint utilizado:
- create_actions_comment_amatia_express

Reglas de envio en frontend:
- Si no hay archivos adjuntos: request en JSON.
- Si hay uno o varios archivos: request en multipart/form-data.

Campos enviados:
- action_id (requerido)
- comment (requerido)
- action_source (usa action_table de la accion abierta)
- action_status (codigo numerico del estado)
- percentage (valor del slider de progreso)
- user_id (si existe en sesion)
- comment_by (si existe en sesion)
- imagefiles[] (0..n archivos)

Reglas UX implementadas:
- El slider de progreso inicia con el percentage actual de la accion.
- El selector de estado inicia con el estado actual de la accion.
- El valor enviado en `action_status` se resuelve desde `modules.actions.catalogs.status` del endpoint `get_configuration_amatia_express`, usando `numeric_code`.
- Si el formulario tiene valor textual (ej: code o label), frontend lo convierte a su `numeric_code` antes de enviar.
- status = 1 y status = 303 se tratan como exito.
- Al guardar exitosamente:
  - se limpia el formulario
  - se regresa a la pestaña de lista
  - se recarga la lista de comentarios
  - se actualizan tabla y detalle de la accion en el drawer

### 2) Visualizacion de lista de comentarios con adjuntos

Endpoint utilizado:
- get_actions_list_comments_amatia_express

Normalizacion de datos en Redux:
- src/stores/actions/fetchActionCommentsSlice.js normaliza la respuesta para consumo consistente:
  - responsible_comments
  - reviewer_comments
  - other_comments
  - attachments (globales de accion)

Datos mostrados por comentario en UI:
- autor (author_name)
- fecha (created_date o comment_time)
- texto (comment)
- adjuntos (attachments[])

Resolucion de adjuntos en UI:
- nombre: file_name -> old_filename -> new_filename
- url: url (firmada S3) -> path (fallback)

### 3) Adjuntar archivos a un comentario existente

Endpoint utilizado:
- upload_comments_attachment_amatia_express

Accion de UI:
- En cada card de comentario se muestra boton para adjuntar archivos.
- El boton abre selector de multiples archivos.

Campos enviados:
- action_id (requerido)
- comment_id (requerido)
- comment_type (action_table actual)
- user_id (si existe en sesion)
- upload_file[] (1..n archivos)

Manejo de respuesta:
- status = 1 y status = 303 se tratan como exito.
- luego del upload exitoso se recarga la lista de comentarios de la accion.

### 4) Slices relacionados

- src/stores/actions/editActionCommentsSlice.js
  - create_actions_comment_amatia_express
  - soporta payload JSON o formData

- src/stores/actions/fetchActionCommentsSlice.js
  - get_actions_list_comments_amatia_express
  - normaliza respuesta agrupada por roles

- src/stores/actions/uploadCommentAttachmentsSlice.js
  - uploadActionCommentAttachments -> upload_comments_attachment_amatia_express
  - mantiene compatibilidad con uploadCommentAttachments (tasklist)
