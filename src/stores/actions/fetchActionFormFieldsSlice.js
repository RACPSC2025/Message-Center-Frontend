import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

// Respuesta provisional mientras se modifica la API
// TODO: Eliminar esta respuesta provisional cuando la API sea actualizada
const provisionalResponse = {
  "status": 1,
  "messages": "Success",
  "data": {
    "Ubicación Organizacional": {
      "create_date": {
        "label": "Fecha de creación",
        "type": "date",
        "required": true,
        "name": "current_date",
        "default_value": new Date().toISOString().split('T')[0],
        "gridSize": "6"
      },
                  "level_1": {
        "label": "Corporativo",
        "type": "autocomplete",
        "required": true,
        "name": "level_1",
        "default_value": "",
        "gridSize": "6",
        "options": [
          {
            "value": "43",
            "label": "OCENSA"
          }
        ],
        "dependent": [
          "level_2",
          "level_3",
          "level_4"
        ]
      },
      "level_2": {
        "label": "Zona",
        "type": "autocomplete",
        "required": true,
        "name": "level_2",
        "default_value": "",
        "gridSize": "6",
        "options": [],
        "dependent": [
          "level_3",
          "level_4"
        ],
        "api_details": {
          "api_url": "tasklist_api/get_level2",
          "param_key": "id_level1",
          "parent_element": "level_1"
        }
      },
      "level_3": {
        "label": "Sector",
        "type": "autocomplete",
        "required": true,
        "name": "level_3",
        "default_value": "",
        "gridSize": "6",
        "options": [],
        "dependent": [
          "level_4"
        ],
        "api_details": {
          "api_url": "tasklist_api/get_level3",
          "param_key": "id_level2",
          "parent_element": "level_2"
        }
      },
      "level_4": {
        "label": "Estacion",
        "type": "autocomplete",
        "required": true,
        "name": "level_4",
        "default_value": "",
        "gridSize": "6",
        "options": [],
        "api_details": {
          "api_url": "tasklist_api/get_level4",
          "param_key": "id_level3",
          "parent_element": "level_3"
        }
      }
    },
    "Observación": {
      "hs_process": {
        "label": "Direcciones",
        "type": "dropdown",
        "required": true,
        "name": "hs_process",
        "default_value": "",
        "gridSize": "12",
        "options": [
          {
            "value": "1101",
            "label": "Direccion Estrategia y Finanzas"
          },
          {
            "value": "1104",
            "label": "Direccion Organización y Talento"
          },
          {
            "value": "1105",
            "label": "Direccion legal y asunto corporativos"
          },
          {
            "value": "1106",
            "label": "Direccion de Operaciones"
          },
          {
            "value": "1107",
            "label": "Direccion responsabilidad Integral "
          },
          {
            "value": "1217",
            "label": "Direccion legal y Secretaría general"
          },
          {
            "value": "1218",
            "label": "Dirección de Servicios Corporativos"
          }
        ]
      },
      "hs_fuente": {
        "label": "Fuente",
        "type": "dropdown",
        "required": true,
        "name": "hs_fuente",
        "default_value": "",
        "gridSize": "12",
        "options": [
          {
            "value": "1116",
            "label": "RESULTADO DE INCADORES "
          },
          {
            "value": "1236",
            "label": "Emergencias"
          },
          {
            "value": "1234",
            "label": "Rutinas"
          },
          {
            "value": "1233",
            "label": "Divulgaciones"
          },
          {
            "value": "1232",
            "label": "Ordenes de trabajo"
          },
          {
            "value": "1231",
            "label": "Capacitaciones"
          },
          {
            "value": "1230",
            "label": "Simulacros"
          },
          {
            "value": "1229",
            "label": "Brigadas"
          },
          {
            "value": "1117",
            "label": "OTROS"
          },
          {
            "value": "1102",
            "label": "ACTUALIZACIÓN NORMATIVA"
          },
          {
            "value": "1115",
            "label": "REQUERIMIENTOS CONTRACTUALES"
          },
          {
            "value": "1114",
            "label": "INCIDENTES AMBIENTALES "
          },
          {
            "value": "1113",
            "label": "INSPECCIONES"
          },
          {
            "value": "1112",
            "label": "PQR"
          },
          {
            "value": "1111",
            "label": "CAMBIOS DE PROCESOS"
          },
          {
            "value": "1110",
            "label": "AUDITORÍAS"
          },
          {
            "value": "1109",
            "label": "GESTIÓN DE PAGOS"
          }
        ]
      },
      "hs_causes": {
        "label": "Causas",
        "type": "dropdown",
        "required": true,
        "name": "hs_causes",
        "default_value": "",
        "gridSize": "12",
        "multiple": true,
        "options": [
          {
            "value": "1126",
            "label": "FALLAS DE COMUNICACIÓN"
          },
          {
            "value": "1134",
            "label": "OTROS"
          },
          {
            "value": "1133",
            "label": "CAMBIO EN EL ALCANCE DE LAS ACTIVIDADES"
          },
          {
            "value": "1132",
            "label": "RECLAMACIÓN DE CLIENTE Y/O GRUPOS DE INTERÉS"
          },
          {
            "value": "1131",
            "label": "NO CUMPLIMIENTO DE ESPECIFICACIONES O REQUERIMIENTOS"
          },
          {
            "value": "1130",
            "label": "MANTEMIENTO"
          },
          {
            "value": "1129",
            "label": "HERRAMIENTAS Y EQUIPOS"
          },
          {
            "value": "1128",
            "label": "FALTA DE PLANEACIÓN"
          },
          {
            "value": "1127",
            "label": "FALLAS DE LIDERAZGO Y/O SUPERVISIÓN"
          },
          {
            "value": "1103",
            "label": "ABASTECIMIENTO Y CONTROL DE CONTRATISTAS"
          },
          {
            "value": "1125",
            "label": "FALLAS EN GESTIÓN DOCUMENTAL"
          },
          {
            "value": "1124",
            "label": "DESCONOCIMIENTO DE LA INFORMACIÓN"
          },
          {
            "value": "1123",
            "label": "FACTOR PERSONAL (RELACIONADO A FALTA DE CONOCIMIENTO, HABILIDAD Y MOTIVACIÓN)"
          },
          {
            "value": "1122",
            "label": "ESTÁDARES Y PROCEDIMIENTOS"
          },
          {
            "value": "1121",
            "label": "PAGO EXTEMPORANEO"
          },
          {
            "value": "1120",
            "label": "PAGO NO REALIZADO "
          },
          {
            "value": "1119",
            "label": "INCUMPLIMIENTO DE LOS TIEMPOS LEGALES"
          },
          {
            "value": "1118",
            "label": "FALTA DE SOPORTE DE CUMPLIMIENTOS LEGALES AMBIENTALES"
          }
        ]
      },
      "description_fuente": {
        "label": "Descripción de la Fuente",
        "type": "textarea",
        "required": true,
        "name": "description_fuente",
        "default_value": "",
        "gridSize": "12"
      }
    },
    "Clasificación de la acción": {
      "action_category": {
        "label": "Categoría de la Acción",
        "type": "dropdown",
        "required": true,
        "name": "action_category",
        "default_value": "1",
        "gridSize": "6",
        "options": [
          {
            "value": "1",
            "label": "AC"
          },
          {
            "value": "2",
            "label": "AP"
          },
          {
            "value": "3",
            "label": "AM"
          }
        ]
      },
      "action_status": {
        "label": "Estado",
        "type": "dropdown",
        "required": true,
        "name": "action_status",
        "default_value": "1",
        "gridSize": "6",
        "options": [
          {
            "value": "1",
            "label": "ABIERTAS"
          },
          {
            "value": "2",
            "label": "CERRADAS"
          },
          {
            "value": "3",
            "label": "CANCELADAS"
          }
        ]
      },
      "type_intervention": {
        "label": "Tipo de medida de intervención",
        "type": "dropdown",
        "required": true,
        "name": "type_intervention",
        "default_value": "1",
        "gridSize": "12",
        "options": [
          {
            "value": "10",
            "label": "5 porqués"
          },
          {
            "value": "8",
            "label": "Árbol de Causas"
          },
          {
            "value": "9",
            "label": "Otro"
          }
        ]
      },
      "cause_description": {
        "label": "Acciones inmediatas tomadas",
        "type": "textarea",
        "required": true,
        "name": "cause_description",
        "default_value": "",
        "gridSize": "12"
      }
    },
    "Acción Propuesta": {
      "what_description": {
        "label": "Qué (Acción a tomar)",
        "type": "textarea",
        "required": true,
        "name": "what_description",
        "default_value": "",
        "gridSize": "12"
      },
      "how_description": {
        "label": "Cómo (Sugerencia de ejecución)",
        "type": "textarea",
        "required": true,
        "name": "how_description",
        "default_value": "",
        "gridSize": "12"
      },
      "action_start_date": {
        "label": "Fecha Propuesta de Inicio",
        "type": "date",
        "required": true,
        "name": "action_start_date",
        "default_value": "",
        "gridSize": "6"
      },
      "action_closing_date": {
        "label": "Fecha propuesta de cierre",
        "type": "date",
        "required": true,
        "name": "action_closing_date",
        "default_value": "",
        "gridSize": "6"
      },
      "responsible_person": {
        "label": "Responsable de ejecución",
        "type": "dropdown",
        "required": true,
        "name": "responsible_person",
        "default_value": "",
        "gridSize": "6",
        "options": [
          {
            "value": "1185",
            "label": "Adalgiza Ramos"
          },
          {
            "value": "1180",
            "label": "Adriana Aldana"
          },
          {
            "value": "1085",
            "label": "ADRIANA LONDOÑO ANGEL"
          },
          {
            "value": "1107",
            "label": "ALEJANDRO HERRERA MARTINEZ"
          },
          {
            "value": "1275",
            "label": "Alex Ferney Malagon"
          },
          {
            "value": "1102",
            "label": "ALEX YESID BUSTAMANTE CRISTANCHO"
          },
          {
            "value": "1283",
            "label": "Alexander Cadena"
          },
          {
            "value": "1206",
            "label": "Alexander Castro Valencia"
          },
          {
            "value": "1204",
            "label": "Alexander Gonzalez"
          },
          {
            "value": "1229",
            "label": "Alexander Medina"
          },
          {
            "value": "1267",
            "label": "Alexandra Quiroga Ardila"
          },
          {
            "value": "1328",
            "label": "Alicia Barrera"
          },
          {
            "value": "1236",
            "label": "Alvaro Andres Padilla Lobo"
          },
          {
            "value": "1198",
            "label": "Alvaro Barragan"
          },
          {
            "value": "1140",
            "label": "ALVARO ROMERO NARANJO"
          },
          {
            "value": "1325",
            "label": "Ana Elvira Medina Meza"
          },
          {
            "value": "1234",
            "label": "Ana Maria Martinez Quintero"
          },
          {
            "value": "1162",
            "label": "Andres Ocampo"
          },
          {
            "value": "1213",
            "label": "Angela Patricia Alvarez"
          },
          {
            "value": "1078",
            "label": "Anny Julieth Lozano Barrios"
          },
          {
            "value": "1281",
            "label": "Ariel Ivan Mendivelso Moreno"
          },
          {
            "value": "1214",
            "label": "Armando Corzo Prieto"
          },
          {
            "value": "1252",
            "label": "Armando Elias Estrada Gonzalez"
          },
          {
            "value": "1130",
            "label": "ARSENIO ENRIQUE ACEVEDO RAMOS"
          },
          {
            "value": "1122",
            "label": "BLEIDIS ISABEL MEDRANO RICARDO"
          },
          {
            "value": "1118",
            "label": "BREIGHNER CUESTA RODRIGUEZ"
          },
          {
            "value": "1301",
            "label": "Camila Llinas Restrepo"
          },
          {
            "value": "1132",
            "label": "CAMILO ANDRES DOMINGUEZ GUTIERREZ"
          },
          {
            "value": "1248",
            "label": "Carlo Vladimir Rua Rodriguez"
          },
          {
            "value": "1218",
            "label": "Carlos Alberto Duitama"
          },
          {
            "value": "1219",
            "label": "Carlos Alfonso Bejarano Peñuela"
          },
          {
            "value": "1193",
            "label": "Carlos Alfonso Moya Sierra"
          },
          {
            "value": "1104",
            "label": "CARLOS ANTONIO VERGARA GUTIERREZ"
          },
          {
            "value": "1142",
            "label": "CARLOS AUGUSTO VILLALOBOS ARIZA"
          },
          {
            "value": "1212",
            "label": "Carlos Orlando Rodriguez Ordoñez"
          },
          {
            "value": "1288",
            "label": "Catherine Andrea Clavijo Hurtado"
          },
          {
            "value": "1308",
            "label": "Catherine Mora Cendales"
          },
          {
            "value": "1136",
            "label": "CESAR AUGUSTO GONGORA GONZALEZ"
          },
          {
            "value": "1184",
            "label": "Cesar David Castillo Sanchez"
          },
          {
            "value": "1292",
            "label": "Cesar Rodriguez Vargas"
          },
          {
            "value": "1129",
            "label": "CIRO ALFONSO VILLAMIZAR"
          },
          {
            "value": "1103",
            "label": "DANIEL ENRIQUE RIOS GARCIA"
          },
          {
            "value": "1119",
            "label": "DANIEL STIVEL ALBA ALONSO"
          },
          {
            "value": "1284",
            "label": "Daniela Ocampo"
          },
          {
            "value": "1091",
            "label": "DAVID JOSE GONZALEZ GARCIA"
          },
          {
            "value": "1313",
            "label": "Diana Cristina Giraldo Aristizabal"
          },
          {
            "value": "1161",
            "label": "Diana Isabel Eugenia Ramirez Vargas"
          },
          {
            "value": "1309",
            "label": "Diana Patricia Lopez Palacios"
          },
          {
            "value": "1115",
            "label": "DIEGO ALEJANDRO PAEZ CAMPOS"
          },
          {
            "value": "1105",
            "label": "DIEGO ALEXANDER GUZMAN CONEJO"
          },
          {
            "value": "1094",
            "label": "DIEGO ANTONIO CARVAJAL DEL BASTO"
          },
          {
            "value": "1250",
            "label": "Edgar Enrique Torres Ayala"
          },
          {
            "value": "1207",
            "label": "Eduardo Perez Ruiz"
          },
          {
            "value": "1262",
            "label": "Eduardo Velasco Martinez"
          },
          {
            "value": "1276",
            "label": "Edward Oviedo"
          },
          {
            "value": "1249",
            "label": "Edwin Jose Grijalba Arias"
          },
          {
            "value": "1087",
            "label": "EDWIN MAURICIO ALVAREZ FIERRO"
          },
          {
            "value": "1101",
            "label": "EFRAIN AMAYA VANEGAS"
          },
          {
            "value": "1228",
            "label": "Eliana Maria Carranza Rojas"
          },
          {
            "value": "1111",
            "label": "ELKIN LARRARTE CASTILLO"
          },
          {
            "value": "1152",
            "label": "ELKIN ROLANDO ORJUELA CADENA"
          },
          {
            "value": "1310",
            "label": "Erika Noritsu Joya Navas"
          },
          {
            "value": "1075",
            "label": "Erika Tatiana Murgas Manosalva"
          },
          {
            "value": "1179",
            "label": "Fabian Buitrago"
          },
          {
            "value": "1295",
            "label": "Fabian Enrique Castillo"
          },
          {
            "value": "1223",
            "label": "Fabian Vidal Anaya"
          },
          {
            "value": "1319",
            "label": "Fabio Ocampo"
          },
          {
            "value": "1294",
            "label": "Felipe Villalobos cruz"
          },
          {
            "value": "1106",
            "label": "FELIX ANTONIO ZAMBRANO MARTINEZ"
          },
          {
            "value": "1257",
            "label": "Fernando Javier Cardenas Alonso"
          },
          {
            "value": "1088",
            "label": "FRANCISCO ELIECER HOYOS GIRALDO"
          },
          {
            "value": "1090",
            "label": "FRANCISCO JAVIER MATIZ CHICA"
          },
          {
            "value": "1197",
            "label": "Franklin Berdugo Alvarez"
          },
          {
            "value": "1200",
            "label": "Freddy Sanabria Hernandez"
          },
          {
            "value": "1175",
            "label": "Gabriel Caicedo"
          },
          {
            "value": "1124",
            "label": "GABRIEL EDUARDO NIEBLES CASTRO"
          },
          {
            "value": "1227",
            "label": "Gabriel Mesa"
          },
          {
            "value": "1318",
            "label": "geovanny bombiela"
          },
          {
            "value": "1168",
            "label": "Geraldine Suarez Rodriguez"
          },
          {
            "value": "1225",
            "label": "German Andres Pardo Gonzalez"
          },
          {
            "value": "1269",
            "label": "German Augusto Tellez Parra"
          },
          {
            "value": "1286",
            "label": "Gloria Bibiana Miranda Duarte"
          },
          {
            "value": "1307",
            "label": "Gonzalo Castaneda Osorio"
          },
          {
            "value": "1237",
            "label": "Guillermo Puche"
          },
          {
            "value": "1187",
            "label": "Gustavo Adolfo Mendoza"
          },
          {
            "value": "1324",
            "label": "Hector David Calderon Sepulveda"
          },
          {
            "value": "1259",
            "label": "Heidy Viviana Celis Monroy"
          },
          {
            "value": "1314",
            "label": "Helber Melo"
          },
          {
            "value": "1141",
            "label": "HENRY ANTONIO MONTAÑEZ CARO"
          },
          {
            "value": "1176",
            "label": "Herling Florián"
          },
          {
            "value": "1240",
            "label": "Hilber Arley Moreno Guerrero"
          },
          {
            "value": "1113",
            "label": "HUGO ALBERTO GARCIA GARCIA"
          },
          {
            "value": "1097",
            "label": "IGNACIO JOSE GOMEZ BELTRAN"
          },
          {
            "value": "1296",
            "label": "Isvelitza Coromoto Montilla Bastidas"
          },
          {
            "value": "1261",
            "label": "Ivan Andres Paez Celis"
          },
          {
            "value": "1272",
            "label": "Ivan Augusto Martinez Lopez"
          },
          {
            "value": "1092",
            "label": "JAIME DAVID ORDOÑEZ GIL"
          },
          {
            "value": "1226",
            "label": "Jaiver Garcia Bernal"
          },
          {
            "value": "1128",
            "label": "JANUARIO BARBOSA RIVERA"
          },
          {
            "value": "1138",
            "label": "JAVIER AMADO DELGADO"
          },
          {
            "value": "1285",
            "label": "Jennyfer Ximena Rincon Vega"
          },
          {
            "value": "1323",
            "label": "Jessica Liliana Guarin Ayala"
          },
          {
            "value": "1315",
            "label": "Jessica Real Palacios"
          },
          {
            "value": "1195",
            "label": "Jesus Danilo Saldana Montero"
          },
          {
            "value": "1244",
            "label": "Jhon Alexander Cuervo Barragan"
          },
          {
            "value": "1178",
            "label": "Jhon Fabianny Mercado"
          },
          {
            "value": "1246",
            "label": "Jhon Ussa Gil"
          },
          {
            "value": "1253",
            "label": "Jhonatan Alberto Mino Jacome"
          },
          {
            "value": "1320",
            "label": "Jhonatan Andres Garcia Orjuela"
          },
          {
            "value": "1302",
            "label": "Johan Sebastian Romero Pena"
          },
          {
            "value": "1095",
            "label": "JOHN ALEJANDRO MESA AYURE"
          },
          {
            "value": "1221",
            "label": "John Helber Mejia Vargas"
          },
          {
            "value": "1081",
            "label": "JOHN JAIRO CRUZ LEMUS"
          },
          {
            "value": "1273",
            "label": "John Jairo Ovalle"
          },
          {
            "value": "1279",
            "label": "John Mauro Pacheco Molano"
          },
          {
            "value": "1258",
            "label": "Jorge Andres Ramirez Gomez"
          },
          {
            "value": "1084",
            "label": "JORGE ANTONIO MONSALVE SANCHEZ"
          },
          {
            "value": "1220",
            "label": "Jorge Eduardo Gutierrez Serna"
          },
          {
            "value": "1127",
            "label": "JORGE LUIS ARANGO QUINTERO"
          },
          {
            "value": "1131",
            "label": "JORGE RAMIRO TORRADO RINCON"
          },
          {
            "value": "1160",
            "label": "Jorge Suarez Stevenson"
          },
          {
            "value": "1290",
            "label": "Jose Alejandro Alzate Giraldo"
          },
          {
            "value": "1242",
            "label": "Jose Daniel Bohorquez Parrales"
          },
          {
            "value": "1254",
            "label": "Jose David Farias Pinzon"
          },
          {
            "value": "1191",
            "label": "Jose Efrain Forero Santamaria"
          },
          {
            "value": "1112",
            "label": "JOSE FERNANDO CHAPARRO TIVABIJA"
          },
          {
            "value": "1100",
            "label": "JOSE IGNACIO HINCAPIE MUÑOZ"
          },
          {
            "value": "1203",
            "label": "Jose Joaquin Vega Vega"
          },
          {
            "value": "1327",
            "label": "Josefa Duque"
          },
          {
            "value": "1194",
            "label": "Juan Camilo Fuentes Vallejo"
          },
          {
            "value": "1155",
            "label": "JUAN CARLOS ANGULO CARDONA"
          },
          {
            "value": "1196",
            "label": "Juan Carlos Cardenas Beleño"
          },
          {
            "value": "1120",
            "label": "JUAN DIEGO COLONIA OSPINA"
          },
          {
            "value": "1139",
            "label": "JUAN FERNANDO LANZZIANO MELO"
          },
          {
            "value": "1201",
            "label": "Juan Jose Morales Gaona"
          },
          {
            "value": "1157",
            "label": "JUAN MANUEL PADILLA CEPEDA"
          },
          {
            "value": "1144",
            "label": "JUAN OLIVER VEGA DUQUE"
          },
          {
            "value": "1205",
            "label": "Julian David Gomez Martinez"
          },
          {
            "value": "1114",
            "label": "JULIAN JAVIER CORRALES COBOS"
          },
          {
            "value": "1224",
            "label": "Julio Alexander Cordoba Fonseca"
          },
          {
            "value": "1238",
            "label": "Julio Cesar Jurado"
          },
          {
            "value": "1322",
            "label": "Karen Andrea Oidor Pajoy"
          },
          {
            "value": "1126",
            "label": "KEVIN ORLANDO CORENA ACOSTA"
          },
          {
            "value": "1280",
            "label": "Laura Marcela Suarez Barreto"
          },
          {
            "value": "1266",
            "label": "Laura Natalia Gomez Amaya"
          },
          {
            "value": "1153",
            "label": "LEONARDO CHAPARRO ZAMORA"
          },
          {
            "value": "1306",
            "label": "Leonardo Romero Catano"
          },
          {
            "value": "1282",
            "label": "Leopoldo Roa Daza"
          },
          {
            "value": "1159",
            "label": "LILIAN DE LA TORRE BALLESTEROS"
          },
          {
            "value": "1073",
            "label": "Liliana Medina Martinez"
          },
          {
            "value": "1149",
            "label": "LINA ALEJANDRA VELASCO ARCOS"
          },
          {
            "value": "1270",
            "label": "Lina Maria Paez Otero"
          },
          {
            "value": "1148",
            "label": "LOIDA ESTHER MONTES PEREZ"
          },
          {
            "value": "1239",
            "label": "Lucas Jaramillo Castano"
          },
          {
            "value": "1183",
            "label": "Luis Alejandro Ortega"
          },
          {
            "value": "1216",
            "label": "Luis Carlos Gomes Caceres Echavez"
          },
          {
            "value": "1274",
            "label": "Luis Eduardo Perez"
          },
          {
            "value": "1326",
            "label": "Luis Oscar Carrasquilla"
          },
          {
            "value": "1297",
            "label": "Manuel Alejandro Botía Díaz"
          },
          {
            "value": "1177",
            "label": "Maria Alejandra Duarte Velandia"
          },
          {
            "value": "1300",
            "label": "Maria Camila Calderon Bohorquez"
          },
          {
            "value": "1304",
            "label": "Maria Claudia Gallego Pinedo"
          },
          {
            "value": "1316",
            "label": "Maria Fernanda Iles Ruiz"
          },
          {
            "value": "1082",
            "label": "MARIA FERNANDA TAMAYO FLOREZ"
          },
          {
            "value": "1317",
            "label": "maria paulina gonzalez"
          },
          {
            "value": "1182",
            "label": "Mario Becerra"
          },
          {
            "value": "1291",
            "label": "Mario Garcia Buitrago"
          },
          {
            "value": "1278",
            "label": "Mario Raul Cely Verdugo"
          },
          {
            "value": "1230",
            "label": "Mario Torres Silva"
          },
          {
            "value": "1303",
            "label": "Marlon Andres Mazo"
          },
          {
            "value": "1256",
            "label": "Marlon Jose Pabon Meneses"
          },
          {
            "value": "1167",
            "label": "Martha Herrera Ochoa"
          },
          {
            "value": "1121",
            "label": "MAURICIO SANDOVAL ESCOBAR"
          },
          {
            "value": "1277",
            "label": "Mauro Andres Fernandez Morelo"
          },
          {
            "value": "1271",
            "label": "Miguel Arturo Bautista Garcia"
          },
          {
            "value": "1202",
            "label": "Milton Escobar"
          },
          {
            "value": "1287",
            "label": "Nancy Enerieht López García"
          },
          {
            "value": "1134",
            "label": "NATALIA CHAVEZ GARCIA"
          },
          {
            "value": "1217",
            "label": "Nelson Armando Rojas Serrano"
          },
          {
            "value": "1086",
            "label": "NICOLAS SANTIAGO RIVERA MONTOYA"
          },
          {
            "value": "1268",
            "label": "Nicolas Sebastian Yascual Erazo"
          },
          {
            "value": "1208",
            "label": "Nixon Javier Amaya"
          },
          {
            "value": "1117",
            "label": "ODILIO RIVERA MARQUEZ"
          },
          {
            "value": "1093",
            "label": "OLFER ALEXIS LEON BARBOSA"
          },
          {
            "value": "1265",
            "label": "Omar Augusto Vargas Nomesque"
          },
          {
            "value": "1232",
            "label": "Omar Elias Carreno"
          },
          {
            "value": "1233",
            "label": "Oscar Fernando Carvajal Leon"
          },
          {
            "value": "1209",
            "label": "Oscar Julian Olmos Solanilla"
          },
          {
            "value": "1210",
            "label": "Oswlado Antonio Florez Camargo"
          },
          {
            "value": "1135",
            "label": "PABLO ENRIQUE SIERRA SIERRA"
          },
          {
            "value": "1222",
            "label": "Pablo Javier Reyes Zipa"
          },
          {
            "value": "1260",
            "label": "Paola Rodriguez Chia"
          },
          {
            "value": "1110",
            "label": "PEDRO FABIAN LAGUADO"
          },
          {
            "value": "1211",
            "label": "Pedro Jose Heredia Pulido"
          },
          {
            "value": "1199",
            "label": "Raul Bernardo Rodriguez Toca"
          },
          {
            "value": "1189",
            "label": "REY ENRIQUE RAMIREZ"
          },
          {
            "value": "1255",
            "label": "Roky Gomez Ardila"
          },
          {
            "value": "1154",
            "label": "RONIEE PADILLA BURGOS"
          },
          {
            "value": "1150",
            "label": "ROSEMERY CARRILLO SANTIS"
          },
          {
            "value": "1264",
            "label": "Samuel Tarache Cantor"
          },
          {
            "value": "1147",
            "label": "SANDRA PATRICIA WILCHES PEÑA"
          },
          {
            "value": "1321",
            "label": "Sebastian Tirado Diaz"
          },
          {
            "value": "1083",
            "label": "SILVIO ANDRES AGUDELO PUERTA"
          },
          {
            "value": "1116",
            "label": "SIMON IVAN AVILA DIAZ"
          },
          {
            "value": "1173",
            "label": "Soporte Amatia"
          },
          {
            "value": "1",
            "label": "Super Admin"
          },
          {
            "value": "158",
            "label": "Super Admin"
          },
          {
            "value": "1329",
            "label": "test_basic basic"
          },
          {
            "value": "1215",
            "label": "Tito Cardenas"
          },
          {
            "value": "1186",
            "label": "Tomas Enrique Carroll"
          },
          {
            "value": "1158",
            "label": "VICTOR HUGO GUTIERREZ LEIVA"
          },
          {
            "value": "1235",
            "label": "Victor Manuel Bertel Larios"
          },
          {
            "value": "1247",
            "label": "Vladimir Castro Leon"
          },
          {
            "value": "1192",
            "label": "Vladimir Cordoba"
          },
          {
            "value": "1098",
            "label": "WALTER GASTELBONDO BARRAGAN"
          },
          {
            "value": "1245",
            "label": "Walther Augusto Castellanos Uribe"
          },
          {
            "value": "1108",
            "label": "WILLIAM PEÑARANDA"
          },
          {
            "value": "1125",
            "label": "WILLIAM RICARDO OICATA BENITEZ"
          },
          {
            "value": "1109",
            "label": "WILMER CALDERON PIEDRAHITA"
          },
          {
            "value": "1096",
            "label": "WILSON CASTILLO FANDINO"
          },
          {
            "value": "1298",
            "label": "Yeraldine Castaneda Morales"
          },
          {
            "value": "1299",
            "label": "Yesenia Vasquez Cardenas"
          },
          {
            "value": "1243",
            "label": "Yeyson Alveiro Lopez Hernandez"
          },
          {
            "value": "1263",
            "label": "Yudi Karin Aguilera Moreno"
          },
          {
            "value": "1143",
            "label": "YURI RAFAEL CAPARROSO GRIMALDI"
          }
        ]
      },
      "reviewer_person_id": {
        "label": "Responsable de revisión",
        "type": "dropdown",
        "required": true,
        "name": "reviewer_person_id",
        "default_value": "",
        "gridSize": "6",
        "options": [
          {
            "value": "1185",
            "label": "Adalgiza Ramos"
          },
          {
            "value": "1180",
            "label": "Adriana Aldana"
          },
          {
            "value": "1085",
            "label": "ADRIANA LONDOÑO ANGEL"
          },
          {
            "value": "1107",
            "label": "ALEJANDRO HERRERA MARTINEZ"
          },
          {
            "value": "1275",
            "label": "Alex Ferney Malagon"
          },
          {
            "value": "1102",
            "label": "ALEX YESID BUSTAMANTE CRISTANCHO"
          },
          {
            "value": "1283",
            "label": "Alexander Cadena"
          },
          {
            "value": "1206",
            "label": "Alexander Castro Valencia"
          },
          {
            "value": "1204",
            "label": "Alexander Gonzalez"
          },
          {
            "value": "1229",
            "label": "Alexander Medina"
          },
          {
            "value": "1267",
            "label": "Alexandra Quiroga Ardila"
          },
          {
            "value": "1328",
            "label": "Alicia Barrera"
          },
          {
            "value": "1236",
            "label": "Alvaro Andres Padilla Lobo"
          },
          {
            "value": "1198",
            "label": "Alvaro Barragan"
          },
          {
            "value": "1140",
            "label": "ALVARO ROMERO NARANJO"
          },
          {
            "value": "1325",
            "label": "Ana Elvira Medina Meza"
          },
          {
            "value": "1234",
            "label": "Ana Maria Martinez Quintero"
          },
          {
            "value": "1162",
            "label": "Andres Ocampo"
          },
          {
            "value": "1213",
            "label": "Angela Patricia Alvarez"
          },
          {
            "value": "1078",
            "label": "Anny Julieth Lozano Barrios"
          },
          {
            "value": "1281",
            "label": "Ariel Ivan Mendivelso Moreno"
          },
          {
            "value": "1214",
            "label": "Armando Corzo Prieto"
          },
          {
            "value": "1252",
            "label": "Armando Elias Estrada Gonzalez"
          },
          {
            "value": "1130",
            "label": "ARSENIO ENRIQUE ACEVEDO RAMOS"
          },
          {
            "value": "1122",
            "label": "BLEIDIS ISABEL MEDRANO RICARDO"
          },
          {
            "value": "1118",
            "label": "BREIGHNER CUESTA RODRIGUEZ"
          },
          {
            "value": "1301",
            "label": "Camila Llinas Restrepo"
          },
          {
            "value": "1132",
            "label": "CAMILO ANDRES DOMINGUEZ GUTIERREZ"
          },
          {
            "value": "1248",
            "label": "Carlo Vladimir Rua Rodriguez"
          },
          {
            "value": "1218",
            "label": "Carlos Alberto Duitama"
          },
          {
            "value": "1219",
            "label": "Carlos Alfonso Bejarano Peñuela"
          },
          {
            "value": "1193",
            "label": "Carlos Alfonso Moya Sierra"
          },
          {
            "value": "1104",
            "label": "CARLOS ANTONIO VERGARA GUTIERREZ"
          },
          {
            "value": "1142",
            "label": "CARLOS AUGUSTO VILLALOBOS ARIZA"
          },
          {
            "value": "1212",
            "label": "Carlos Orlando Rodriguez Ordoñez"
          },
          {
            "value": "1288",
            "label": "Catherine Andrea Clavijo Hurtado"
          },
          {
            "value": "1308",
            "label": "Catherine Mora Cendales"
          },
          {
            "value": "1136",
            "label": "CESAR AUGUSTO GONGORA GONZALEZ"
          },
          {
            "value": "1184",
            "label": "Cesar David Castillo Sanchez"
          },
          {
            "value": "1292",
            "label": "Cesar Rodriguez Vargas"
          },
          {
            "value": "1129",
            "label": "CIRO ALFONSO VILLAMIZAR"
          },
          {
            "value": "1103",
            "label": "DANIEL ENRIQUE RIOS GARCIA"
          },
          {
            "value": "1119",
            "label": "DANIEL STIVEL ALBA ALONSO"
          },
          {
            "value": "1284",
            "label": "Daniela Ocampo"
          },
          {
            "value": "1091",
            "label": "DAVID JOSE GONZALEZ GARCIA"
          },
          {
            "value": "1313",
            "label": "Diana Cristina Giraldo Aristizabal"
          },
          {
            "value": "1161",
            "label": "Diana Isabel Eugenia Ramirez Vargas"
          },
          {
            "value": "1309",
            "label": "Diana Patricia Lopez Palacios"
          },
          {
            "value": "1115",
            "label": "DIEGO ALEJANDRO PAEZ CAMPOS"
          },
          {
            "value": "1105",
            "label": "DIEGO ALEXANDER GUZMAN CONEJO"
          },
          {
            "value": "1094",
            "label": "DIEGO ANTONIO CARVAJAL DEL BASTO"
          },
          {
            "value": "1250",
            "label": "Edgar Enrique Torres Ayala"
          },
          {
            "value": "1207",
            "label": "Eduardo Perez Ruiz"
          },
          {
            "value": "1262",
            "label": "Eduardo Velasco Martinez"
          },
          {
            "value": "1276",
            "label": "Edward Oviedo"
          },
          {
            "value": "1249",
            "label": "Edwin Jose Grijalba Arias"
          },
          {
            "value": "1087",
            "label": "EDWIN MAURICIO ALVAREZ FIERRO"
          },
          {
            "value": "1101",
            "label": "EFRAIN AMAYA VANEGAS"
          },
          {
            "value": "1228",
            "label": "Eliana Maria Carranza Rojas"
          },
          {
            "value": "1111",
            "label": "ELKIN LARRARTE CASTILLO"
          },
          {
            "value": "1152",
            "label": "ELKIN ROLANDO ORJUELA CADENA"
          },
          {
            "value": "1310",
            "label": "Erika Noritsu Joya Navas"
          },
          {
            "value": "1075",
            "label": "Erika Tatiana Murgas Manosalva"
          },
          {
            "value": "1179",
            "label": "Fabian Buitrago"
          },
          {
            "value": "1295",
            "label": "Fabian Enrique Castillo"
          },
          {
            "value": "1223",
            "label": "Fabian Vidal Anaya"
          },
          {
            "value": "1319",
            "label": "Fabio Ocampo"
          },
          {
            "value": "1294",
            "label": "Felipe Villalobos cruz"
          },
          {
            "value": "1106",
            "label": "FELIX ANTONIO ZAMBRANO MARTINEZ"
          },
          {
            "value": "1257",
            "label": "Fernando Javier Cardenas Alonso"
          },
          {
            "value": "1088",
            "label": "FRANCISCO ELIECER HOYOS GIRALDO"
          },
          {
            "value": "1090",
            "label": "FRANCISCO JAVIER MATIZ CHICA"
          },
          {
            "value": "1197",
            "label": "Franklin Berdugo Alvarez"
          },
          {
            "value": "1200",
            "label": "Freddy Sanabria Hernandez"
          },
          {
            "value": "1175",
            "label": "Gabriel Caicedo"
          },
          {
            "value": "1124",
            "label": "GABRIEL EDUARDO NIEBLES CASTRO"
          },
          {
            "value": "1227",
            "label": "Gabriel Mesa"
          },
          {
            "value": "1318",
            "label": "geovanny bombiela"
          },
          {
            "value": "1168",
            "label": "Geraldine Suarez Rodriguez"
          },
          {
            "value": "1225",
            "label": "German Andres Pardo Gonzalez"
          },
          {
            "value": "1269",
            "label": "German Augusto Tellez Parra"
          },
          {
            "value": "1286",
            "label": "Gloria Bibiana Miranda Duarte"
          },
          {
            "value": "1307",
            "label": "Gonzalo Castaneda Osorio"
          },
          {
            "value": "1237",
            "label": "Guillermo Puche"
          },
          {
            "value": "1187",
            "label": "Gustavo Adolfo Mendoza"
          },
          {
            "value": "1324",
            "label": "Hector David Calderon Sepulveda"
          },
          {
            "value": "1259",
            "label": "Heidy Viviana Celis Monroy"
          },
          {
            "value": "1314",
            "label": "Helber Melo"
          },
          {
            "value": "1141",
            "label": "HENRY ANTONIO MONTAÑEZ CARO"
          },
          {
            "value": "1176",
            "label": "Herling Florián"
          },
          {
            "value": "1240",
            "label": "Hilber Arley Moreno Guerrero"
          },
          {
            "value": "1113",
            "label": "HUGO ALBERTO GARCIA GARCIA"
          },
          {
            "value": "1097",
            "label": "IGNACIO JOSE GOMEZ BELTRAN"
          },
          {
            "value": "1296",
            "label": "Isvelitza Coromoto Montilla Bastidas"
          },
          {
            "value": "1261",
            "label": "Ivan Andres Paez Celis"
          },
          {
            "value": "1272",
            "label": "Ivan Augusto Martinez Lopez"
          },
          {
            "value": "1092",
            "label": "JAIME DAVID ORDOÑEZ GIL"
          },
          {
            "value": "1226",
            "label": "Jaiver Garcia Bernal"
          },
          {
            "value": "1128",
            "label": "JANUARIO BARBOSA RIVERA"
          },
          {
            "value": "1138",
            "label": "JAVIER AMADO DELGADO"
          },
          {
            "value": "1285",
            "label": "Jennyfer Ximena Rincon Vega"
          },
          {
            "value": "1323",
            "label": "Jessica Liliana Guarin Ayala"
          },
          {
            "value": "1315",
            "label": "Jessica Real Palacios"
          },
          {
            "value": "1195",
            "label": "Jesus Danilo Saldana Montero"
          },
          {
            "value": "1244",
            "label": "Jhon Alexander Cuervo Barragan"
          },
          {
            "value": "1178",
            "label": "Jhon Fabianny Mercado"
          },
          {
            "value": "1246",
            "label": "Jhon Ussa Gil"
          },
          {
            "value": "1253",
            "label": "Jhonatan Alberto Mino Jacome"
          },
          {
            "value": "1320",
            "label": "Jhonatan Andres Garcia Orjuela"
          },
          {
            "value": "1302",
            "label": "Johan Sebastian Romero Pena"
          },
          {
            "value": "1095",
            "label": "JOHN ALEJANDRO MESA AYURE"
          },
          {
            "value": "1221",
            "label": "John Helber Mejia Vargas"
          },
          {
            "value": "1081",
            "label": "JOHN JAIRO CRUZ LEMUS"
          },
          {
            "value": "1273",
            "label": "John Jairo Ovalle"
          },
          {
            "value": "1279",
            "label": "John Mauro Pacheco Molano"
          },
          {
            "value": "1258",
            "label": "Jorge Andres Ramirez Gomez"
          },
          {
            "value": "1084",
            "label": "JORGE ANTONIO MONSALVE SANCHEZ"
          },
          {
            "value": "1220",
            "label": "Jorge Eduardo Gutierrez Serna"
          },
          {
            "value": "1127",
            "label": "JORGE LUIS ARANGO QUINTERO"
          },
          {
            "value": "1131",
            "label": "JORGE RAMIRO TORRADO RINCON"
          },
          {
            "value": "1160",
            "label": "Jorge Suarez Stevenson"
          },
          {
            "value": "1290",
            "label": "Jose Alejandro Alzate Giraldo"
          },
          {
            "value": "1242",
            "label": "Jose Daniel Bohorquez Parrales"
          },
          {
            "value": "1254",
            "label": "Jose David Farias Pinzon"
          },
          {
            "value": "1191",
            "label": "Jose Efrain Forero Santamaria"
          },
          {
            "value": "1112",
            "label": "JOSE FERNANDO CHAPARRO TIVABIJA"
          },
          {
            "value": "1100",
            "label": "JOSE IGNACIO HINCAPIE MUÑOZ"
          },
          {
            "value": "1203",
            "label": "Jose Joaquin Vega Vega"
          },
          {
            "value": "1327",
            "label": "Josefa Duque"
          },
          {
            "value": "1194",
            "label": "Juan Camilo Fuentes Vallejo"
          },
          {
            "value": "1155",
            "label": "JUAN CARLOS ANGULO CARDONA"
          },
          {
            "value": "1196",
            "label": "Juan Carlos Cardenas Beleño"
          },
          {
            "value": "1120",
            "label": "JUAN DIEGO COLONIA OSPINA"
          },
          {
            "value": "1139",
            "label": "JUAN FERNANDO LANZZIANO MELO"
          },
          {
            "value": "1201",
            "label": "Juan Jose Morales Gaona"
          },
          {
            "value": "1157",
            "label": "JUAN MANUEL PADILLA CEPEDA"
          },
          {
            "value": "1144",
            "label": "JUAN OLIVER VEGA DUQUE"
          },
          {
            "value": "1205",
            "label": "Julian David Gomez Martinez"
          },
          {
            "value": "1114",
            "label": "JULIAN JAVIER CORRALES COBOS"
          },
          {
            "value": "1224",
            "label": "Julio Alexander Cordoba Fonseca"
          },
          {
            "value": "1238",
            "label": "Julio Cesar Jurado"
          },
          {
            "value": "1322",
            "label": "Karen Andrea Oidor Pajoy"
          },
          {
            "value": "1126",
            "label": "KEVIN ORLANDO CORENA ACOSTA"
          },
          {
            "value": "1280",
            "label": "Laura Marcela Suarez Barreto"
          },
          {
            "value": "1266",
            "label": "Laura Natalia Gomez Amaya"
          },
          {
            "value": "1153",
            "label": "LEONARDO CHAPARRO ZAMORA"
          },
          {
            "value": "1306",
            "label": "Leonardo Romero Catano"
          },
          {
            "value": "1282",
            "label": "Leopoldo Roa Daza"
          },
          {
            "value": "1159",
            "label": "LILIAN DE LA TORRE BALLESTEROS"
          },
          {
            "value": "1073",
            "label": "Liliana Medina Martinez"
          },
          {
            "value": "1149",
            "label": "LINA ALEJANDRA VELASCO ARCOS"
          },
          {
            "value": "1270",
            "label": "Lina Maria Paez Otero"
          },
          {
            "value": "1148",
            "label": "LOIDA ESTHER MONTES PEREZ"
          },
          {
            "value": "1239",
            "label": "Lucas Jaramillo Castano"
          },
          {
            "value": "1183",
            "label": "Luis Alejandro Ortega"
          },
          {
            "value": "1216",
            "label": "Luis Carlos Gomes Caceres Echavez"
          },
          {
            "value": "1274",
            "label": "Luis Eduardo Perez"
          },
          {
            "value": "1326",
            "label": "Luis Oscar Carrasquilla"
          },
          {
            "value": "1297",
            "label": "Manuel Alejandro Botía Díaz"
          },
          {
            "value": "1177",
            "label": "Maria Alejandra Duarte Velandia"
          },
          {
            "value": "1300",
            "label": "Maria Camila Calderon Bohorquez"
          },
          {
            "value": "1304",
            "label": "Maria Claudia Gallego Pinedo"
          },
          {
            "value": "1316",
            "label": "Maria Fernanda Iles Ruiz"
          },
          {
            "value": "1082",
            "label": "MARIA FERNANDA TAMAYO FLOREZ"
          },
          {
            "value": "1317",
            "label": "maria paulina gonzalez"
          },
          {
            "value": "1182",
            "label": "Mario Becerra"
          },
          {
            "value": "1291",
            "label": "Mario Garcia Buitrago"
          },
          {
            "value": "1278",
            "label": "Mario Raul Cely Verdugo"
          },
          {
            "value": "1230",
            "label": "Mario Torres Silva"
          },
          {
            "value": "1303",
            "label": "Marlon Andres Mazo"
          },
          {
            "value": "1256",
            "label": "Marlon Jose Pabon Meneses"
          },
          {
            "value": "1167",
            "label": "Martha Herrera Ochoa"
          },
          {
            "value": "1121",
            "label": "MAURICIO SANDOVAL ESCOBAR"
          },
          {
            "value": "1277",
            "label": "Mauro Andres Fernandez Morelo"
          },
          {
            "value": "1271",
            "label": "Miguel Arturo Bautista Garcia"
          },
          {
            "value": "1202",
            "label": "Milton Escobar"
          },
          {
            "value": "1287",
            "label": "Nancy Enerieht López García"
          },
          {
            "value": "1134",
            "label": "NATALIA CHAVEZ GARCIA"
          },
          {
            "value": "1217",
            "label": "Nelson Armando Rojas Serrano"
          },
          {
            "value": "1086",
            "label": "NICOLAS SANTIAGO RIVERA MONTOYA"
          },
          {
            "value": "1268",
            "label": "Nicolas Sebastian Yascual Erazo"
          },
          {
            "value": "1208",
            "label": "Nixon Javier Amaya"
          },
          {
            "value": "1117",
            "label": "ODILIO RIVERA MARQUEZ"
          },
          {
            "value": "1093",
            "label": "OLFER ALEXIS LEON BARBOSA"
          },
          {
            "value": "1265",
            "label": "Omar Augusto Vargas Nomesque"
          },
          {
            "value": "1232",
            "label": "Omar Elias Carreno"
          },
          {
            "value": "1233",
            "label": "Oscar Fernando Carvajal Leon"
          },
          {
            "value": "1209",
            "label": "Oscar Julian Olmos Solanilla"
          },
          {
            "value": "1210",
            "label": "Oswlado Antonio Florez Camargo"
          },
          {
            "value": "1135",
            "label": "PABLO ENRIQUE SIERRA SIERRA"
          },
          {
            "value": "1222",
            "label": "Pablo Javier Reyes Zipa"
          },
          {
            "value": "1260",
            "label": "Paola Rodriguez Chia"
          },
          {
            "value": "1110",
            "label": "PEDRO FABIAN LAGUADO"
          },
          {
            "value": "1211",
            "label": "Pedro Jose Heredia Pulido"
          },
          {
            "value": "1199",
            "label": "Raul Bernardo Rodriguez Toca"
          },
          {
            "value": "1189",
            "label": "REY ENRIQUE RAMIREZ"
          },
          {
            "value": "1255",
            "label": "Roky Gomez Ardila"
          },
          {
            "value": "1154",
            "label": "RONIEE PADILLA BURGOS"
          },
          {
            "value": "1150",
            "label": "ROSEMERY CARRILLO SANTIS"
          },
          {
            "value": "1264",
            "label": "Samuel Tarache Cantor"
          },
          {
            "value": "1147",
            "label": "SANDRA PATRICIA WILCHES PEÑA"
          },
          {
            "value": "1321",
            "label": "Sebastian Tirado Diaz"
          },
          {
            "value": "1083",
            "label": "SILVIO ANDRES AGUDELO PUERTA"
          },
          {
            "value": "1116",
            "label": "SIMON IVAN AVILA DIAZ"
          },
          {
            "value": "1173",
            "label": "Soporte Amatia"
          },
          {
            "value": "1",
            "label": "Super Admin"
          },
          {
            "value": "158",
            "label": "Super Admin"
          },
          {
            "value": "1329",
            "label": "test_basic basic"
          },
          {
            "value": "1215",
            "label": "Tito Cardenas"
          },
          {
            "value": "1186",
            "label": "Tomas Enrique Carroll"
          },
          {
            "value": "1158",
            "label": "VICTOR HUGO GUTIERREZ LEIVA"
          },
          {
            "value": "1235",
            "label": "Victor Manuel Bertel Larios"
          },
          {
            "value": "1247",
            "label": "Vladimir Castro Leon"
          },
          {
            "value": "1192",
            "label": "Vladimir Cordoba"
          },
          {
            "value": "1098",
            "label": "WALTER GASTELBONDO BARRAGAN"
          },
          {
            "value": "1245",
            "label": "Walther Augusto Castellanos Uribe"
          },
          {
            "value": "1108",
            "label": "WILLIAM PEÑARANDA"
          },
          {
            "value": "1125",
            "label": "WILLIAM RICARDO OICATA BENITEZ"
          },
          {
            "value": "1109",
            "label": "WILMER CALDERON PIEDRAHITA"
          },
          {
            "value": "1096",
            "label": "WILSON CASTILLO FANDINO"
          },
          {
            "value": "1298",
            "label": "Yeraldine Castaneda Morales"
          },
          {
            "value": "1299",
            "label": "Yesenia Vasquez Cardenas"
          },
          {
            "value": "1243",
            "label": "Yeyson Alveiro Lopez Hernandez"
          },
          {
            "value": "1263",
            "label": "Yudi Karin Aguilera Moreno"
          },
          {
            "value": "1143",
            "label": "YURI RAFAEL CAPARROSO GRIMALDI"
          }
        ]
      },
      "id_alert": {
        "label": "Aplicar Alerta",
        "type": "dropdown",
        "required": true,
        "name": "id_alert",
        "default_value": "",
        "gridSize": "12",
        "options": [
          {
            "value": "189",
            "label": "Alerta de Pruebas"
          },
          {
            "value": "192",
            "label": "Alerta pruebas II"
          },
          {
            "value": "188",
            "label": "Obligaciones 180-90-30"
          },
          {
            "value": "184",
            "label": "Obligaciones 30-20-10 dias"
          },
          {
            "value": "185",
            "label": "Obligaciones 45-30-10"
          },
          {
            "value": "186",
            "label": "Obligaciones 60-30-20"
          },
          {
            "value": "187",
            "label": "Obligaciones 75-45-20"
          },
          {
            "value": "182",
            "label": "Obligaciones con cierre a 10 días"
          },
          {
            "value": "20",
            "label": "Obligaciones con cierre a 15 días"
          },
          {
            "value": "183",
            "label": "Obligaciones con cierre a 20 días"
          },
          {
            "value": "3",
            "label": "Obligaciones con cierre a 30 días"
          },
          {
            "value": "2",
            "label": "Obligaciones con cierre a 60 días"
          },
          {
            "value": "1",
            "label": "Obligaciones con cierre a 90 días"
          },
          {
            "value": "193",
            "label": "obligaciones de 3 a 5"
          },
          {
            "value": "191",
            "label": "Vigencia Acciones"
          },
          {
            "value": "190",
            "label": "Vigencia Requisitos Legales"
          }
        ]
      },
      "contractor": {
        "label": "Contratista",
        "type": "dropdown",
        "required": true,
        "name": "contractor",
        "default_value": "",
        "gridSize": "12",
        "options": [
          {
            "value": "17",
            "label": "ACD CONSULTORES"
          },
          {
            "value": "52",
            "label": "ADEA ADMINISTRADORA DE ARCHIVOS SAS"
          },
          {
            "value": "31",
            "label": "BOMBAS Y MONTAJES S.A.S. ANTES"
          },
          {
            "value": "5",
            "label": "C & P CONSTRUCCIONES Y PROYECTOS"
          },
          {
            "value": "44",
            "label": "CASALIMPIA S.A."
          },
          {
            "value": "24",
            "label": "CENIT TRANSPORTE Y LOGISTICA DE HID"
          },
          {
            "value": "33",
            "label": "CILAM GRUPO EMPRESARIAL SAS"
          },
          {
            "value": "21",
            "label": "CIVALCO LTDA."
          },
          {
            "value": "49",
            "label": "CONSORCIO FIBRA OPTICA 2019"
          },
          {
            "value": "50",
            "label": "CONSORCIO MONOBUOY-CIS 2019"
          },
          {
            "value": "53",
            "label": "CONSORCIO SKF-OMIA"
          },
          {
            "value": "3",
            "label": "CONSTRUCCIONES Y ALQUILER DE EQUIPOS LA ROCA"
          },
          {
            "value": "43",
            "label": "Corporación Antioquia Presente"
          },
          {
            "value": "23",
            "label": "DATEXCO COMPANY SA"
          },
          {
            "value": "9",
            "label": "DEL VALLE MORA SAS"
          },
          {
            "value": "4",
            "label": "ECOLOGIC SAS"
          },
          {
            "value": "55",
            "label": "ECOPETROL-EMPRESA COLOMBIANA DE PET"
          },
          {
            "value": "12",
            "label": "EDP SOLUCIONES SAS"
          },
          {
            "value": "20",
            "label": "ESTUDIOS TECNICOS S.A.S."
          },
          {
            "value": "25",
            "label": "FUNDACION OLEODUCTOS DE COLOMBIA"
          },
          {
            "value": "34",
            "label": "GEOCIVILES SAS"
          },
          {
            "value": "18",
            "label": "GERMAN PLAZAS Y ABOGADOS ASOCIADOS"
          },
          {
            "value": "11",
            "label": "GRADEX INGENIERIA S A"
          },
          {
            "value": "48",
            "label": "HIDROPROB S A"
          },
          {
            "value": "30",
            "label": "ISMOCOL S A"
          },
          {
            "value": "14",
            "label": "JASMAR SAS"
          },
          {
            "value": "46",
            "label": "KNO ENVIRONMENTAL SOLUTIONS LTDA"
          },
          {
            "value": "15",
            "label": "L&C MULTISERVICIOS Y CONSULTORIAS S"
          },
          {
            "value": "8",
            "label": "MANTEMAR LTDA."
          },
          {
            "value": "29",
            "label": "MASSY ENERGY COLOMBIA S A S ANTES"
          },
          {
            "value": "13",
            "label": "MCS CONSULTORIA Y MONITOREO AMBIEN"
          },
          {
            "value": "32",
            "label": "MEYAN SA"
          },
          {
            "value": "37",
            "label": "MONTAJES JM LTDA."
          },
          {
            "value": "56",
            "label": "MUNICIPIO DE FLORIAN"
          },
          {
            "value": "19",
            "label": "MUNICIPIO DE PUERTO BOYACA"
          },
          {
            "value": "38",
            "label": "OIL BUSINESS SERVICES SAS"
          },
          {
            "value": "28",
            "label": "OIL SPILL RESPONSE USA INC ANTES"
          },
          {
            "value": "54",
            "label": "OPERACION Y MANTENIMIENTO INTEGRAL"
          },
          {
            "value": "22",
            "label": "PATRIMONIOS AUTONOMOS FIDUCIARIA"
          },
          {
            "value": "35",
            "label": "PETROINCO SAS"
          },
          {
            "value": "6",
            "label": "PROSPERAR ILB SAS"
          },
          {
            "value": "41",
            "label": "PS INTERNATIONAL SAS ANTES PSI SAS"
          },
          {
            "value": "39",
            "label": "QMG SSS OBRAS CIVILES"
          },
          {
            "value": "40",
            "label": "QMG SSS OBRAS CIVILES ESTACION"
          },
          {
            "value": "7",
            "label": "QUINONEZ MORENO GONZALEZ LTDA"
          },
          {
            "value": "10",
            "label": "SERVICIOS ABC SAS ANTES SERVICIOS"
          },
          {
            "value": "51",
            "label": "SERVICIOS PORTUARIOS S.A.S"
          },
          {
            "value": "2",
            "label": "SERVICIOS Y SUMINISTROS DE SUCRE SA"
          },
          {
            "value": "1",
            "label": "SERVICONTA LTDA Y/O SUMINISTROS"
          },
          {
            "value": "47",
            "label": "TECNICONTROL SAS ANTES"
          },
          {
            "value": "26",
            "label": "TECNOLOGIAS AMBIENTALES DE COLOMBIA"
          },
          {
            "value": "36",
            "label": "TERMOTECNICA COINDUSTRIAL SAS"
          },
          {
            "value": "42",
            "label": "TRANSPORTADORA DE GAS INTERNACIONAL"
          },
          {
            "value": "16",
            "label": "UNION TEMPORAL IM"
          },
          {
            "value": "57",
            "label": "UNYDOS CONSULTING S.A.S."
          },
          {
            "value": "45",
            "label": "VQ INGENIERIA S A S ANTES"
          },
          {
            "value": "27",
            "label": "WORKING SERVICES SAS"
          }
        ]
      }
    }
  }
};

export const fetchActionFormFields = createAsyncThunk(
  'actions/action_form',
  async (formData = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/message_center_api/action_api/action_form');
      
      // Usar respuesta provisional en lugar de la respuesta real de la API
      //return response?.data;
      return provisionalResponse;
      
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchActionFormFieldsSlice = createSlice({
  name: 'fetchActionFormFields',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchActionFormFields.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchActionFormFields.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(fetchActionFormFields.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default fetchActionFormFieldsSlice.reducer;
