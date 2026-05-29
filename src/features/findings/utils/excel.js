import ExcelJS from 'exceljs';

async function downloadWorkbook(workbook, filename) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadReporteExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Hallazgos');
  sheet.addRow([]);
  await downloadWorkbook(workbook, 'reporte_hallazgos.xlsx');
}

export async function downloadPlantillaExcel() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Plantilla');
  sheet.columns = [
    { header: 'Descripción', width: 40 },
    { header: 'Fuente', width: 20 },
    { header: 'Persona que reporta', width: 25 },
    { header: 'Estado', width: 15 },
    { header: 'Fecha', width: 15 }
  ];
  sheet.addRow([]);
  await downloadWorkbook(workbook, 'plantilla_hallazgos.xlsx');
}
