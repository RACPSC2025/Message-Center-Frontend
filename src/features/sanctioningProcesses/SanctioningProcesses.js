import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import { Add, Description, Assignment } from '@mui/icons-material';

import { fetchSanctioningProcessesTableHeaders } from '../../stores/sanctioningProcesses/fetchSanctioningProcessesTableHeadersSlice';

import SpeedDialComponent from '../../components/SpeedDialComponent';

import SanctioningProcessesTable from './components/SanctioningProcessesTable';
import SanctioningProcessesDrawer from './components/SanctioningProcessesDrawer';

// TODO: Este es en archivo temporal, eliminar despues
import sanctioningProcessesTableData from './temp/sanctioningProcessesTableData.temp.json';

const tableHandlers = {
  handleRowClick: (row) => console.log('[DEBUG] Fila clickeada:', row),
  
  handleView: (row, setOpenDrawer, setSelectedProcess) => {
    console.log('[DEBUG] Ver:', row);
    setSelectedProcess(row);
    setOpenDrawer(true);
  },
  
  handleEdit: (row) => console.log('[DEBUG] Editar:', row),
  handleAttach: (row) => console.log('[DEBUG] Adjuntar:', row),
  handleRefresh: () => console.log('[DEBUG] Refrescando datos...')
};

// Configuración del SpeedDial
const speedDialActions = [
  {
    icon: <Description />,
    name: 'Nuevo Proceso Ambiental',
    action: 'ambiental'
  },
  {
    icon: <Assignment />,
    name: 'Nuevo Proceso Laboral',
    action: 'laboral'
  },
  {
    icon: <Add />,
    name: 'Otro Tipo de Proceso',
    action: 'otro'
  }
];

// Handler del SpeedDial
const handleActionClick = (actionData, setOpenSpeedDial) => {
  console.log('[DEBUG] Iniciando nuevo proceso:', actionData);
  
  // Extraer solo el action del objeto
  const action = actionData.action || actionData;
  
  switch(action) {
    case 'ambiental':
      console.log('[DEBUG] Abriendo formulario para proceso ambiental...');
      break;
    case 'laboral':
      console.log('[DEBUG] Abriendo formulario para proceso laboral...');
      break;
    case 'otro':
      console.log('[DEBUG] Abriendo formulario para otro tipo de proceso...');
      break;
    default:
      console.log('[DEBUG] Tipo de proceso no reconocido');
  }
  setOpenSpeedDial(false);
};

function SanctioningProcesses() {
  const { i18n } = useTranslation();

  const dispatch = useDispatch();

  const headersResponse = useSelector((state) => state?.sanctioningProcessesTableHeaders?.data || {});

  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);
  
  const [tableColumnConfig, setTableColumnConfig] = useState([]);
  const [initialVisibleFields, setInitialVisibleFields] = useState([]);

  const sanctioningRows = useMemo(() => {
    const items = sanctioningProcessesTableData?.data?.items || [];

    return items.map((item) => {
      const caseNumberAndContent =
        item?.CASE_NUMBER_AND_CONTENT_OF_RESPONSE || item?.colsubsidio_response || '';

      return {
        ...item,
        CASE_NUMBER_AND_CONTENT_OF_RESPONSE: caseNumberAndContent,
        colsubsidio_response: caseNumberAndContent
      };
    });
  }, []);

  const modifyTableColumns = (columnConfig = []) => {
    return columnConfig.map((config) => {
      const {
        column: field,
        title,
        title_es,
        title_en,
        column_width,
        edit,
        column_type,
        display_in_table,
        ...rest
      } = config;

      const headerName = i18n.language === 'en' ? (title_en || title) : (title_es || title);
      const width = column_width && column_width !== '' ? parseInt(column_width, 10) : undefined;

      const columnProps = {
        ...rest,
        field,
        headerName,
        width,
        editable: edit ?? false,
        display_in_table: Boolean(display_in_table),
        filter: true,
        sortable: true
      };

      if (column_type === 'number') columnProps.type = 'number';
      if (column_type === 'status') columnProps.cellClass = 'font-semibold';

      return columnProps;
    });
  };

  // Cargar encabezados
  useEffect(() => {
    dispatch(fetchSanctioningProcessesTableHeaders(i18n.language || 'es'));
  }, [dispatch, i18n.language]);
  
  // Transformar los datos crudos de la API en la configuración utilizada
  useEffect(() => {
    const tableData = headersResponse?.data ?? {};
    const headers = tableData?.headers ?? headersResponse?.headers ?? {};

    const hasSuccessMessage = headersResponse?.messages === 'Success';
    const hasUsableHeaders = headers && typeof headers === 'object' && Object.keys(headers).length > 0;

    if (hasSuccessMessage || hasUsableHeaders) {
      const config = Object.keys(headers)
        .map((columnKey) => headers[columnKey])
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const columnConfig = modifyTableColumns(config);
      const visibleByDefault = columnConfig
        .filter((column) => column.display_in_table)
        .map((column) => column.field);

      setTableColumnConfig(columnConfig);
      setInitialVisibleFields(visibleByDefault);
      return;
    }

    setTableColumnConfig([]);
    setInitialVisibleFields([]);
  }, [headersResponse, i18n.language]);

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 120px)', bgcolor: '#f8f9fa', p: 3 }}>
      
      {/* Tabla de Procesos Sancionatorios */}
      <SanctioningProcessesTable
        data={sanctioningRows}
        columnDefs={tableColumnConfig}
        initialVisibleFields={initialVisibleFields}
        paginationData={sanctioningProcessesTableData?.meta?.pagination}
        onRowClick={tableHandlers.handleRowClick}
        onView={(row) => tableHandlers.handleView(row, setOpenDrawer, setSelectedProcess)}
        onEdit={tableHandlers.handleEdit}
        onAttach={tableHandlers.handleAttach}
        onRefresh={tableHandlers.handleRefresh}
      />

      {/* (+) para iniciar nuevos procesos */}
      <SpeedDialComponent
        openSpeedDial={openSpeedDial}
        handleOpenSpeedDial={() => setOpenSpeedDial(true)}
        handleCloseSpeedDial={() => setOpenSpeedDial(false)}
        speedDialActions={speedDialActions}
        handleActionClick={(action) => handleActionClick(action, setOpenSpeedDial)}
      />

      {/* Drawer para ver detalles del proceso */}
      <SanctioningProcessesDrawer
        open={openDrawer}
        handleClose={() => setOpenDrawer(false)}
        selectedProcess={selectedProcess}
      />
    </Box>
  );
}

export default SanctioningProcesses;