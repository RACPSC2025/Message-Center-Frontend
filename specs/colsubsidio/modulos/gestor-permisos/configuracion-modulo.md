# Configuracion Funcional - Gestor de Permisos

## 1. Objetivo de Configuracion
Definir los parametros funcionales base que controlan el comportamiento del modulo sin amarrarlo todavia a endpoints especificos.

## 2. Parametros Recomendados
- paginacion_default: 10
- paginacion_opciones: [10, 25, 50, 100]
- ventana_alerta_vencimiento_dias: 30
- colores_estado_habilitados: true
- habilitar_exportacion: true
- habilitar_impresion: true
- permitir_cierre_con_pendientes_no_criticos: false

## 3. Catalogos Iniciales
Tipos de estado de permiso:
- aprobado
- en_revision
- vencido
- rechazado
- cerrado

Tipos de estado de requisito:
- pendiente
- en_gestion
- cumplido
- no_aplica
- vencido

Campos de busqueda:
- expediente
- solicitante
- ubicacion
- responsable

## 4. Validaciones Funcionales
- expediente: obligatorio y unico en alcance organizacional.
- fecha_vencimiento: no puede ser menor a fecha_creacion.
- estado_cerrado: requiere validacion de reglas de cierre.
- requisitos: si existen criticos pendientes, bloquear cierre.

## 5. Matriz de Prioridad (Referencia)
- Alta: vencido o vence en <= 7 dias.
- Media: vence entre 8 y 30 dias.
- Baja: vence en > 30 dias.

## 6. Permisos por Rol (Conceptual)
- admin_cumplimiento: crear, editar, cerrar, exportar.
- analista: crear, editar, comentar.
- consulta: solo lectura y descarga permitida.

## 7. Observabilidad y Trazabilidad
- Registrar cambios de estado con marca temporal.
- Registrar usuario responsable de cada cambio.
- Guardar comentario obligatorio en transiciones criticas.

## 8. Dependencias Futuras
- Contrato de API para CRUD de permisos.
- Contrato de API para requisitos y anexos.
- Servicio de alertas y notificaciones.
