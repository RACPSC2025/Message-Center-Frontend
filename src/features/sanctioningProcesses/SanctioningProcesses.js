import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Add, Description, Assignment } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import SanctioningStatsList from './components/SanctioningStatsList';
import SanctioningProcessesTable from './components/SanctioningProcessesTable';
import SanctioningProcessesDrawer from './components/SanctioningProcessesDrawer';
import { fetchSanctioningProcessesTableHeaders } from '../../stores/sanctioningProcesses/fetchSanctioningProcessesTableHeadersSlice';

import { statsData } from './data';
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

      if (column_type === 'number') {
        columnProps.type = 'number';
      }

      if (column_type === 'status') {
        columnProps.cellClass = 'font-semibold';
      }

      return columnProps;
    });
  };

  useEffect(() => {
    dispatch(fetchSanctioningProcessesTableHeaders(i18n.language || 'es'));
  }, [dispatch, i18n.language]);

  useEffect(() => {
    if (headersResponse?.messages === 'Success') {
      const tableData = headersResponse?.data ?? {};
      const config = Object.keys(tableData?.headers || {})
        .map((columnKey) => tableData?.headers[columnKey])
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const columnConfig = modifyTableColumns(config);
      const visibleByDefault = columnConfig
        .filter((column) => column.display_in_table)
        .map((column) => column.field);

      setTableColumnConfig(columnConfig);
      setInitialVisibleFields(visibleByDefault);
    }
  }, [headersResponse, i18n.language]);

  return (
    <Box sx={{ width: '100%', minHeight: 'calc(100vh - 120px)', bgcolor: '#f8f9fa', p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          sx={{
            fontSize: '0.875rem',
            color: '#6c757d',
            mb: 0.5,
            fontWeight: 500
          }}
        >
          Módulo de Control
        </Typography>

        <Typography
          variant="h4"
          sx={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#212529',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}
        >
          Procesos Sancionatorios
        </Typography>
      </Box>
      
      {/* Estadísticas */}
      <SanctioningStatsList
        stats={statsData}
        spacing={3}
        columns={{ xs: 12, md: 4 }}
      />

      {/* Tabla de Procesos Sancionatorios */}
      <SanctioningProcessesTable
        data={sanctioningProcessesTableData?.data?.items || []}
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