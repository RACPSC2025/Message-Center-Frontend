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
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Toolbar,
  Typography
} from '@mui/material';
import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import BaseTab from '../../components/BaseTab';
import { STATUS_META } from './permitManagerData';

const ACTIVITY_TEMPLATE = [
  { id: 1, label: 'Recopilación de documentos técnicos y legales' },
  { id: 2, label: 'Elaboración y radicación de la solicitud ante la autoridad' },
  { id: 3, label: 'Pago de evaluación ambiental y reporte del soporte' },
  { id: 4, label: 'Seguimiento al auto de inicio de trámite' },
  { id: 5, label: 'Atención a visita técnica de la autoridad ambiental' },
  { id: 6, label: 'Respuesta a requerimientos adicionales del acto administrativo' },
  { id: 7, label: 'Revisión y recepción del acto administrativo final' }
];

const USER_POOL = [
  { name: 'Luis Peña', initials: 'LP', color: '#7B1FA2' },
  { name: 'María García', initials: 'MG', color: '#1565C0' },
  { name: 'Carlos Rodríguez', initials: 'CR', color: '#2E7D32' },
  { name: 'Ana Martínez', initials: 'AM', color: '#EF6C00' }
];

const STATUS_TEXT_BY_KEY = {
  pending:
    'El trámite quedó consolidado y pendiente de radicación o validación documental final.',
  in_process:
    'El expediente se encuentra en revisión activa ante la autoridad y bajo seguimiento del equipo ambiental.',
  granted:
    'Se recibió el acto administrativo favorable y el permiso quedó otorgado para operación.',
  closed:
    'El expediente fue cerrado administrativamente después de completar las actividades requeridas.',
  withdrawn:
    'Se documentó el desistimiento del trámite y se dejó trazabilidad de cierre interno.'
};

const SEMAPHORE_META = {
  verde: { color: '#4CAF50', label: 'Sin desviaciones' },
  amarillo: { color: '#FFC107', label: 'Desviaciones atendibles' },
  rojo: { color: '#F44336', label: 'Desviaciones críticas' },
  'sin dato': { color: '#90A4AE', label: 'Sin dato' }
};

