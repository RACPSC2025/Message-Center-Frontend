/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const INPUT_FILE = process.argv[2] || path.resolve(process.cwd(), 'Procesos Sancionatorios Colsubsidio.xlsx');
const OUTPUT_FILE = path.resolve(
  process.cwd(),
  'src/features/sanctioningProcesses/temp/sanctioningProcessesTableData.temp.json'
);
const SHEET_NAME = 'Sancionatorios';
const HEADER_ROW_NUMBER = 4;
const DATA_START_ROW_NUMBER = 5;

const HEADER_MAP = {
  process_id: ['id proceso', 'process id', 'process_id', 'idproceso'],
  ues: ['ues'],
  sede: ['sede'],
  expediente: ['expediente'],
  autoridad: ['autoridad'],
  current_legal_phase: ['fase legal actual', 'current legal phase', 'current_legal_phase'],
  legal_phases_actions: [
    'fases legales - actuaciones',
    'fases legales actuaciones',
    'legal phases - actions',
    'legal_phases_actions'
  ],
  process_stage: ['etapa del proceso', 'process stage', 'process_stage'],
  cargo_description: ['cargo', 'cargo description', 'cargo_description'],
  tema: ['tema', 'topic'],
  colsubsidio_response: [
    'radicado y contenido de respuesta colsubsidio',
    'colsubsidio response',
    'colsubsidio_response'
  ],
  estrategia: ['estrategia', 'strategy'],
  estimated_sanction_amount: [
    'monto de la posible sancion (tasacion estimada)',
    'monto de la posible sancion',
    'estimated sanction amount',
    'estimated_sanction_amount'
  ]
};

function normalizeHeader(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/[()]/g, '');
}

function findColumnIndexes(headerRowValues) {
  const normalizedHeaders = headerRowValues.map((cellValue) => normalizeHeader(cellValue));
  const indexes = {};

  Object.keys(HEADER_MAP).forEach((targetField) => {
    const aliases = HEADER_MAP[targetField].map((alias) => normalizeHeader(alias));
    const index = normalizedHeaders.findIndex((header) => aliases.includes(header));

    if (index !== -1) {
      indexes[targetField] = index;
    }
  });

  return indexes;
}

function buildRows(sheetData, headerIndexes) {
  const items = [];

  for (let rowIndex = DATA_START_ROW_NUMBER - 1; rowIndex < sheetData.length; rowIndex += 1) {
    const row = sheetData[rowIndex] || [];

    const record = {
      id: items.length + 1
    };

    let hasSomeData = false;

    Object.keys(headerIndexes).forEach((field) => {
      const cellValue = row[headerIndexes[field]];
      const trimmedValue = typeof cellValue === 'string' ? cellValue.trim() : cellValue;

      if (trimmedValue !== undefined && trimmedValue !== null && trimmedValue !== '') {
        hasSomeData = true;
      }

      if (field === 'estimated_sanction_amount') {
        const numericValue = Number(String(trimmedValue || '').replace(/[^0-9.-]/g, ''));
        record[field] = Number.isFinite(numericValue) ? numericValue : 0;
      } else {
        record[field] = trimmedValue ?? '';
      }
    });

    if (!hasSomeData) {
      continue;
    }

    items.push(record);
  }

  return items;
}

function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    throw new Error(`Excel file not found: ${INPUT_FILE}`);
  }

  const workbook = XLSX.readFile(INPUT_FILE, { cellDates: false });
  const worksheet = workbook.Sheets[SHEET_NAME];

  if (!worksheet) {
    throw new Error(`Sheet not found: ${SHEET_NAME}`);
  }

  const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

  const headerRow = sheetData[HEADER_ROW_NUMBER - 1] || [];
  const headerIndexes = findColumnIndexes(headerRow);

  const requiredFields = [
    'process_id',
    'ues',
    'sede',
    'expediente',
    'autoridad',
    'current_legal_phase',
    'legal_phases_actions',
    'process_stage',
    'cargo_description',
    'tema',
    'colsubsidio_response',
    'estrategia',
    'estimated_sanction_amount'
  ];

  const missingFields = requiredFields.filter((field) => !(field in headerIndexes));

  if (missingFields.length) {
    throw new Error(`Missing expected headers in row ${HEADER_ROW_NUMBER}: ${missingFields.join(', ')}`);
  }

  const items = buildRows(sheetData, headerIndexes);

  const payload = {
    status: true,
    data: {
      items
    },
    meta: {
      pagination: {
        page: 1,
        page_size: 10,
        total_items: items.length,
        total_pages: Math.max(1, Math.ceil(items.length / 10))
      }
    }
  };

  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  console.log(`Generated ${items.length} rows at: ${OUTPUT_FILE}`);
}

main();
