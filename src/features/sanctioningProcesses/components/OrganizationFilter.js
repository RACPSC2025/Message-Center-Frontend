import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, FormControl, InputLabel, Select, MenuItem, useTheme } from '@mui/material';

// Mock de datos para simular endpoints
const mockLevelData = {
  1: [
    { value: '1', label: 'Negocio A' },
    { value: '2', label: 'Negocio B' },
    { value: '3', label: 'Negocio C' }
  ],
  2: [
    { value: '1', label: 'Compañía Alpha' },
    { value: '2', label: 'Compañía Beta' },
    { value: '3', label: 'Compañía Gamma' }
  ],
  3: [
    { value: '1', label: 'Región Norte' },
    { value: '2', label: 'Región Sur' },
    { value: '3', label: 'Región Centro' }
  ],
  4: [
    { value: '1', label: 'Ubicación 1' },
    { value: '2', label: 'Ubicación 2' },
    { value: '3', label: 'Ubicación 3' }
  ]
};

// Mock del hook useCascadingFilters
const useCascadingFiltersMock = ({ filterDefinitions, initialValues, onFilterChange }) => {
  const [filters, setFilters] = useState(
    filterDefinitions.map(def => ({
      ...def,
      value: initialValues[def.id] || '',
      options: [],
      isDisabled: def.id !== 'level1',
      isLoading: false
    }))
  );

  const resetFilters = () => {
    setFilters(filterDefinitions.map(def => ({
      ...def,
      value: '',
      options: [],
      isDisabled: def.id !== 'level1',
      isLoading: false
    })));
  };

  const handleFilterChange = (filterId, value) => {
    const newFilters = [...filters];
    const filterIndex = newFilters.findIndex(f => f.id === filterId);
    
    if (filterIndex !== -1) {
      newFilters[filterIndex].value = value;
      
      // Habilitar/deshabilitar filtros siguientes
      for (let i = filterIndex + 1; i < newFilters.length; i++) {
        newFilters[i].value = '';
        newFilters[i].options = [];
        newFilters[i].isDisabled = i !== filterIndex + 1 || !value;
      }
      
      // Cargar opciones del siguiente filtro si hay valor
      if (value && filterIndex < newFilters.length - 1) {
        const nextLevel = parseInt(filterId.replace('level', '')) + 1;
        setTimeout(() => {
          newFilters[filterIndex + 1].options = mockLevelData[nextLevel] || [];
          setFilters([...newFilters]);
        }, 300);
      }
    }
    
    setFilters(newFilters);
    
    const values = {};
    newFilters.forEach(filter => {
      if (filter.value) {
        values[filter.id] = filter.value;
      }
    });
    onFilterChange(values);
  };

  // Cargar opciones iniciales para level1
  useEffect(() => {
    if (filters.length > 0) {
      const newFilters = [...filters];
      newFilters[0].options = mockLevelData[1] || [];
      setFilters(newFilters);
    }
  }, []);

  return { filters, handleFilterChange, resetFilters };
};

// Mock de Redux selectors
const selectAppliedFilterModelMock = (state, module) => {
  return state?.filter?.[module] || {};
};

const setFilterMock = (payload) => {
  console.log('Mock setFilter:', payload);
  return { type: 'filter/setFilter', payload };
};

const removeFilterMock = (payload) => {
  console.log('Mock removeFilter:', payload);
  return { type: 'filter/removeFilter', payload };
};

const OrganizationFilter = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();

  // Obtener filtros actuales del store de Redux para el módulo de procesos sancionatorios
  const currentFilters = useSelector((state) => selectAppliedFilterModelMock(state, 'sanctioning_processes'));
  const [localFilterState, setLocalFilterState] = useState({});

  // Definir estructura de filtros
  const filterDefinitions = [
    {
      id: 'level1',
      label: t('Business')
    },
    {
      id: 'level2',
      label: t('Company')
    },
    {
      id: 'level3',
      label: t('Region')
    },
    {
      id: 'level4',
      label: t('Location')
    }
  ];

  // Extraer valores iniciales del store de Redux
  const getInitialValues = () => {
    const initialValues = {};
    filterDefinitions.forEach((filter) => {
      const reduxKey = `id_${filter.id}`;
      if (currentFilters[reduxKey]) {
        initialValues[filter.id] = currentFilters[reduxKey];
      }
    });
    return initialValues;
  };

  // Rastrear cambios y sincronizar con Redux
  const handleFilterChange = (values) => {
    const previousValues = { ...localFilterState };
    setLocalFilterState(values);

    // Agregar o actualizar filtros en Redux
    Object.entries(values).forEach(([key, value]) => {
      if (value && value !== previousValues[key]) {
        dispatch(setFilterMock({
          module: 'sanctioning_processes',
          updatedFilter: { [`id_${key}`]: value }
        }));
      }
    });

    // Eliminar filtros que fueron limpiados
    Object.entries(previousValues).forEach(([key, prevValue]) => {
      if (prevValue && (!values[key] || values[key] === '')) {
        dispatch(removeFilterMock({
          module: 'sanctioning_processes',
          fieldID: `id_${key}`
        }));
      }
    });
  };

  // Usar el hook mock con manejadores
  const {
    filters,
    handleFilterChange: internalHandleFilterChange,
    resetFilters
  } = useCascadingFiltersMock({
    filterDefinitions,
    initialValues: getInitialValues(),
    onFilterChange: handleFilterChange
  });

  // Manejar reinicio de filtros limpiando todos los filtros de organización
  const handleResetFilters = () => {
    resetFilters();

    // Eliminar todos los filtros de organización de Redux
    Object.keys(localFilterState).forEach((key) => {
      if (localFilterState[key]) {
        dispatch(removeFilterMock({
          module: 'sanctioning_processes',
          fieldID: `id_${key}`
        }));
      }
    });

    // Limpiar estado local
    setLocalFilterState({});
  };

  return (
    <>
      {/* Sección de filtros de organización */}
      {filters.map((filter) => (
        <FormControl key={filter.id} size="small" sx={{ minWidth: 140 }}>
          <InputLabel>{filter.label}</InputLabel>
          
          <Select
            value={filter.value}
            label={filter.label}
            disabled={filter.isDisabled}
            onChange={(e) => internalHandleFilterChange(filter.id, e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e6ed' },
              color: filter.value ? '#263238' : '#90a4ae',
              fontSize: '0.85rem'
            }}
          >
            <MenuItem value="">
              <span style={{ color: '#90a4ae' }}>Seleccionar...</span>
            </MenuItem>

            {filter.options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
      
      {/* Botón de limpiar filtros */}
      <Button 
        variant="outlined" 
        color="primary" 
        onClick={handleResetFilters}
        sx={{ 
          fontWeight: 600, 
          color: theme.palette.primary.main, 
          borderColor: `${theme.palette.primary.main}80`, 
          textTransform: 'none',
          px: 2,
          height: '40px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          '&:hover': { 
            borderColor: theme.palette.primary.main, 
            bgcolor: `${theme.palette.primary.main}0A` 
          }
        }}
      >
        {t('ClearFilters')}
      </Button>
    </>
  );
};

export default OrganizationFilter;
