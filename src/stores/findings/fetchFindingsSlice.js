import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

// MOCK DATA - CAMBIAR A false PARA DESACTIVAR
const USE_MOCK_DATA = true;

const MOCK_FINDINGS = [
  {
    id: '1',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1185',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '134',
    level4: '874',
    brief_description:
      'Falla en el sistema de seguridad industrial durante auditoría interna. Se detectaron incumplimientos en los procedimientos de bloqueo y etiquetado.',
    status: '1',
    created_at: '2024-01-15 10:30:00',
    closure_date_required: '2024-03-15',
    que_what: 'Incumplimiento en procedimientos de bloqueo y etiquetado',
    que_when: '15/01/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'Adalgiza Ramos',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [
      { url: 'https://picsum.photos/seed/finding1/400/250' },
      { url: 'https://picsum.photos/seed/finding1b/400/250' },
      { url: 'https://picsum.photos/seed/finding1b/400/250' },
      { url: 'https://picsum.photos/seed/finding1b/400/250' },
      { url: 'https://picsum.photos/seed/finding1b/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '2',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '4',
    reporting_person: '1180',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '135',
    level4: '875',
    brief_description:
      'Derrame de aceite hidráulico en el área de mantenimiento. Se encontraron aproximadamente 5 litros en el piso sin contención.',
    status: '2',
    created_at: '2024-02-20 14:00:00',
    closure_date_required: '2024-04-20',
    que_what: 'Derrame de aceite hidráulico sin contención',
    que_when: '20/02/2024',
    finding_type: '2',
    finding_source_name: 'Administrativo',
    reporter_name: 'Adriana Aldana',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Barranca',
    plant_name: 'Barranca',
    attachments: [{ url: 'https://picsum.photos/seed/finding2/400/250' }],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '3',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '5',
    reporting_person: '1085',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '136',
    level4: '876',
    brief_description:
      'Observación de seguridad: trabajador realizando tarea en altura sin arnés de seguridad correctamente ajustado. Se detuvo la actividad inmediatamente.',
    status: '1',
    created_at: '2024-03-05 09:15:00',
    closure_date_required: '2024-03-05',
    que_what: 'Trabajo en altura sin arnés de seguridad',
    que_when: '05/03/2024',
    finding_type: '3',
    finding_source_name: 'PQRs',
    reporter_name: 'ADRIANA LONDOÑO ANGEL',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [
      { url: 'https://picsum.photos/seed/finding3a/400/250' },
      { url: 'https://picsum.photos/seed/finding3b/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '4',
    inspection_id: '5',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1107',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '134',
    level4: '874',
    brief_description:
      'No conformidad documental: los registros de capacitación en manejo de extintores no están actualizados. Falta firma del instructor en 3 registros.',
    status: '3',
    created_at: '2024-03-10 11:45:00',
    closure_date_required: '2024-05-10',
    que_what: 'Registros de capacitación desactualizados',
    que_when: '10/03/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'ALEJANDRO HERRERA MARTINEZ',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [
      { url: 'https://picsum.photos/seed/finding4a/400/250' },
      { url: 'https://picsum.photos/seed/finding4b/400/250' },
      { url: 'https://picsum.photos/seed/finding4c/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 3
  },
  {
    id: '5',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '5',
    reporting_person: '1275',
    company_who_report: 'COMPAÑIA ABC',
    level1: '45',
    level2: '202',
    level3: '137',
    level4: '877',
    brief_description:
      'Incidente ambiental menor: disposición inadecuada de residuos peligrosos en el contenedor de reciclaje general. Se separaron y clasificaron correctamente.',
    status: '4',
    created_at: '2024-04-01 08:30:00',
    closure_date_required: '2024-04-15',
    que_what: 'Disposición inadecuada de residuos peligrosos',
    que_when: '01/04/2024',
    finding_type: '2',
    finding_source_name: 'PQRs',
    reporter_name: 'Alex Ferney Malagon',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [{ url: 'https://picsum.photos/seed/finding5/400/250' }],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '6',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '3',
    reporting_person: '1283',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '135',
    level4: '875',
    brief_description:
      'Falta de señalización en zona de almacenamiento de productos químicos. No se identifican correctamente los riesgos asociados.',
    status: '1',
    created_at: '2024-04-15 16:20:00',
    closure_date_required: '2024-05-30',
    que_what: 'Señalización insuficiente en almacenamiento de químicos',
    que_when: '15/04/2024',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'Alexander Cadena',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Barranca',
    plant_name: 'Barranca',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '7',
    inspection_id: '10',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1229',
    company_who_report: 'CONTRATISTA XYZ',
    level1: '44',
    level2: '201',
    level3: '136',
    level4: '876',
    brief_description:
      'Hallazgo crítico: extintor en bodega principal con fecha de vencimiento expirada (12/2023). Se reemplazó inmediatamente.',
    status: '4',
    created_at: '2024-05-02 07:00:00',
    closure_date_required: '2024-05-02',
    que_what: 'Extintor vencido en bodega principal',
    que_when: '02/05/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'Alexander Medina',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [
      { url: 'https://picsum.photos/seed/finding7a/400/250' },
      { url: 'https://picsum.photos/seed/finding7b/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '8',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1328',
    company_who_report: null,
    level1: '45',
    level2: '202',
    level3: '137',
    level4: '877',
    brief_description:
      'Incumplimiento en uso de EPP: supervisor observó a 2 operarios sin guantes de seguridad en área de soldadura.',
    status: '2',
    created_at: '2024-05-20 13:45:00',
    closure_date_required: '2024-05-25',
    que_what: 'Operarios sin guantes de seguridad en soldadura',
    que_when: '20/05/2024',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Alicia Barrera',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [
      { url: 'https://picsum.photos/seed/finding8a/400/250' },
      { url: 'https://picsum.photos/seed/finding8b/400/250' },
      { url: 'https://picsum.photos/seed/finding8c/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '9',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '3',
    reporting_person: '1140',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '134',
    level4: '874',
    brief_description:
      'Mejora continua: se identificó oportunidad de optimización en el proceso de carga de camiones. Tiempo muerto promedio de 15 minutos por carga.',
    status: '1',
    created_at: '2024-06-10 10:00:00',
    closure_date_required: '2024-08-10',
    que_what: 'Oportunidad de optimización en carga de camiones',
    que_when: '10/06/2024',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'ALVARO ROMERO NARANJO',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '10',
    inspection_id: '15',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1325',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '135',
    level4: '875',
    brief_description:
      'No conformidad en procedimiento de permisos de trabajo: 2 permisos en caliente no tenían análisis de riesgo diligenciado.',
    status: '3',
    created_at: '2024-07-05 15:30:00',
    closure_date_required: '2024-08-05',
    que_what: 'Permisos en caliente sin análisis de riesgo',
    que_when: '05/07/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'Ana Elvira Medina Meza',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [{ url: 'https://picsum.photos/seed/finding10/400/250' }],
    risk_analysis: null,
    action_plans_count: 4
  },
  {
    id: '11',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1162',
    company_who_report: 'EMPRESA DE MANTENIMIENTO SA',
    level1: '43',
    level2: '200',
    level3: '136',
    level4: '876',
    brief_description:
      'Filtración de agua en techo de sala de control. Se ha reportado 3 veces sin solución permanente. Riesgo de daño a equipos electrónicos.',
    status: '1',
    created_at: '2024-08-01 09:00:00',
    closure_date_required: '2024-09-01',
    que_what: 'Filtración de agua recurrente en sala de control',
    que_when: '01/08/2024',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Andres Ocampo',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Barranca',
    plant_name: 'Barranca',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '12',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '3',
    reporting_person: '1214',
    company_who_report: null,
    level1: '45',
    level2: '202',
    level3: '137',
    level4: '877',
    brief_description:
      'Comportamiento inseguro: trabajador usando teléfono móvil mientras operaba montacargas. Se realizó llamado de atención verbal y registro.',
    status: '2',
    created_at: '2024-08-15 11:20:00',
    closure_date_required: '2024-08-15',
    que_what: 'Uso de teléfono móvil operando montacargas',
    que_when: '15/08/2024',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'Armando Corzo Prieto',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '13',
    inspection_id: '20',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1333',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '134',
    level4: '874',
    brief_description:
      'Auditoría documental: procedimiento de respuesta a emergencias no ha sido actualizado desde 2021. No incluye nuevos escenarios de riesgo identificados.',
    status: '3',
    created_at: '2024-09-01 08:00:00',
    closure_date_required: '2024-10-01',
    que_what: 'Procedimiento de emergencias desactualizado desde 2021',
    que_when: '01/09/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'Betty Acevedo',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '14',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1301',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '135',
    level4: '875',
    brief_description:
      'Desorden en bodega de repuestos: materiales almacenados bloquean salida de emergencia. Se reubicaron inmediatamente.',
    status: '4',
    created_at: '2024-09-20 16:45:00',
    closure_date_required: '2024-09-20',
    que_what: 'Materiales bloqueando salida de emergencia',
    que_when: '20/09/2024',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Camila Llinas Restrepo',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '15',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '3',
    reporting_person: '1132',
    company_who_report: 'CONTRATISTA DE SEGURIDAD',
    level1: '45',
    level2: '202',
    level3: '136',
    level4: '876',
    brief_description:
      'Vehículo de emergencia (ambulancia) con tanque de combustible por debajo del 25%. No apto para responder a emergencias.',
    status: '1',
    created_at: '2024-10-05 07:30:00',
    closure_date_required: '2024-10-06',
    que_what: 'Ambulancia con combustible insuficiente',
    que_when: '05/10/2024',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'CAMILO ANDRES DOMINGUEZ GUTIERREZ',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '16',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1342',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '137',
    level4: '877',
    brief_description:
      'No se realizó la inspección preoperacional del generador eléctrico de respaldo. Registro firmado pero sin datos de la inspección.',
    status: '2',
    created_at: '2024-10-18 14:00:00',
    closure_date_required: '2024-11-01',
    que_what: 'Inspección preoperacional de generador no realizada',
    que_when: '18/10/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'Carlos Enrique',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '17',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1218',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '134',
    level4: '874',
    brief_description:
      'Ruido excesivo en área de compresores: medición arrojó 92 dB sin atenuación. Personal no usa protección auditiva adecuada.',
    status: '1',
    created_at: '2024-11-01 10:15:00',
    closure_date_required: '2024-12-01',
    que_what: 'Ruido excesivo en área de compresores',
    que_when: '01/11/2024',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Carlos Alberto Duitama',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '18',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '3',
    reporting_person: '1104',
    company_who_report: null,
    level1: '45',
    level2: '202',
    level3: '135',
    level4: '875',
    brief_description:
      'Acto inseguro: trabajador retiró guarda de protección de máquina troqueladora mientras estaba en funcionamiento para ajustar pieza.',
    status: '3',
    created_at: '2024-11-15 09:30:00',
    closure_date_required: '2024-11-30',
    que_what: 'Guarda de protección retirada con máquina funcionando',
    que_when: '15/11/2024',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'CARLOS ANTONIO VERGARA GUTIERREZ',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 3
  },
  {
    id: '19',
    inspection_id: '25',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1142',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '136',
    level4: '876',
    brief_description:
      'Hallazgo significativo: sistema de detección de incendios en bodega de químicos no fue probado en los últimos 6 meses. Se programó prueba inmediata.',
    status: '2',
    created_at: '2024-12-01 11:00:00',
    closure_date_required: '2024-12-15',
    que_what: 'Sistema de detección de incendios sin prueba en 6 meses',
    que_when: '01/12/2024',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'CARLOS AUGUSTO VILLALOBOS ARIZA',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Barranca',
    plant_name: 'Barranca',
    attachments: [
      { url: 'https://picsum.photos/seed/finding19a/400/250' },
      { url: 'https://picsum.photos/seed/finding19b/400/250' }
    ],
    risk_analysis: null,
    action_plans_count: 5
  },
  {
    id: '20',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1212',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '137',
    level4: '877',
    brief_description:
      'Incumplimiento contractual: empresa de aseo no entrega los certificados de disposición final de residuos desde septiembre 2024.',
    status: '4',
    created_at: '2024-12-10 13:00:00',
    closure_date_required: '2024-12-20',
    que_what: 'Certificados de disposición de residuos no entregados',
    que_when: '10/12/2024',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Carlos Orlando Rodriguez Ordoñez',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  },
  {
    id: '21',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '3',
    reporting_person: '1308',
    company_who_report: null,
    level1: '45',
    level2: '202',
    level3: '134',
    level4: '874',
    brief_description:
      'Condición subestándar: escalera de acceso a tanque elevado tiene un peldaño suelto. Se restringió el acceso hasta reparación.',
    status: '1',
    created_at: '2025-01-10 08:45:00',
    closure_date_required: '2025-01-17',
    que_what: 'Peldaño suelto en escalera de tanque elevado',
    que_when: '10/01/2025',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'Catherine Mora Cendales',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '22',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '1',
    reporting_person: '1129',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '135',
    level4: '875',
    brief_description:
      'Actualización de matriz de aspectos ambientales: no se incluyeron los nuevos productos químicos introducidos en el proceso de limpieza en 2024.',
    status: '3',
    created_at: '2025-01-25 15:30:00',
    closure_date_required: '2025-03-01',
    que_what: 'Matriz ambiental sin nuevos productos químicos 2024',
    que_when: '25/01/2025',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'CIRO ALFONSO VILLAMIZAR',
    region_name: 'AYACUCHO',
    country_name: null,
    business_name: 'AYACUCHO',
    plant_name: 'AYACUCHO',
    attachments: [{ url: 'https://picsum.photos/seed/finding22/400/250' }],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '23',
    inspection_id: '30',
    module: 'inspeccion',
    finding_source: '2',
    reporting_person: '1185',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '136',
    level4: '876',
    brief_description:
      'Falta de mantenimiento preventivo en montacargas: 3 unidades excedieron el intervalo de servicio programado por más de 200 horas.',
    status: '2',
    created_at: '2025-02-05 10:00:00',
    closure_date_required: '2025-03-05',
    que_what: 'Montacargas con mantenimiento preventivo vencido',
    que_when: '05/02/2025',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'Adalgiza Ramos',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Barranca',
    plant_name: 'Barranca',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 3
  },
  {
    id: '24',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '3',
    reporting_person: '1180',
    company_who_report: null,
    level1: '45',
    level2: '202',
    level3: '137',
    level4: '877',
    brief_description:
      'Observación positiva: se reconoce al equipo de mantenimiento por detener trabajo inseguro en instalación eléctrica sin bloqueo previo.',
    status: '4',
    created_at: '2025-02-20 11:30:00',
    closure_date_required: '2025-02-20',
    que_what: 'Reconocimiento a equipo por detener trabajo inseguro',
    que_when: '20/02/2025',
    finding_type: '3',
    finding_source_name: 'Inspecciones',
    reporter_name: 'Adriana Aldana',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 0
  },
  {
    id: '25',
    inspection_id: '0',
    module: 'inspeccion',
    finding_source: '1',
    reporting_person: '1085',
    company_who_report: null,
    level1: '43',
    level2: '200',
    level3: '134',
    level4: '874',
    brief_description:
      'No conformidad en gestión del cambio: se modificó el layout del área de almacenamiento sin realizar la evaluación de riesgos correspondiente.',
    status: '1',
    created_at: '2025-03-01 14:00:00',
    closure_date_required: '2025-04-01',
    que_what: 'Cambio de layout sin evaluación de riesgos',
    que_when: '01/03/2025',
    finding_type: '1',
    finding_source_name: 'Auditorias',
    reporter_name: 'ADRIANA LONDOÑO ANGEL',
    region_name: 'OCENSA',
    country_name: null,
    business_name: 'Bogotá',
    plant_name: 'Bogotá',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 2
  },
  {
    id: '26',
    inspection_id: '0',
    module: 'hallazgo',
    finding_source: '2',
    reporting_person: '1107',
    company_who_report: null,
    level1: '44',
    level2: '201',
    level3: '135',
    level4: '875',
    brief_description:
      'Iluminación insuficiente en pasillo de bodega general: medición de 50 lux donde el mínimo requerido es 150 lux. Riesgo de accidentes.',
    status: '3',
    created_at: '2025-03-10 16:00:00',
    closure_date_required: '2025-04-10',
    que_what: 'Iluminación deficiente en pasillo de bodega',
    que_when: '10/03/2025',
    finding_type: '2',
    finding_source_name: 'Visita gerencial',
    reporter_name: 'ALEJANDRO HERRERA MARTINEZ',
    region_name: 'VASCONIA',
    country_name: null,
    business_name: 'VASCONIA',
    plant_name: 'VASCONIA',
    attachments: [],
    risk_analysis: null,
    action_plans_count: 1
  }
];

const initialState = {
  loading: false,
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  },
  error: null
};

export const fetchFindings = createAsyncThunk(
  'findings/fetchFindings',
  async (params, { rejectWithValue }) => {
    if (USE_MOCK_DATA) {
      const page = Number(params.page) || 1;
      const limit = Number(params.limit) || 10;
      const start = (page - 1) * limit;
      const paginated = MOCK_FINDINGS.slice(start, start + limit);
      return {
        data: paginated,
        pagination: {
          page,
          limit,
          total: MOCK_FINDINGS.length,
          total_pages: Math.ceil(MOCK_FINDINGS.length / limit)
        }
      };
    }
    try {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });

      const queryString = queryParams.toString();
      // RUTA CORRECTA
      const url = `/message_center_api/inspecciones_api/list${queryString ? `?${queryString}` : ''}`;

      console.log('🔍 Fetching findings:', url);

      const response = await axiosInstance.get(url);

      console.log('✅ Response:', response.data);

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFinding = createAsyncThunk(
  'findings/updateFinding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/message_center_api/inspecciones_api/update/${id}`,
        data
      );

      if (response.data.success) {
        return response.data.data;
      }

      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar');
    }
  }
);

const fetchFindingsSlice = createSlice({
  name: 'findings',
  initialState,
  reducers: {
    resetFindings: (state) => {
      state.data = [];
      state.pagination = initialState.pagination;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFindings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFindings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFindings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetFindings } = fetchFindingsSlice.actions;
export default fetchFindingsSlice.reducer;
