import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Close,
  DragIndicator,
  FilterList,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Search
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  InputBase,
  Paper,
  Popover,
  Tooltip,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

const COLUMN_ORDER = ['Pendiente Trámitar', 'En proceso', 'Otorgado', 'Cerrado', 'Desistido'];

const COLUMN_CONFIG = {
  'Pendiente Trámitar': { color: '#f57c00', bg: '#fff8f0', light: '#fff3e0' },
  'En proceso': { color: '#1565c0', bg: '#f0f4ff', light: '#e3f2fd' },
  Otorgado: { color: '#2e7d32', bg: '#f0fff4', light: '#e8f5e9' },
  Cerrado: { color: '#455a64', bg: '#f5f7f8', light: '#eceff1' },
  Desistido: { color: '#b71c1c', bg: '#fff5f5', light: '#ffebee' }
};

const STATUS_TO_COLUMN = {
  pending: 'Pendiente Trámitar',
  in_process: 'En proceso',
  granted: 'Otorgado',
  withdrawn: 'Desistido',
  closed: 'Cerrado'
};

const SEMAFORO_COLOR = {
  verde: '#4caf50',
  amarillo: '#ffc107',
  rojo: '#f44336',
  'sin dato': '#90a4ae'
};

const SEMAFORO_LABEL = {
  verde: 'Sin desviaciones',
  amarillo: 'Desviaciones atendibles',
  rojo: 'Desviaciones que aumentan tiempo',
  'sin dato': 'Sin dato'
};

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseFechaProyectada(dateValue) {
  if (!dateValue || dateValue === 'Pendiente') {
    return null;
  }

  const parsed = dayjs(dateValue);
  if (parsed.isValid()) {
    return parsed.toDate();
  }

  return null;
}

function sortByFechaProyectada(items) {
  return [...items].sort((left, right) => {
    const leftDate = parseFechaProyectada(left.fechaProyectadaOtorgamiento);
    const rightDate = parseFechaProyectada(right.fechaProyectadaOtorgamiento);

    if (!leftDate && !rightDate) return 0;
    if (!leftDate) return 1;
    if (!rightDate) return -1;
    return leftDate - rightDate;
  });
}

function matchesColumnSearch(item, searchValue) {
  const term = normalizeText(searchValue);
  if (!term) {
    return true;
  }

  return [item.tipoPermiso, item.sede, item.autoridad]
    .map((value) => normalizeText(value))
    .some((value) => value.includes(term));
}

function FieldRow({ label, value }) {
  if (!value || value === 'N/A') {
    return null;
  }

  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        sx={{
          fontSize: '0.62rem',
          fontWeight: 700,
          color: '#78909c',
          textTransform: 'uppercase',
          letterSpacing: '0.04em'
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.73rem', color: '#37474f', lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

function PermitKanbanCard({
  item,
  columnColor,
  isDragging = false,
  isExpanded = false,
  onToggleDetail = () => {}
}) {
  const semaforoKey = normalizeText(item.semaforoAmbiental || 'sin dato');
  const semColor = item.semaforoColor || SEMAFORO_COLOR[semaforoKey] || '#90a4ae';
  const semLabel = SEMAFORO_LABEL[semaforoKey] || item.semaforoDescription || '';

  return (
    <Paper
      elevation={isDragging ? 6 : 1}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        bgcolor: '#ffffff',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
        opacity: isDragging ? 0.85 : 1,
        userSelect: 'none'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          mb: 1,
          gap: 1
        }}
      >
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#263238',
            lineHeight: 1.3,
            flex: 1,
            minHeight: '2.08rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {item.tipoPermiso}
        </Typography>
        <Tooltip title={semLabel} placement="top">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: semColor,
              flexShrink: 0,
              mt: 0.3
            }}
          />
        </Tooltip>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
          <Chip
            label={item.sede}
            size="small"
            sx={{
              fontSize: '0.63rem',
              height: 18,
              bgcolor: '#f5f5f5',
              color: '#546e7a',
              maxWidth: 118,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }
            }}
          />
          <Chip
            label={item.autoridad}
            size="small"
            sx={{
              fontSize: '0.63rem',
              height: 18,
              bgcolor: '#e8f4fd',
              color: '#1565c0',
              maxWidth: 118,
              '& .MuiChip-label': {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }
            }}
          />
        </Box>

        <Tooltip title={isExpanded ? 'Ocultar detalle' : 'Ver detalle'} placement="top">
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onToggleDetail();
            }}
            sx={{
              width: 20,
              height: 20,
              color: '#78909c',
              flexShrink: 0,
              '&:hover': { bgcolor: '#eef5f7', color: '#00838f' }
            }}
          >
            {isExpanded ? (
              <KeyboardArrowUp sx={{ fontSize: '1rem' }} />
            ) : (
              <KeyboardArrowDown sx={{ fontSize: '1rem' }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ pt: 0.75 }}>
          <FieldRow label="Tipo de trámite" value={item.tipoTramite} />
          <FieldRow label="Acto adm. inicial" value={item.actoAdministrativoInicial} />
          <FieldRow label="Expediente" value={item.expediente} />
          <FieldRow label="F. radicación" value={item.fechaRadicacionPermiso} />
          <FieldRow label="N.° radicado solicitud" value={item.numeroRadicadoSolicitudAutoridad} />
          <FieldRow label="F. proyectada otorgamiento" value={item.fechaProyectadaOtorgamiento} />
        </Box>
      </Collapse>
    </Paper>
  );
}

