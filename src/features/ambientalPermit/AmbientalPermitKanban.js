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
import { DragIndicator } from '@mui/icons-material';
import {
  Box,
  Chip,
  Paper,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';

const COLUMN_ORDER = [
  'Pendiente Trámitar',
  'En proceso',
  'Otorgado',
  'Cerrado',
  'Desistido'
];

const COLUMN_CONFIG = {
  'Pendiente Trámitar': { color: '#f57c00', bg: '#fff8f0', light: '#fff3e0' },
  'En proceso':         { color: '#1565c0', bg: '#f0f4ff', light: '#e3f2fd' },
  'Otorgado':           { color: '#2e7d32', bg: '#f0fff4', light: '#e8f5e9' },
  'Cerrado':            { color: '#455a64', bg: '#f5f7f8', light: '#eceff1' },
  'Desistido':          { color: '#b71c1c', bg: '#fff5f5', light: '#ffebee' }
};

const SEMAFORO_COLOR = {
  verde:    '#4caf50',
  amarillo: '#ffc107',
  rojo:     '#f44336'
};

const SEMAFORO_LABEL = {
  verde:    'Sin desviaciones',
  amarillo: 'Desviaciones atendibles',
  rojo:     'Desviaciones que aumentan tiempo'
};

/* ── Date parsing for sort ────────────────────────────────── */
function parseFechaProyectada(dateStr) {
  if (!dateStr || dateStr === 'Pendiente') return null;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [d, m, y] = dateStr.split('/');
    return new Date(`${y}-${m}-${d}`);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return new Date(dateStr);
  }
  return null;
}

function sortByFechaProyectada(items) {
  return [...items].sort((a, b) => {
    const dA = parseFechaProyectada(a['FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO']);
    const dB = parseFechaProyectada(b['FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO']);
    if (!dA && !dB) return 0;
    if (!dA) return 1;
    if (!dB) return -1;
    return dA - dB;
  });
}

/* ── Card components ──────────────────────────────────────── */
function FieldRow({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: '#78909c', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.73rem', color: '#37474f', lineHeight: 1.3 }}>
        {value}
      </Typography>
    </Box>
  );
}

function KanbanCard({ item, columnColor, isDragging = false }) {
  const semColor = SEMAFORO_COLOR[item['SEMAFORO AMBIENTAL']] || '#90a4ae';
  const semLabel = SEMAFORO_LABEL[item['SEMAFORO AMBIENTAL']] || '';

  return (
    <Paper
      elevation={isDragging ? 6 : 1}
      sx={{
        p: 1.5,
        borderRadius: '8px',
        borderLeft: `4px solid ${columnColor}`,
        bgcolor: '#ffffff',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 3 },
        opacity: isDragging ? 0.85 : 1,
        userSelect: 'none'
      }}
    >
      {/* Header: tipo de permiso + semáforo */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, gap: 1 }}>
        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#263238', lineHeight: 1.3, flex: 1 }}>
          {item['TIPO DE PERMISO']}
        </Typography>
        <Tooltip title={semLabel} placement="top">
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: semColor, flexShrink: 0, mt: 0.3 }} />
        </Tooltip>
      </Box>

      {/* Sede / Autoridad chips */}
      <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
        <Chip label={item['SEDE']} size="small" sx={{ fontSize: '0.63rem', height: 18, bgcolor: '#f5f5f5', color: '#546e7a' }} />
        <Chip label={item['AUTORIDAD']} size="small" sx={{ fontSize: '0.63rem', height: 18, bgcolor: '#e8f4fd', color: '#1565c0' }} />
      </Box>

      <Box sx={{ borderTop: '1px solid #f0f0f0', pt: 1 }}>
        <FieldRow label="Tipo de trámite" value={item['TIPO DE TRÁMITE']} />
        <FieldRow label="Acto adm. inicial" value={item['ACTO ADMINISTRATIVO INICIAL']} />
        <FieldRow label="Expediente" value={item['EXPEDIENTE']} />
        <FieldRow label="F. radicación" value={item['FECHA DE RADICACIÓN DEL PERMISO']} />
        <FieldRow
          label="N.° radicado solicitud"
          value={item['NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL']}
        />
        <FieldRow
          label="F. proyectada otorgamiento"
          value={item['FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO']}
        />
      </Box>
    </Paper>
  );
}

function SortableKanbanCard({ item, columnColor, onCardClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    marginBottom: 8
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes} sx={{ position: 'relative' }}>
      {/* Drag handle */}
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

      {/* Clickable content */}
      <Box
        onClick={() => { if (!isDragging) onCardClick(item); }}
        sx={{ cursor: 'pointer' }}
      >
        <KanbanCard item={item} columnColor={columnColor} isDragging={isDragging} />
      </Box>
    </Box>
  );
}

