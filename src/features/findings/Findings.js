// src/components/Findings/index.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Drawer,
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';

import { fetchFindings, updateFinding } from '../../stores/findings/fetchFindingsSlice';
import { fetchFindingDetails, resetFindingDetails } from '../../stores/findings/fetchFindingDetailsSlice';
import { fetchFindingsOptions } from '../../stores/findings/fetchFindingsOptionsSlice';

import { 
  fetchTaskListLevel,
  resetLevel2AndBelow,
  resetLevel3AndBelow,
  resetLevel4AndBelow,
  resetLevel5
} from '../../stores/tasks/fetchFindingsListLevelSlice';

// CAMBIO: Importar tanto el componente principal como CompactPagination
import FindingsCardViewList, { CompactPagination } from './FindingsCardViewList';
import FindingsDrawer from './FindingsDrawer';

const Findings = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const { data: findings = [], loading = false, pagination = {} } = useSelector((state) => state.findings || {});
  const { data: dropdownOptions = {} } = useSelector((state) => state.findingsOptions || {});
  const { data: findingDetails, loading: detailsLoading } = useSelector((state) => state.findingDetails || {});
  const { 
    level1Options = [], 
    level2Options = [], 
    level3Options = [], 
    level4Options = [],
    level5Options = [],
    loading: levelsLoading = false
  } = useSelector((state) => state.taskListLevel || {});

  // Filtros state
  const [filters, setFilters] = useState({
    level1: '',
    level2: '',
    level3: '',
    level4: '',
    level5: '',
    status: '',
    finding_source: '',
    finding_type: '',
    date_from: '',
    date_to: '',
    reporting_person: '',
    company_who_report: '',
    texto: ''
  });

  // Paginación state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [drawerMode, setDrawerMode] = useState('view'); // 'view' o 'edit'
  const [initialTab, setInitialTab] = useState(0);

  // Cargar opciones iniciales
  useEffect(() => {
    dispatch(fetchFindingsOptions());
    dispatch(fetchTaskListLevel({ level: 1 }));
  }, [dispatch]);

  // Cargar findings cuando cambien los filtros o paginación
  useEffect(() => {
    const params = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };
    
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === '0' || params[key] === 0) {
        delete params[key];
      }
    });

    dispatch(fetchFindings(params));
  }, [dispatch, filters, currentPage, itemsPerPage]);

  // Cargar detalles cuando se selecciona un hallazgo
  useEffect(() => {
    if (selectedFinding && drawerOpen) {
      console.log('📋 Loading details for finding:', selectedFinding.id);
      dispatch(fetchFindingDetails(selectedFinding.id));
    }
  }, [selectedFinding, drawerOpen, dispatch]);

  const handleRefresh = () => {
    const params = {
      ...filters,
      page: currentPage,
      limit: itemsPerPage
    };
    
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === '0' || params[key] === 0) {
        delete params[key];
      }
    });

    dispatch(fetchFindings(params));
  };

  // Manejar cascada de niveles
  const handleLevel1Change = (value) => {
    setFilters(prev => ({
      ...prev,
      level1: value,
      level2: '',
      level3: '',
      level4: '',
      level5: ''
    }));
    
    dispatch(resetLevel2AndBelow());
    
    if (value) {
      dispatch(fetchTaskListLevel({ 
        level: 2, 
        formData: { id_level1: value } 
      }));
    }
    
    setCurrentPage(1);
  };

  const handleLevel2Change = (value) => {
    setFilters(prev => ({
      ...prev,
      level2: value,
      level3: '',
      level4: '',
      level5: ''
    }));
    
    dispatch(resetLevel3AndBelow());
    
    if (value && filters.level1) {
      dispatch(fetchTaskListLevel({ 
        level: 3, 
        formData: { 
          id_level1: filters.level1,
          id_level2: value 
        } 
      }));
    }
    
    setCurrentPage(1);
  };

  const handleLevel3Change = (value) => {
    setFilters(prev => ({
      ...prev,
      level3: value,
      level4: '',
      level5: ''
    }));
    
    dispatch(resetLevel4AndBelow());
    
    if (value && filters.level1 && filters.level2) {
      dispatch(fetchTaskListLevel({ 
        level: 4, 
        formData: { 
          id_level1: filters.level1,
          id_level2: filters.level2,
          id_level3: value 
        } 
      }));
    }
    
    setCurrentPage(1);
  };

  const handleLevel4Change = (value) => {
    setFilters(prev => ({
      ...prev,
      level4: value,
      level5: ''
    }));
    
    dispatch(resetLevel5());
    
    if (value && filters.level1 && filters.level2 && filters.level3) {
      dispatch(fetchTaskListLevel({ 
        level: 5, 
        formData: { 
          id_level1: filters.level1,
          id_level2: filters.level2,
          id_level3: filters.level3,
          id_level4: value 
        } 
      }));
    }
    
    setCurrentPage(1);
  };

  // Manejar cambio de filtro genérico
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setFilters({
      level1: '',
      level2: '',
      level3: '',
      level4: '',
      level5: '',
      status: '',
      finding_source: '',
      finding_type: '',
      date_from: '',
      date_to: '',
      reporting_person: '',
      company_who_report: '',
      texto: ''
    });
    setCurrentPage(1);
  };

  // Manejar clic en tarjeta
  /*
  const handleCardClick = (finding, action, tabIndex = 0) => { // NUEVO: aceptar tabIndex
    console.log('🎯 Card clicked:', finding.id, 'Action:', action, 'Tab:', tabIndex);
    
    if (action === 'delete') {
      if (window.confirm('¿Está seguro de eliminar este hallazgo?')) {
        console.log('🗑️ Eliminar hallazgo:', finding.id);
      }
      return;
    }

    if (action === 'settings') {
      console.log('⚙️ Configuración hallazgo:', finding.id);
      return;
    }

    setSelectedFinding(finding);
    setDrawerMode(action === 'edit' ? 'edit' : 'view');
    setInitialTab(tabIndex); // NUEVO: establecer tab inicial
    setDrawerOpen(true);
  };
  */

  const handleCardClick = (finding, action, tabIndex = 0) => {
    console.log('🎯 Card clicked:', finding.id, 'Action:', action, 'Tab:', tabIndex);
    
    if (action === 'delete') {
      if (window.confirm('¿Está seguro de eliminar este hallazgo?')) {
        console.log('🗑️ Eliminar hallazgo:', finding.id);
        // TODO: Implementar delete
      }
      return;
    }

    setSelectedFinding(finding);
    setDrawerMode(action); // 'view' o 'edit'
    setInitialTab(tabIndex);
    setDrawerOpen(true);
  };

  // NUEVO: Función para guardar cambios
  // En tu componente principal (index.jsx o donde esté handleSave)

  // Callback para recibir cambios del formulario
  const handleFormDataChange = (data) => {
    // data contiene: { allData, modifiedData, modifiedFields }
    setAllFormData(data.allData);
    setModifiedData(data.modifiedData);
    
    console.log('📝 Campos modificados:', data.modifiedFields);
    console.log('📦 Datos modificados:', data.modifiedData);
  };

  const handleSave = async (findingId, modifiedData) => {
    console.log('💾 Intentando guardar hallazgo:', findingId);
    console.log('📦 Datos modificados recibidos:', modifiedData);
    
    try {
      // Validación
      if (!modifiedData || Object.keys(modifiedData).length === 0) {
        alert('No hay cambios para guardar');
        return;
      }

      console.log('📋 Campos a actualizar:', Object.keys(modifiedData));
      
      // Preparar datos - usar solo los campos modificados
      const dataToUpdate = { ...modifiedData };

      // Manejo especial para finding_type = "4" (Otro)
      if (dataToUpdate.finding_type === '4' && dataToUpdate.finding_type_other) {
        dataToUpdate.finding_type = dataToUpdate.finding_type_other;
        delete dataToUpdate.finding_type_other;
      }

      // Log final de lo que se va a enviar
      console.log('🚀 Payload final a enviar:', dataToUpdate);

      // Dispatch de la acción
      const result = await dispatch(updateFinding({ 
        id: findingId, 
        data: dataToUpdate 
      })).unwrap();

      console.log('✅ Hallazgo actualizado exitosamente:', result);
      
      // Recargar la lista de hallazgos
      //await handleRefresh();
      
      // Cerrar el drawer
      //setDrawerOpen(false);
      //setSelectedFinding(null);
      
      // Mensaje de éxito
      //alert(`Hallazgo actualizado exitosamente. Se actualizaron ${Object.keys(dataToUpdate).length} campos.`);
      
    } catch (error) {
      console.error('❌ Error al actualizar hallazgo:', error);
      
      let errorMessage = 'Error al actualizar el hallazgo';
      if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
      throw error; // Re-throw para que el drawer lo maneje
    }
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedFinding(null);
    setDrawerMode('view');
    setInitialTab(0);
    dispatch(resetFindingDetails());
  };

  /*
  const handleSave = () => {
    const dataToUpdate = {
      finding_source: formData.finding_source,
      finding_type: formData.finding_type,
      reporting_person: formData.reporting_person,
      level1: formData.level1,
      level2: formData.level2,
      level3: formData.level3,
      level4: formData.level4,
      area_ocurrencia: formData.area_ocurrencia,
      gerencia_formulario: formData.gerencia_formulario,
      que_what: formData.que_what,
      que_when: formData.que_when,
      que_how_much: formData.que_how_much,
      que_which: formData.que_which,
      que_where: formData.que_where,
      brief_description: formData.brief_description,
      closure_date_required: formData.closure_date_required,
      closing_approval_responsible: formData.closing_approval_responsible,
      risk_controlled_by: formData.risk_controlled_by,
      people_notifly: formData.people_notifly,
      contractors: formData.contractors,
      contract: formData.contract
    };

    dispatch(updateFinding({ id: finding.id, data: dataToUpdate }));
  };
  */

  /*
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedFinding(null);
    setDrawerMode('view');
    setInitialTab(0); // NUEVO: resetear tab
    dispatch(resetFindingDetails());
  };
  */

  // Manejar cambio de página
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Manejar cambio de items por página
  const handleItemsPerPageChange = (event) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Drawer de Filtros */}
      <Drawer
        anchor="left"
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        variant="temporary"
        sx={{
          width: 300,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 300,
            boxSizing: 'border-box',
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Filtros</Typography>
          <IconButton onClick={() => setFilterOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Búsqueda de texto */}
        <TextField
          fullWidth
          label="Buscar en textos"
          variant="outlined"
          size="small"
          value={filters.texto}
          onChange={(e) => handleFilterChange('texto', e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: <SearchIcon />
          }}
        />

        {/* Filtros de niveles, estado, etc. */}
        {/* ... resto de filtros ... */}

        <Button
          fullWidth
          variant="outlined"
          onClick={handleClearFilters}
          sx={{ mt: 2 }}
        >
          Limpiar Filtros
        </Button>
      </Drawer>

      {/* Contenido Principal */}
      <Box sx={{ flexGrow: 1, p: 3 }}>
        {/* CAMBIO: Header con paginación integrada */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 3,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Typography variant="h4">Hallazgos</Typography>
          
          {/* NUEVO: Paginación y controles en el header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {/* Paginación compacta */}
            <CompactPagination
              currentPage={currentPage}
              totalPages={pagination.total_pages || 1}
              onPageChange={handlePageChange}
              onRefresh={handleRefresh}
            />
            
            {/* Items por página */}
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Items por página</InputLabel>
              <Select
                value={itemsPerPage}
                label="Items por página"
                onChange={handleItemsPerPageChange}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={20}>20</MenuItem>
                <MenuItem value={30}>30</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            
            {/* Botón de filtros */}
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={() => setFilterOpen(true)}
            >
              Filtros
            </Button>
          </Box>
        </Box>

        {/* Lista de hallazgos */}
        <FindingsCardViewList
          findings={findings}
          loading={loading}
          pagination={pagination}
          currentPage={currentPage}
          onCardClick={handleCardClick}
          onPageChange={handlePageChange}
          onRefresh={handleRefresh} 
        />
      </Box>

      {/* Drawer de Detalle/Edición */}
      <FindingsDrawer
        open={drawerOpen}
        onClose={handleCloseDrawer}
        finding={selectedFinding}
        findingDetails={findingDetails}
        loading={detailsLoading}
        mode={drawerMode}
        dropdownOptions={dropdownOptions}
        initialTab={initialTab}
        onSave={handleSave}
      />
    </Box>
  );
};

export default Findings;