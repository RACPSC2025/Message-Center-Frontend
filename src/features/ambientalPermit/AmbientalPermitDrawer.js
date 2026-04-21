import {
  AttachFile,
  CheckCircleOutline,
  Close,
  InsertDriveFile,
  RadioButtonUnchecked,
  Send
} from '@mui/icons-material';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { useState } from 'react';
import BaseTab from '../../components/BaseTab';

/* ── Constants ──────────────────────────────────────────────── */

const ESTADO_COLORS = {
  'En proceso':         { bg: '#e3f2fd', color: '#1565c0' },
  'Pendiente Trámitar': { bg: '#fff3e0', color: '#f57c00' },
  'Otorgado':           { bg: '#e8f5e9', color: '#2e7d32' },
  'Cerrado':            { bg: '#eceff1', color: '#455a64' },
  'Desistido':          { bg: '#ffebee', color: '#b71c1c' }
};

const SEMAFORO = {
  verde:    { color: '#4caf50', label: 'Sin desviaciones' },
  amarillo: { color: '#ffc107', label: 'Desviaciones atendibles' },
  rojo:     { color: '#f44336', label: 'Desviaciones que aumentan tiempo' }
};

const ACTIVITIES_TEMPLATE = [
  { id: 1, label: 'Recopilación de documentos técnicos y legales' },
  { id: 2, label: 'Elaboración y radicación de la solicitud ante la autoridad' },
  { id: 3, label: 'Pago de evaluación ambiental y reporte del soporte' },
  { id: 4, label: 'Seguimiento al auto de inicio de trámite' },
  { id: 5, label: 'Atención a visita técnica de la autoridad ambiental' },
  { id: 6, label: 'Respuesta a requerimientos adicionales del acto administrativo' },
  { id: 7, label: 'Revisión y recepción del acto administrativo final' }
];

const MOCK_COMMENTS_POOL = [
  [
    {
      id: 1,
      user: 'María García',
      initials: 'MG',
      avatarColor: '#1565c0',
      date: '2025-01-14T10:23:00',
      text: 'Se radicó la solicitud ante la autoridad ambiental. Pendiente confirmación oficial del número de radicado.',
      attachments: [{ name: 'Solicitud_inicial.pdf', size: '245 KB' }]
    },
    {
      id: 2,
      user: 'Carlos Rodríguez',
      initials: 'CR',
      avatarColor: '#2e7d32',
      date: '2025-02-03T14:05:00',
      text: 'La autoridad confirmó el radicado. Tiempo estimado de respuesta: 3 meses según normativa vigente.',
      attachments: []
    },
    {
      id: 3,
      user: 'Ana Martínez',
      initials: 'AM',
      avatarColor: '#f57c00',
      date: '2025-03-22T09:30:00',
      text: 'Se recibió requerimiento adicional de información complementaria. Revisar documentos adjuntos.',
      attachments: [
        { name: 'Requerimiento_adicional.pdf', size: '89 KB' },
        { name: 'Planos_actualizados.dwg', size: '1.2 MB' }
      ]
    }
  ],
  [
    {
      id: 1,
      user: 'Luis Peña',
      initials: 'LP',
      avatarColor: '#6a1b9a',
      date: '2024-11-05T08:15:00',
      text: 'Trámite en revisión interna previa a radicación. Se identificaron ajustes en los planos técnicos.',
      attachments: [{ name: 'Planos_v2.pdf', size: '3.1 MB' }]
    },
    {
      id: 2,
      user: 'María García',
      initials: 'MG',
      avatarColor: '#1565c0',
      date: '2024-12-10T11:40:00',
      text: 'Planos corregidos y aprobados internamente. Listo para radicar la próxima semana.',
      attachments: []
    }
  ],
  [
    {
      id: 1,
      user: 'Ana Martínez',
      initials: 'AM',
      avatarColor: '#f57c00',
      date: '2025-02-18T16:00:00',
      text: 'Se realizó el pago de evaluación ambiental por valor de $6.971.794. Adjunto comprobante.',
      attachments: [{ name: 'Comprobante_pago.pdf', size: '120 KB' }]
    }
  ]
];

/* ── Helper: deterministic mock per item id ─────────────────── */
function getMockData(itemId) {
  const pool = MOCK_COMMENTS_POOL[itemId % MOCK_COMMENTS_POOL.length];
  const doneCount = itemId % (ACTIVITIES_TEMPLATE.length + 1);
  const activities = ACTIVITIES_TEMPLATE.map((a, idx) => ({
    ...a,
    done: idx < doneCount
  }));
  return { comments: pool, activities };
}

