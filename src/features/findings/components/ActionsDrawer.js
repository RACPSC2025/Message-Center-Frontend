import { useMemo, useState, useCallback } from 'react';
import { Drawer, Box, IconButton, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import TableComponent from '../../../components/TableComponent';
import FormBuilder from '../../../components/FormBuilder';
import UnsavedChangesDialog from '../../../components/UnsavedChangesDialog';
import useUnsavedChangesDrawer from '../hooks/useUnsavedChangesDrawer';

const ActionsDrawer = ({ open, finding, onClose }) => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [closeIntent, setCloseIntent] = useState(null);

  const {
    formValues: formData,
    showConfirm,
    setShowConfirm,
    hasUnsavedChanges,
    handleChange: handleFormChange,
    resetForm
  } = useUnsavedChangesDrawer({ initialValues: {}, onClose });

  const handleDrawerClose = useCallback(() => {
    if (hasUnsavedChanges()) {
      setCloseIntent('drawer');
      setShowConfirm(true);
    } else {
      resetForm();
      onClose();
    }
  }, [hasUnsavedChanges, resetForm, onClose]);

  const handleBackFromForm = useCallback(() => {
    if (hasUnsavedChanges()) {
      setCloseIntent('form');
      setShowConfirm(true);
    } else {
      resetForm();
      setShowForm(false);
    }
  }, [hasUnsavedChanges, resetForm]);

  const confirmUnsavedClose = useCallback(() => {
    setShowConfirm(false);
    resetForm();
    if (closeIntent === 'drawer') {
      onClose();
    } else {
      setShowForm(false);
    }
  }, [closeIntent, resetForm, onClose]);

  const cancelUnsavedClose = useCallback(() => {
    setShowConfirm(false);
  }, []);

  const handleSaveAction = () => {
    console.log('[DEBUG] Crear acción:', { ...formData, findingId: finding?.id });
    resetForm();
    setShowForm(false);
  };

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

  const formFields = [
    { id: 'fecha_creacion', label: 'Fecha de creación', type: 'date', gridSize: 6 },
    { id: 'fecha_cierre_real', label: 'Fecha real de cierre', type: 'date', gridSize: 6 },

    { id: 'pais', label: 'País', type: 'dropdown', options: [], gridSize: 4 },
    { id: 'empresa', label: 'Empresa', type: 'dropdown', options: [], gridSize: 4 },
    {
      id: 'departamento_provincia',
      label: 'Departamento/Provincia',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    {
      id: 'ciudad_municipio',
      label: 'Ciudad/Municipio',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    {
      id: 'distrito_sede_estacion',
      label: 'Distrito/Sede/Estación',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    { id: 'gerencia', label: 'Gerencia', type: 'dropdown', options: [], gridSize: 4 },
    {
      id: 'area_dependencia',
      label: 'Área/Dependencia',
      type: 'dropdown',
      options: [],
      gridSize: 6
    },

    { id: 'proceso', label: 'Proceso', type: 'dropdown', options: [], gridSize: 6 },

    { id: 'contratistas', label: 'Contratistas', type: 'dropdown', options: [], gridSize: 6 },
    { id: 'contrato', label: 'Contrato', type: 'dropdown', options: [], gridSize: 6 },

    {
      id: 'categoria',
      label: 'Categoría de la acción',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    {
      id: 'estado',
      label: 'Estado',
      type: 'dropdown',
      options: [],
      defaultValue: 'abierta',
      gridSize: 4
    },
    { id: 'tipo_analisis', label: 'Tipo de Análisis', type: 'dropdown', options: [], gridSize: 4 },

    {
      id: 'que_accion',
      label: 'Qué Acción a tomar',
      type: 'textarea',
      required: true,
      gridSize: 12
    },
    {
      id: 'como_sugerencia',
      label: 'Cómo Sugerencia de ejecución',
      type: 'textarea',
      required: true,
      gridSize: 12
    },

    {
      id: 'fecha_prevista_inicio',
      label: 'Fecha prevista de inicio',
      type: 'date',
      required: true,
      gridSize: 4
    },
    {
      id: 'empresa_ejecucion',
      label: 'Empresa Grupo Promigas (Ejecución)',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    {
      id: 'responsable_ejecucion',
      label: 'Responsable de ejecución',
      type: 'text',
      gridSize: 4
    },

    {
      id: 'fecha_propuesta_cierre',
      label: 'Fecha propuesta de cierre',
      type: 'date',
      required: true,
      gridSize: 4
    },
    {
      id: 'empresa_revision',
      label: 'Empresa Grupo Promigas (Revisión)',
      type: 'dropdown',
      options: [],
      gridSize: 4
    },
    { id: 'responsable_revision', label: 'Responsable de revisión', type: 'text', gridSize: 4 }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDrawerClose}
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
        {/* Titulo */}
        <Typography variant="h6" fontWeight={600}>
          {showForm ? 'Nueva acción' : 'Acciones del hallazgo'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleDrawerClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Fuente y ID */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || 'Sin fuente'} - ID: {finding?.id}
        </Typography>
      </Box>

      {/* Contenido */}
      <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', p: 2.5 }}>
        {showForm ? (
          <>
            {/* Botón volver */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Button
                variant="text"
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={handleBackFromForm}
                sx={{ textTransform: 'none' }}
              >
                Volver a la lista
              </Button>
            </Box>

            {/* Formulario */}
            <FormBuilder
              inputFields={formFields}
              initialValues={formData}
              controlled={true}
              onChange={handleFormChange}
              successCallback={handleSaveAction}
              cancelCallback={handleBackFromForm}
              formFieldSize="small"
            />
          </>
        ) : (
          <>
            {/* Botón crear acción */}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              sx={{ alignSelf: 'flex-end', mb: 2 }}
              onClick={() => setShowForm(true)}
            >
              Crear acción
            </Button>

            {/* Tabla de acciones */}
            <TableComponent
              rowData={[]}
              columnDefs={columnDefs}
              sortable
              filterable
              resizable
              pagination
              perPage={10}
            />
          </>
        )}
      </Box>

      {/* Dialogo de Salir sin guardar */}
      <UnsavedChangesDialog
        open={showConfirm}
        onClose={cancelUnsavedClose}
        onConfirm={confirmUnsavedClose}
        onCancel={cancelUnsavedClose}
      />
    </Drawer>
  );
};

export default ActionsDrawer;