/* ── Column ───────────────────────────────────────────────── */
function KanbanColumn({ columnId, items, onCardClick }) {
  const config = COLUMN_CONFIG[columnId] || { color: '#90a4ae', bg: '#fafafa', light: '#f5f5f5' };
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 280, maxWidth: 300, flexShrink: 0 }}>
      {/* Header */}
      <Box sx={{
        px: 1.5, py: 1,
        borderRadius: '8px 8px 0 0',
        bgcolor: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {columnId}
        </Typography>
        <Box sx={{
          bgcolor: 'rgba(255,255,255,0.25)',
          borderRadius: '50%',
          width: 22, height: 22,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: '#fff' }}>
            {items.length}
          </Typography>
        </Box>
      </Box>

      {/* Drop zone */}
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
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableKanbanCard
              key={item.id}
              item={item}
              columnColor={config.color}
              onCardClick={onCardClick}
            />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: 80,
            border: `2px dashed ${config.color}40`,
            borderRadius: '6px'
          }}>
            <Typography sx={{ fontSize: '0.72rem', color: config.color, opacity: 0.6 }}>
              Sin trámites
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */
function buildColumnItems(items) {
  const cols = {};
  COLUMN_ORDER.forEach((col) => { cols[col] = []; });
  items.forEach((item) => {
    const estado = (item['ESTADO DEL TRÁMITE'] || '').trim();
    if (cols[estado] !== undefined) cols[estado].push(item);
  });
  COLUMN_ORDER.forEach((col) => {
    cols[col] = sortByFechaProyectada(cols[col]);
  });
  return cols;
}

function findColumn(id, columnItems) {
  const strId = String(id);
  if (COLUMN_ORDER.includes(strId)) return strId;
  return COLUMN_ORDER.find((col) =>
    columnItems[col].some((item) => String(item.id) === strId)
  );
}

/* ── Main ─────────────────────────────────────────────────── */
export default function AmbientalPermitKanban({ items, onCardClick }) {
  const [columnItems, setColumnItems] = useState(() => buildColumnItems(items));
  const [activeItem, setActiveItem] = useState(null);

  // Rebuild columns when external filter changes items
  const [lastItemsKey, setLastItemsKey] = useState('');
  const itemsKey = items.map((i) => i.id).join(',');
  if (itemsKey !== lastItemsKey) {
    setColumnItems(buildColumnItems(items));
    setLastItemsKey(itemsKey);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragStart(event) {
    const activeCol = findColumn(event.active.id, columnItems);
    if (!activeCol) return;
    setActiveItem(columnItems[activeCol].find((i) => String(i.id) === String(event.active.id)) || null);
  }

  function handleDragOver(event) {
    const { active, over } = event;
    if (!over) return;
    const activeCol = findColumn(active.id, columnItems);
    const overCol = findColumn(over.id, columnItems);
    if (!activeCol || !overCol || activeCol === overCol) return;

    setColumnItems((prev) => {
      const activeItems = prev[activeCol];
      const overItems = prev[overCol];
      const activeIdx = activeItems.findIndex((i) => String(i.id) === String(active.id));
      const overIdx = overItems.findIndex((i) => String(i.id) === String(over.id));
      const movedItem = activeItems[activeIdx];
      const insertAt = overIdx >= 0 ? overIdx : overItems.length;
      return {
        ...prev,
        [activeCol]: activeItems.filter((i) => String(i.id) !== String(active.id)),
        [overCol]: [...overItems.slice(0, insertAt), movedItem, ...overItems.slice(insertAt)]
      };
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveItem(null);
    if (!over) return;
    const activeCol = findColumn(active.id, columnItems);
    const overCol = findColumn(over.id, columnItems);
    if (!activeCol || !overCol || activeCol !== overCol) return;

    setColumnItems((prev) => {
      const col = prev[activeCol];
      const oldIdx = col.findIndex((i) => String(i.id) === String(active.id));
      const newIdx = col.findIndex((i) => String(i.id) === String(over.id));
      if (oldIdx === newIdx) return prev;
      return { ...prev, [activeCol]: arrayMove(col, oldIdx, newIdx) };
    });
  }

  const activeConfig = activeItem
    ? COLUMN_CONFIG[findColumn(activeItem?.id, columnItems)] || {}
    : {};

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveItem(null)}
    >
      <Box sx={{
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
      }}>
        {COLUMN_ORDER.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            items={columnItems[columnId]}
            onCardClick={onCardClick}
          />
        ))}
      </Box>

      <DragOverlay>
        {activeItem ? (
          <KanbanCard
            item={activeItem}
            columnColor={activeConfig.color || '#90a4ae'}
            isDragging
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
