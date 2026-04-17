import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Add, Description, Assignment } from '@mui/icons-material';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import SanctioningStatsList from './components/SanctioningStatsList';
import SanctioningProcessesTable from './components/SanctioningProcessesTable';
import SanctioningProcessesDrawer from './components/SanctioningProcessesDrawer';

import { statsData, mockApiResponse } from './data';

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
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

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
        data={mockApiResponse.data.items}
        paginationData={mockApiResponse.meta.pagination}
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