/* ── Detail field row ───────────────────────────────────────── */
function DetailField({ label, value, chip }) {
  if (!value && !chip) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#90a4ae', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.3 }}>
        {label}
      </Typography>
      {chip ? chip : (
        <Typography sx={{ fontSize: '0.82rem', color: '#37474f', lineHeight: 1.4 }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

/* ── Tab: Detalles ─────────────────────────────────────────── */
function TabDetalles({ item }) {
  const estado = item['ESTADO DEL TRÁMITE'];
  const estadoCfg = ESTADO_COLORS[estado] || { bg: '#f5f5f5', color: '#546e7a' };
  const sem = item['SEMAFORO AMBIENTAL'];
  const semCfg = SEMAFORO[sem] || { color: '#90a4ae', label: sem || '—' };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header block */}
      <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: '10px', border: '1px solid #e8edf2', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={estado}
            size="small"
            sx={{ bgcolor: estadoCfg.bg, color: estadoCfg.color, fontWeight: 800, fontSize: '0.72rem', borderRadius: '5px', height: 24 }}
          />
          <Tooltip title={semCfg.label}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: semCfg.color }} />
              <Typography sx={{ fontSize: '0.68rem', color: '#78909c' }}>Semáforo</Typography>
            </Box>
          </Tooltip>
        </Box>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#263238', lineHeight: 1.3 }}>
          {item['TIPO DE PERMISO']}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#78909c', mt: 0.3 }}>
          {item['TIPO DE TRÁMITE']}
        </Typography>
      </Paper>

      {/* Identification */}
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#00bcd4', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
        Identificación
      </Typography>
      <DetailField label="Unidad" value={item['UNIDAD']} />
      <DetailField label="Sede" value={item['SEDE']} />
      <DetailField label="Autoridad ambiental" value={item['AUTORIDAD']} />
      <Divider sx={{ my: 1.5 }} />

      {/* Document references */}
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#00bcd4', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
        Documentos
      </Typography>
      <DetailField label="Acto administrativo inicial" value={item['ACTO ADMINISTRATIVO INICIAL'] || '—'} />
      <DetailField label="Expediente" value={item['EXPEDIENTE'] || '—'} />
      <Divider sx={{ my: 1.5 }} />

      {/* Dates & radicado */}
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 800, color: '#00bcd4', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1 }}>
        Radicación y tiempos
      </Typography>
      <DetailField label="Fecha de radicación del permiso" value={item['FECHA DE RADICACIÓN DEL PERMISO'] || '—'} />
      <DetailField
        label="N.° radicado solicitud a la autoridad ambiental"
        value={item['NÚMERO DE RADICADO DE LA SOLICITUD A LA AUTORIDAD AMBIENTAL'] || '—'}
      />
      <DetailField
        label="Fecha proyectada para el otorgamiento del permiso"
        value={item['FECHA PROYECTADA PARA EL OTORGAMIENTO DEL PERMISO'] || '—'}
      />
    </Box>
  );
}

