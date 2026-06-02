import { useMemo, useRef } from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import { AllCommunityModule, ClientSideRowModelModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import CloseIcon from '@mui/icons-material/Close';

// Register AG Grid modules
ModuleRegistry.registerModules([AllCommunityModule, ClientSideRowModelModule]);

const ActionsDrawer = ({ open, finding, onClose }) => {
  const gridRef = useRef();

  const columnDefs = useMemo(
    () => [
      {
        headerName: 'Opciones',
        field: 'opciones',
        pinned: 'left',
        width: 100,
        sortable: false,
        filter: false
      },
      { headerName: 'ID', field: 'id', width: 80, filter: false },
      { headerName: 'Categoría de la acción', field: 'categoria', width: 180 },
      { headerName: 'Fecha de inicio', field: 'fecha_inicio', width: 140 },
      { headerName: 'Fecha propuesta de cierre', field: 'fecha_cierre', width: 160 },
      { headerName: 'Estado de la acción', field: 'estado', width: 150 },
      { headerName: 'Responsable', field: 'responsable', width: 150 },
      { headerName: 'Revisor', field: 'revisor', width: 150 }
    ],
    []
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true
    }),
    []
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 900,
          maxWidth: '95vw',
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Acciones del hallazgo
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || 'Sin fuente'} - ID: {finding?.id}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        <Box
          className="ag-theme-alpine"
          sx={{
            width: '100%',
            height: '100%',
            minHeight: 400
          }}
        >
          <AgGridReact
            ref={gridRef}
            rowData={[]}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            domLayout="normal"
            animateRows
          />
        </Box>
      </Box>
    </Drawer>
  );
};

export default ActionsDrawer;