function normalizeText(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function getSeed(item) {
  const numericPart = String(item?.recordId ?? '')
    .replace(/\D/g, '')
    .slice(-4);

  return Number(numericPart || 1);
}

function getDoneCount(item) {
  const seed = getSeed(item);

  switch (item?.statusKey) {
    case 'pending':
      return 1 + (seed % 2);
    case 'in_process':
      return 2 + (seed % 3);
    case 'granted':
      return 6;
    case 'closed':
      return 7;
    case 'withdrawn':
      return 2;
    default:
      return 2;
  }
}

function buildActivities(item) {
  const doneCount = getDoneCount(item);

  return ACTIVITY_TEMPLATE.map((activity, index) => ({
    ...activity,
    done: index < doneCount
  }));
}

function buildComments(item) {
  if (!item) return [];

  const seed = getSeed(item);
  const authorOne = USER_POOL[seed % USER_POOL.length];
  const authorTwo = USER_POOL[(seed + 1) % USER_POOL.length];
  const radicationDate = item.fechaRadicacionPermiso
    ? dayjs(item.fechaRadicacionPermiso)
    : dayjs().subtract(30, 'day');

  return [
    {
      id: `${item.recordId}-c1`,
      user: authorOne.name,
      initials: authorOne.initials,
      avatarColor: authorOne.color,
      date: radicationDate.add(3, 'day').toISOString(),
      text: `Se abrió seguimiento interno para ${item.tipoPermiso.toLowerCase()} en ${item.sede}. Se validó la documentación base del expediente ${item.expediente}.`,
      attachments:
        seed % 2 === 0
          ? [{ name: `Soporte_${item.expediente}.pdf`, size: '1.3 MB' }]
          : []
    },
    {
      id: `${item.recordId}-c2`,
      user: authorTwo.name,
      initials: authorTwo.initials,
      avatarColor: authorTwo.color,
      date: radicationDate.add(12, 'day').toISOString(),
      text: STATUS_TEXT_BY_KEY[item.statusKey] || STATUS_TEXT_BY_KEY.in_process,
      attachments:
        item.statusKey === 'in_process' || item.statusKey === 'pending'
          ? [{ name: `Radicado_${item.numeroRadicadoSolicitudAutoridad}.pdf`, size: '420 KB' }]
          : []
    }
  ];
}

function DetailField({ label, value, chip }) {
  if (!value && !chip) {
    return null;
  }

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        sx={{
          fontSize: '0.65rem',
          fontWeight: 800,
          color: '#90A4AE',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          mb: 0.3
        }}
      >
        {label}
      </Typography>
      {chip ? (
        chip
      ) : (
        <Typography sx={{ fontSize: '0.82rem', color: '#37474F', lineHeight: 1.4 }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      sx={{
        fontSize: '0.68rem',
        fontWeight: 800,
        color: '#00BCD4',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        mb: 1
      }}
    >
      {children}
    </Typography>
  );
}

function UserChips({ users }) {
  if (!users?.length) return null;
  return (
    <Stack direction="row" flexWrap="wrap" gap={0.5}>
      {users.map((user) => (
        <Chip
          key={user.id}
          label={user.fullname}
          size="small"
          sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#E3F2FD', color: '#1565C0' }}
        />
      ))}
    </Stack>
  );
}

function TabDetalles({ item }) {
  const statusMeta = STATUS_META[item.statusKey] || STATUS_META.in_process;
  const semaforoKey = normalizeText(item.semaforoAmbiental || 'sin dato');
  const semaforoMeta = SEMAPHORE_META[semaforoKey] || SEMAPHORE_META['sin dato'];
  const semaforoColor = item.semaforoColor || semaforoMeta.color;
  const semaforoLabel = item.semaforoDescription || semaforoMeta.label;

  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          bgcolor: '#F8FAFC',
          borderRadius: '10px',
          border: '1px solid #E8EDF2',
          mb: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Chip
            label={item.estadoTramite}
            size="small"
            sx={{
              bgcolor: `${statusMeta.dotColor}1A`,
              color: statusMeta.dotColor,
              fontWeight: 800,
              fontSize: '0.72rem',
              borderRadius: '5px',
              height: 24
            }}
          />
          <Tooltip title={semaforoLabel}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: semaforoColor
                }}
              />
              <Typography sx={{ fontSize: '0.68rem', color: '#78909C' }}>Semáforo</Typography>
            </Box>
          </Tooltip>
        </Box>

        <Typography sx={{ fontSize: '1rem', fontWeight: 800, color: '#263238', lineHeight: 1.3 }}>
          {item.tipoPermiso}
        </Typography>
        <Typography sx={{ fontSize: '0.78rem', color: '#78909C', mt: 0.3 }}>
          {item.tipoTramite}
        </Typography>
      </Paper>

      <SectionTitle>Identificación</SectionTitle>
      <DetailField label="Unidad" value={item.unidad} />
      <DetailField label="Sede" value={item.sede} />
      <DetailField label="Autoridad ambiental" value={item.autoridad} />
      {item.responsablesList?.length > 0 && (
        <DetailField label="Responsables" chip={<UserChips users={item.responsablesList} />} />
      )}
      {item.revisoresList?.length > 0 && (
        <DetailField label="Revisores" chip={<UserChips users={item.revisoresList} />} />
      )}
      <Divider sx={{ my: 1.5 }} />

      {item.justificacionSolicitud && (
        <>
          <SectionTitle>Solicitud</SectionTitle>
          <DetailField label="Justificación" value={item.justificacionSolicitud} />
          <Divider sx={{ my: 1.5 }} />
        </>
      )}

      <SectionTitle>Documentos</SectionTitle>
      <DetailField label="Acto administrativo inicial" value={item.actoAdministrativoInicial || '—'} />
      <DetailField label="Expediente" value={item.expediente || '—'} />
      <Divider sx={{ my: 1.5 }} />

      <SectionTitle>Radicación y tiempos</SectionTitle>
      <DetailField label="Fecha de radicación del permiso" value={item.fechaRadicacionPermiso || '—'} />
      <DetailField
        label="N.° radicado solicitud a la autoridad"
        value={item.numeroRadicadoSolicitudAutoridad || '—'}
      />
      <DetailField
        label="Fecha proyectada para el otorgamiento"
        value={item.fechaProyectadaOtorgamiento || '—'}
      />
      <DetailField
        label="Fecha real de otorgamiento"
        value={item.fechaRealOtorgamiento || '—'}
      />
      {item.duracionTramiteMeses && (
        <DetailField
          label="Duración del trámite (meses)"
          value={String(item.duracionTramiteMeses)}
        />
      )}
    </Box>
  );
}