/* ── Tab: Actividades ──────────────────────────────────────── */
function TabActividades({ activities, onChange }) {
  const doneCount = activities.filter((a) => a.done).length;
  const pct = Math.round((doneCount / activities.length) * 100);

  return (
    <Box sx={{ p: 2 }}>
      {/* Progress summary */}
      <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e8edf2' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#455a64' }}>
            Progreso de actividades
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#263238' }}>
            {doneCount}/{activities.length} — {pct}%
          </Typography>
        </Box>
        <Box sx={{ height: 8, bgcolor: '#e0e0e0', borderRadius: 4, overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: pct === 100 ? '#2e7d32' : '#1976d2', borderRadius: 4, transition: 'width 0.3s' }} />
        </Box>
      </Box>

      {/* Checklist */}
      <List disablePadding>
        {activities.map((act, idx) => (
          <ListItem
            key={act.id}
            disablePadding
            sx={{
              mb: 0.5,
              p: 1,
              borderRadius: '8px',
              bgcolor: act.done ? '#f0fff4' : '#fafafa',
              border: `1px solid ${act.done ? '#a5d6a7' : '#eeeeee'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: act.done ? '#e8f5e9' : '#f5f5f5' }
            }}
            onClick={() => onChange(idx)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              {act.done
                ? <CheckCircleOutline sx={{ color: '#2e7d32', fontSize: '1.2rem', flexShrink: 0 }} />
                : <RadioButtonUnchecked sx={{ color: '#b0bec5', fontSize: '1.2rem', flexShrink: 0 }} />
              }
              <Typography sx={{
                fontSize: '0.8rem',
                color: act.done ? '#2e7d32' : '#455a64',
                textDecoration: act.done ? 'line-through' : 'none',
                fontWeight: act.done ? 500 : 600,
                lineHeight: 1.3
              }}>
                {act.label}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

/* ── Tab: Comentarios ──────────────────────────────────────── */
function TabComentarios({ comments, onSend }) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Comments list */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {comments.length === 0 && (
          <Typography sx={{ fontSize: '0.82rem', color: '#90a4ae', textAlign: 'center', mt: 4 }}>
            Sin comentarios aún
          </Typography>
        )}
        {comments.map((c) => (
          <Box key={c.id} sx={{ mb: 2 }}>
            {/* Comment header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Avatar sx={{ width: 30, height: 30, bgcolor: c.avatarColor, fontSize: '0.7rem', fontWeight: 800 }}>
                {c.initials}
              </Avatar>
              <Box>
                <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#263238', lineHeight: 1 }}>
                  {c.user}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#90a4ae' }}>
                  {new Date(c.date).toLocaleString('es-CO', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Comment body */}
            <Box
              sx={{
                ml: 4.5,
                p: 1.5,
                bgcolor: '#f8fafc',
                borderRadius: '4px 12px 12px 12px',
                border: '1px solid #e8edf2'
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', color: '#37474f', lineHeight: 1.5 }}>
                {c.text}
              </Typography>

              {/* Attachments */}
              {c.attachments && c.attachments.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {c.attachments.map((att, i) => (
                    <Chip
                      key={i}
                      icon={<InsertDriveFile sx={{ fontSize: '0.85rem !important' }} />}
                      label={`${att.name} (${att.size})`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        bgcolor: '#e3f2fd',
                        color: '#1565c0',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#bbdefb' }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Input area */}
      <Box sx={{ p: 1.5, borderTop: '1px solid #edf2f4', bgcolor: '#f7f9fb' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          bgcolor: 'white',
          borderRadius: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          pl: 1.5,
          pr: 0.5,
          py: 0.5
        }}>
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            placeholder="Escribe un comentario..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.82rem',
                bgcolor: 'transparent',
                p: 0,
                '& fieldset': { border: 'none' },
                '&:hover fieldset': { border: 'none' },
                '&.Mui-focused fieldset': { border: 'none' }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Adjuntar archivo">
                    <IconButton size="small" sx={{ color: '#90a4ae', '&:hover': { color: '#607d8b' } }}>
                      <AttachFile fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              )
            }}
          />
          <Button
            variant="contained"
            size="small"
            onClick={handleSend}
            disabled={!text.trim()}
            sx={{
              minWidth: 36,
              width: 36,
              height: 36,
              borderRadius: '50%',
              bgcolor: '#1976d2',
              '&:hover': { bgcolor: '#1565c0' },
              '&.Mui-disabled': { bgcolor: '#e0e0e0' },
              boxShadow: '0 2px 5px rgba(25,118,210,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send sx={{ fontSize: '1rem' }} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

/* ── Main Drawer ────────────────────────────────────────────── */
export default function AmbientalPermitDrawer({ open, item, onClose }) {
  const [activeTab, setActiveTab] = useState(0);

  const { comments: initialComments, activities: initialActivities } = item
    ? getMockData(item.id)
    : { comments: [], activities: [] };

  const [comments, setComments] = useState(initialComments);
  const [activities, setActivities] = useState(initialActivities);

  // Reset state when item changes
  const [lastItemId, setLastItemId] = useState(null);
  if (item && item.id !== lastItemId) {
    const { comments: c, activities: a } = getMockData(item.id);
    setComments(c);
    setActivities(a);
    setLastItemId(item.id);
    setActiveTab(0);
  }

  function handleActivityToggle(idx) {
    setActivities((prev) =>
      prev.map((a, i) => (i === idx ? { ...a, done: !a.done } : a))
    );
  }

  function handleSendComment(text) {
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Usuario actual',
        initials: 'UA',
        avatarColor: '#00838f',
        date: new Date().toISOString(),
        text,
        attachments: []
      }
    ]);
  }

  const TAB_ITEMS = [
    { label: 'Detalles', skipTranslation: true },
    { label: 'Actividades', skipTranslation: true },
    { label: 'Comentarios', skipTranslation: true }
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: '75vw',
          width: { sm: '80vw', md: '65vw', lg: '45vw' },
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#00838f' }}>
        <Toolbar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              color="white"
              sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              {item?.['TIPO DE PERMISO'] || 'Permiso ambiental'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
              {item?.['SEDE']} — {item?.['UNIDAD']}
            </Typography>
          </Box>
          <IconButton edge="end" onClick={onClose}>
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <BaseTab
        items={TAB_ITEMS}
        activeTab={activeTab}
        tabContainerProps={{
          onChange: (_, v) => setActiveTab(v)
        }}
        showBorderBottom
      />

      {/* Content */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 0 && item && (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <TabDetalles item={item} />
          </Box>
        )}
        {activeTab === 1 && (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <TabActividades activities={activities} onChange={handleActivityToggle} />
          </Box>
        )}
        {activeTab === 2 && (
          <TabComentarios comments={comments} onSend={handleSendComment} />
        )}
      </Box>
    </Drawer>
  );
}