function SortablePermitKanbanCard({ item, columnColor, onCardClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.recordId
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} sx={{ position: 'relative' }}>
      <Box
        {...listeners}
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          cursor: 'grab',
          color: '#cfd8dc',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          '&:hover': { color: '#78909c' },
          '&:active': { cursor: 'grabbing' }
        }}
        title="Arrastrar"
      >
        <DragIndicator sx={{ fontSize: '1rem' }} />
      </Box>

      <Box
        onClick={() => {
          if (!isDragging) onCardClick(item);
        }}
        sx={{ cursor: 'pointer' }}
      >
        <PermitKanbanCard
          item={item}
          columnColor={columnColor}
          isDragging={isDragging}
          isExpanded={isExpanded}
          onToggleDetail={() => setIsExpanded((previous) => !previous)}
        />
      </Box>
    </Box>
  );
}

function PermitKanbanColumn({ columnId, items, onCardClick }) {
  const config = COLUMN_CONFIG[columnId] || { color: '#90a4ae', bg: '#fafafa', light: '#f5f5f5' };
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const filterOpen = Boolean(filterAnchorEl);
  const filteredItems = useMemo(
    () => items.filter((item) => matchesColumnSearch(item, searchValue)),
    [items, searchValue]
  );
  const visibleCount = searchValue ? filteredItems.length : items.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 280, maxWidth: 300, flexShrink: 0 }}>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: '8px 8px 0 0',
          bgcolor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#fff',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
        >
          {columnId}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="Buscar en columna">
            <IconButton
              size="small"
              onClick={(event) => setFilterAnchorEl(event.currentTarget)}
              sx={{
                width: 22,
                height: 22,
                color: '#fff',
                bgcolor: filterOpen || searchValue ? 'rgba(255,255,255,0.22)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }
              }}
            >
              <FilterList sx={{ fontSize: '0.95rem' }} />
            </IconButton>
          </Tooltip>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.25)',
              borderRadius: '50%',
              width: 22,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
              {visibleCount}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Popover
        open={filterOpen}
        anchorEl={filterAnchorEl}
        onClose={() => setFilterAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 0.75,
            p: 1,
            width: 226,
            borderRadius: '3px',
            boxShadow: '0 8px 24px rgba(15,23,42,0.18)',
            border: '1px solid #d7dde5',
            bgcolor: '#f7f7f7',
            overflow: 'visible'
          }
        }}
      >
        <Box
          sx={{
            height: 34,
            px: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            border: '2px solid #1e9bff',
            borderRadius: '6px',
            bgcolor: '#fff',
            boxShadow: '0 1px 2px rgba(15,23,42,0.08)'
          }}
        >
          <Search sx={{ fontSize: '0.95rem', color: '#607d8b' }} />
          <InputBase
            autoFocus
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Filtrando..."
            sx={{
              flex: 1,
              fontSize: '0.82rem',
              color: '#37474f',
              '& input': {
                p: 0,
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              },
              '& input:focus': {
                border: 'none',
                outline: 'none',
                boxShadow: 'none'
              }
            }}
          />
          {searchValue ? (
            <IconButton size="small" onClick={() => setSearchValue('')} sx={{ p: 0.25 }}>
              <Close sx={{ fontSize: '0.9rem', color: '#90a4ae' }} />
            </IconButton>
          ) : null}
        </Box>
      </Popover>

      <Box
        ref={setNodeRef}
        sx={{
          flex: 1,
          minHeight: 120,
          bgcolor: isOver ? config.light : config.bg,
          borderRadius: '0 0 8px 8px',
          border: `1px solid ${config.color}30`,
          borderTop: 'none',
          p: 1,
          transition: 'background-color 0.15s',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 220px)'
        }}
      >
        <SortableContext
          items={filteredItems.map((item) => item.recordId)}
          strategy={verticalListSortingStrategy}
        >
          {filteredItems.map((item) => (
            <SortablePermitKanbanCard
              key={item.recordId}
              item={item}
              columnColor={config.color}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>

        {filteredItems.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 80,
              border: `2px dashed ${config.color}40`,
              borderRadius: '6px'
            }}
          >
            <Typography sx={{ fontSize: '0.72rem', color: config.color, opacity: 0.6 }}>
              {searchValue ? 'Sin resultados' : 'Sin trámites'}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

function buildColumnItems(items) {
  const columns = {};
  COLUMN_ORDER.forEach((column) => {
    columns[column] = [];
  });

  items.forEach((item) => {
    const estado = STATUS_TO_COLUMN[item.statusKey] || 'En proceso';
    if (columns[estado] !== undefined) {
      columns[estado].push(item);
    }
  });

  COLUMN_ORDER.forEach((column) => {
    columns[column] = sortByFechaProyectada(columns[column]);
  });

  return columns;
}

function findColumn(id, columnItems) {
  const stringId = String(id);
  if (COLUMN_ORDER.includes(stringId)) return stringId;

  return COLUMN_ORDER.find((column) =>
    columnItems[column].some((item) => String(item.recordId) === stringId)
  );
}

export default function PermitManagerKanban({ items, onCardClick = () => {} }) {
  const [columnItems, setColumnItems] = useState(() => buildColumnItems(items));
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    setColumnItems(buildColumnItems(items));
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeConfig = useMemo(
    () => (activeItem ? COLUMN_CONFIG[findColumn(activeItem.recordId, columnItems)] || {} : {}),
    [activeItem, columnItems]
  );

  function handleDragStart(event) {
    const activeColumn = findColumn(event.active.id, columnItems);
    if (!activeColumn) return;

    setActiveItem(
      columnItems[activeColumn].find((item) => String(item.recordId) === String(event.active.id)) ||
        null
    );
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;

    const activeColumn = findColumn(active.id, columnItems);
    const overColumn = findColumn(over.id, columnItems);
    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setColumnItems((previous) => {
      const activeItems = previous[activeColumn];
      const overItems = previous[overColumn];
      const activeIndex = activeItems.findIndex(
        (item) => String(item.recordId) === String(active.id)
      );
      const overIndex = overItems.findIndex((item) => String(item.recordId) === String(over.id));
      const movedItem = activeItems[activeIndex];
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;

      return {
        ...previous,
        [activeColumn]: activeItems.filter((item) => String(item.recordId) !== String(active.id)),
        [overColumn]: [
          ...overItems.slice(0, insertAt),
          movedItem,
          ...overItems.slice(insertAt)
        ]
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;

    const activeColumn = findColumn(active.id, columnItems);
    const overColumn = findColumn(over.id, columnItems);
    if (!activeColumn || !overColumn || activeColumn !== overColumn) return;

    setColumnItems((previous) => {
      const itemsInColumn = previous[activeColumn];
      const oldIndex = itemsInColumn.findIndex(
        (item) => String(item.recordId) === String(active.id)
      );
      const newIndex = itemsInColumn.findIndex((item) => String(item.recordId) === String(over.id));
      if (oldIndex === newIndex) return previous;

      return {
        ...previous,
        [activeColumn]: arrayMove(itemsInColumn, oldIndex, newIndex)
      };
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItem(null)}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '100%',
          px: 2,
          py: 1.5,
          alignItems: 'flex-start',
          '&::-webkit-scrollbar': { height: 6 },
          '&::-webkit-scrollbar-track': { bgcolor: '#f0f0f0', borderRadius: 3 },
          '&::-webkit-scrollbar-thumb': { bgcolor: '#b0bec5', borderRadius: 3 }
        }}
      >
        {COLUMN_ORDER.map((columnId) => (
          <PermitKanbanColumn
            key={columnId}
            columnId={columnId}
            items={columnItems[columnId]}
            onCardClick={onCardClick}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeItem ? (
          <PermitKanbanCard
            item={activeItem}
            columnColor={activeConfig.color || '#90a4ae'}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