function TabActividades({ activities, onChange }) {
  const doneCount = activities.filter((activity) => activity.done).length;
  const percentage = Math.round((doneCount / activities.length) * 100);

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          bgcolor: '#F8FAFC',
          borderRadius: '8px',
          border: '1px solid #E8EDF2'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.8
          }}
        >
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 700, color: '#455A64' }}>
            Progreso de actividades
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', fontWeight: 800, color: '#263238' }}>
            {doneCount}/{activities.length} - {percentage}%
          </Typography>
        </Box>
        <Box sx={{ height: 8, bgcolor: '#E0E0E0', borderRadius: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${percentage}%`,
              bgcolor: percentage === 100 ? '#2E7D32' : '#1976D2',
              borderRadius: 4,
              transition: 'width 0.3s'
            }}
          />
        </Box>
      </Box>

      <List disablePadding>
        {activities.map((activity, index) => (
          <ListItem
            key={activity.id}
            disablePadding
            sx={{
              mb: 0.5,
              p: 1,
              borderRadius: '8px',
              bgcolor: activity.done ? '#F0FFF4' : '#FAFAFA',
              border: `1px solid ${activity.done ? '#A5D6A7' : '#EEEEEE'}`,
              cursor: 'pointer',
              transition: 'all 0.15s',
              '&:hover': { bgcolor: activity.done ? '#E8F5E9' : '#F5F5F5' }
            }}
            onClick={() => onChange(index)}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
              {activity.done ? (
                <CheckCircleOutline sx={{ color: '#2E7D32', fontSize: '1.2rem', flexShrink: 0 }} />
              ) : (
                <RadioButtonUnchecked sx={{ color: '#B0BEC5', fontSize: '1.2rem', flexShrink: 0 }} />
              )}
              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: activity.done ? '#2E7D32' : '#455A64',
                  textDecoration: activity.done ? 'line-through' : 'none',
                  fontWeight: activity.done ? 500 : 600,
                  lineHeight: 1.3
                }}
              >
                {activity.label}
              </Typography>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

function TabComentarios({ comments, onSend }) {
  const [text, setText] = useState('');

  function handleSend() {
    if (!text.trim()) {
      return;
    }

    onSend(text.trim());
    setText('');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {comments.length === 0 ? (
          <Typography sx={{ fontSize: '0.82rem', color: '#90A4AE', textAlign: 'center', mt: 4 }}>
            Sin comentarios aún
          </Typography>
        ) : null}

        {comments.map((comment) => (
          <Box key={comment.id} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: comment.avatarColor,
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                {comment.initials}
              </Avatar>
              <Box>
                <Typography
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#263238',
                    lineHeight: 1
                  }}
                >
                  {comment.user}
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#90A4AE' }}>
                  {new Date(comment.date).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                ml: 4.5,
                p: 1.5,
                bgcolor: '#F8FAFC',
                borderRadius: '4px 12px 12px 12px',
                border: '1px solid #E8EDF2'
              }}
            >
              <Typography sx={{ fontSize: '0.82rem', color: '#37474F', lineHeight: 1.5 }}>
                {comment.text}
              </Typography>

              {comment.attachments?.length ? (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {comment.attachments.map((attachment, index) => (
                    <Chip
                      key={`${comment.id}-${index}`}
                      icon={<InsertDriveFile sx={{ fontSize: '0.85rem !important' }} />}
                      label={`${attachment.name} (${attachment.size})`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        bgcolor: '#E3F2FD',
                        color: '#1565C0',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#BBDEFB' }
                      }}
                    />
                  ))}
                </Box>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ p: 1.5, borderTop: '1px solid #EDF2F4', bgcolor: '#F7F9FB' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            bgcolor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            pl: 1.5,
            pr: 0.5,
            py: 0.5
          }}
        >
          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={3}
            placeholder="Escribe un comentario..."
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
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
                    <IconButton
                      size="small"
                      sx={{ color: '#90A4AE', '&:hover': { color: '#607D8B' } }}
                    >
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
              bgcolor: '#1976D2',
              '&:hover': { bgcolor: '#1565C0' },
              '&.Mui-disabled': { bgcolor: '#E0E0E0' },
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

export default function PermitManagerDrawer({ open, item, onClose }) {
  const [activeTab, setActiveTab] = useState(0);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);

  const itemKey = item?.recordId ?? null;

  useEffect(() => {
    if (!item) {
      setComments([]);
      setActivities([]);
      setActiveTab(0);
      return;
    }

    setComments(buildComments(item));
    setActivities(buildActivities(item));
    setActiveTab(0);
  }, [itemKey]);

  const tabItems = useMemo(
    () => [
      { label: 'Detalles', skipTranslation: true },
      { label: 'Actividades', skipTranslation: true },
      { label: 'Comentarios', skipTranslation: true }
    ],
    []
  );

  function handleActivityToggle(index) {
    setActivities((previous) =>
      previous.map((activity, activityIndex) =>
        activityIndex === index ? { ...activity, done: !activity.done } : activity
      )
    );
  }

  function handleSendComment(text) {
    setComments((previous) => [
      ...previous,
      {
        id: `${item.recordId}-${Date.now()}`,
        user: 'Usuario actual',
        initials: 'UA',
        avatarColor: '#00838F',
        date: new Date().toISOString(),
        text,
        attachments: []
      }
    ]);
  }

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
      <AppBar position="static" sx={{ bgcolor: '#00838F' }}>
        <Toolbar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              color="white"
              sx={{
                fontWeight: 800,
                fontSize: '0.95rem',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {item?.tipoPermiso || 'Permiso ambiental'}
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>
              {item?.sede} - {item?.unidad}
            </Typography>
          </Box>
          <IconButton edge="end" onClick={onClose}>
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      <BaseTab
        items={tabItems}
        activeTab={activeTab}
        tabContainerProps={{
          onChange: (_, value) => setActiveTab(value)
        }}
        showBorderBottom
      />

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {activeTab === 0 && item ? (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <TabDetalles item={item} />
          </Box>
        ) : null}
        {activeTab === 1 ? (
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <TabActividades activities={activities} onChange={handleActivityToggle} />
          </Box>
        ) : null}
        {activeTab === 2 ? <TabComentarios comments={comments} onSend={handleSendComment} /> : null}
      </Box>
    </Drawer>
  );
}
