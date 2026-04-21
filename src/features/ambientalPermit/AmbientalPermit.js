import { TableChart, ViewWeek } from '@mui/icons-material';
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Typography
} from '@mui/material';
import { useMemo, useState } from 'react';

import rawData from './ambientalPermitsData.json';
import AmbientalPermitKanban from './AmbientalPermitKanban';
import AmbientalPermitTable from './AmbientalPermitTable';

function uniqueSorted(arr) {
  return [...new Set(arr.filter(Boolean))].sort();
}

const allUnidades  = uniqueSorted(rawData.map((r) => r['UNIDAD']));
const allTipos     = uniqueSorted(rawData.map((r) => r['TIPO DE PERMISO']));

const VIEW_TABS = [
  { id: 'tabla',  label: 'Tabla',  Icon: TableChart },
  { id: 'kanban', label: 'Kanban', Icon: ViewWeek }
];

export default function AmbientalPermit() {
  const [selectedView, setSelectedView] = useState('tabla');
  const [filterUnidad, setFilterUnidad] = useState('');
  const [filterSede,   setFilterSede]   = useState('');
  const [filterTipo,   setFilterTipo]   = useState('');

  const sedeOptions = useMemo(() => {
    const base = filterUnidad
      ? rawData.filter((r) => r['UNIDAD'] === filterUnidad)
      : rawData;
    return uniqueSorted(base.map((r) => r['SEDE']));
  }, [filterUnidad]);

  const filteredData = useMemo(() => {
    return rawData.filter((item) => {
      if (filterUnidad && item['UNIDAD'] !== filterUnidad) return false;
      if (filterSede   && item['SEDE']   !== filterSede)   return false;
      if (filterTipo   && item['TIPO DE PERMISO'] !== filterTipo) return false;
      return true;
    });
  }, [filterUnidad, filterSede, filterTipo]);

  function handleClearFilters() {
    setFilterUnidad('');
    setFilterSede('');
    setFilterTipo('');
  }

  const hasFilters = filterUnidad || filterSede || filterTipo;

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', pt: 1 }}>

      {/* ── Barra superior: filtros + botones de vista ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1,
          bgcolor: 'white',
          borderBottom: '1px solid #edf2f4',
          mb: 0.5,
          flexWrap: 'wrap',
          gap: 1
        }}
      >
        {/* Left: filtros */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filterUnidad}
              displayEmpty
              onChange={(e) => {
                setFilterUnidad(e.target.value);
                setFilterSede('');
              }}
              sx={{
                height: '40px',
                borderRadius: '6px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e6ed' },
                color: filterUnidad ? '#263238' : '#90a4ae',
                fontSize: '0.85rem'
              }}
              renderValue={(v) => v || <span style={{ color: '#90a4ae' }}>Unidad</span>}
            >
              <MenuItem value="">Todas las unidades</MenuItem>
              {allUnidades.map((u) => (
                <MenuItem key={u} value={u}>{u}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filterSede}
              displayEmpty
              disabled={sedeOptions.length === 0}
              onChange={(e) => setFilterSede(e.target.value)}
              sx={{
                height: '40px',
                borderRadius: '6px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e6ed' },
                color: filterSede ? '#263238' : '#90a4ae',
                fontSize: '0.85rem'
              }}
              renderValue={(v) => v || <span style={{ color: '#90a4ae' }}>Sede</span>}
            >
              <MenuItem value="">Todas las sedes</MenuItem>
              {sedeOptions.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={filterTipo}
              displayEmpty
              onChange={(e) => setFilterTipo(e.target.value)}
              sx={{
                height: '40px',
                borderRadius: '6px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e6ed' },
                color: filterTipo ? '#263238' : '#90a4ae',
                fontSize: '0.85rem'
              }}
              renderValue={(v) => v || <span style={{ color: '#90a4ae' }}>Tipo de permiso</span>}
            >
              <MenuItem value="">Todos los tipos</MenuItem>
              {allTipos.map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearFilters}
              sx={{
                fontWeight: 800,
                color: '#00bcd4',
                borderColor: '#00bcd480',
                textTransform: 'none',
                px: 2,
                height: '40px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                '&:hover': { borderColor: '#00bcd4', bgcolor: 'rgba(0,188,212,0.04)' }
              }}
            >
              Limpiar filtros
            </Button>
          )}

          {/* Conteo */}
          <Typography sx={{ fontSize: '0.75rem', color: '#90a4ae', ml: 0.5 }}>
            {filteredData.length} trámite{filteredData.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {/* Right: botones de vista */}
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end', pb: 0.5 }}>
          {VIEW_TABS.map(({ id, label, Icon }) => {
            const isActive = selectedView === id;
            return (
              <Box
                key={id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => setSelectedView(id)}
              >
                <Box sx={{ color: isActive ? '#f57c00' : '#b0bec5', mb: 0.2 }}>
                  <Icon color={isActive ? 'warning' : 'action'} fontSize="medium" />
                </Box>
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    color: isActive ? '#263238' : '#b0bec5',
                    textTransform: 'capitalize'
                  }}
                >
                  {label}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── Contenido ── */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {selectedView === 'tabla' ? (
          <AmbientalPermitTable items={filteredData} />
        ) : (
          <AmbientalPermitKanban items={filteredData} />
        )}
      </Box>
    </Box>
  );
}
