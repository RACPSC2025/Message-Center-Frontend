import React, { useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  LockOpen,
  Lock,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  Visibility,
  Edit,
  Psychology,
  Filter5,
  History,
  PictureAsPdf,
  Delete,
  Inbox,
  CloudUpload,
  ImageNotSupported
} from '@mui/icons-material';
import ActionsDrawer from './ActionsDrawer';
import dayjs from 'dayjs';

const statusStyles = {
  vencida: {
    headerBg: '#fee2e2',
    headerColor: '#991b1b',
    accentBorder: '#ef4444'
  },
  proceso: {
    headerBg: '#fef3c7',
    headerColor: '#b45309',
    accentBorder: '#f59e0b'
  },
  abierta: {
    headerBg: '#f3f4f6',
    headerColor: '#1f2937',
    accentBorder: '#6b7280'
  },
  cerrada: {
    headerBg: '#dcfce7',
    headerColor: '#166534',
    accentBorder: '#22c55e'
  }
};

const ImageCarousel = ({ images = [] }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  const hasImages = images && images.length > 0;
  const currentImage = hasImages ? images[currentIdx] : null;

  const handlePrevious = (e) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentIdx((prev) => (prev - 1 + images.length) % images.length);
      setImageError(false);
    }
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (hasImages) {
      setCurrentIdx((prev) => (prev + 1) % images.length);
      setImageError(false);
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        overflow: 'hidden',
        bgcolor: '#f1f5f9'
      }}
    >
      {hasImages && !imageError ? (
        <Box
          component="img"
          src={currentImage?.url || currentImage}
          alt={currentImage?.name || ''}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onError={() => setImageError(true)}
        />
      ) : (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#eef2f6',
            color: '#5f7f9c',
            gap: 1
          }}
        >
          <ImageNotSupported sx={{ fontSize: 24 }} />
          <Typography
            variant="caption"
            sx={{
              bgcolor: 'rgba(0,0,0,0.05)',
              px: 0.75,
              py: 0.15,
              borderRadius: 40,
              fontWeight: 500,
              fontSize: '0.6rem'
            }}
          >
            Sin evidencia
          </Typography>
        </Box>
      )}

      {hasImages && images.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            size="small"
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(4px)',
              width: 28,
              height: 28,
              borderRadius: 40,
              color: '#1f4e6e',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'white',
                transform: 'translateY(-50%) scale(1.02)'
              }
            }}
          >
            <ChevronLeft sx={{ fontSize: 14 }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            size="small"
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(4px)',
              width: 28,
              height: 28,
              borderRadius: 40,
              color: '#1f4e6e',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              '&:hover': {
                bgcolor: 'white',
                transform: 'translateY(-50%) scale(1.02)'
              }
            }}
          >
            <ChevronRight sx={{ fontSize: 14 }} />
          </IconButton>

          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 0.75
            }}
          >
            {images.map((_, i) => (
              <Box
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIdx(i);
                  setImageError(false);
                }}
                sx={{
                  width: i === currentIdx ? 16 : 5,
                  height: 5,
                  bgcolor: i === currentIdx ? '#1e6f5c' : 'rgba(255,255,255,0.7)',
                  borderRadius: i === currentIdx ? 16 : '50%',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  );
};

const FindingCard = ({
  finding,
  onView,
  onEdit,
  onFiveWhys,
  onCauseAnalysis,
  onChangeHistory,
  onExportPdf,
  onDelete,
  onUploadEvidence,
  onFollowUp
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [actionsDrawerOpen, setActionsDrawerOpen] = useState(false);

  const statusMap = {
    '1': 'abierta',
    '2': 'proceso',
    '3': 'cerrada',
    '4': 'vencida'
  };
  const statusKey = statusMap[finding.status] || 'abierta';
  const styles = statusStyles[statusKey];
  const isLocked = statusKey === 'cerrada';

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event) => {
    if (event) event.stopPropagation();
    setAnchorEl(null);
  };

  const handleAction = (action) => {
    handleClose();
    switch (action) {
      case 'view':
        onView?.(finding);
        break;
      case 'edit':
        onEdit?.(finding);
        break;
      case 'five-whys':
        onFiveWhys?.(finding);
        break;
      case 'cause-analysis':
        onCauseAnalysis?.(finding);
        break;
      case 'history':
        onChangeHistory?.(finding);
        break;
      case 'pdf':
        onExportPdf?.(finding);
        break;
      case 'delete':
        onDelete?.(finding);
        break;
      default:
        break;
    }
  };

  const createdDate = dayjs(finding.created_at);
  const monthNames = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic'
  ];
  const day = createdDate.isValid() ? createdDate.format('DD') : '--';
  const month = createdDate.isValid() ? monthNames[createdDate.month()] : '---';
  const year = createdDate.isValid() ? createdDate.format('YYYY') : '----';

  const titulo = finding.finding_source_name || 'Sin fuente';
  const registro = finding.reporter_name || 'Sin registro';
  const compania = finding.business_name || 'Sin compañía';
  const reporto = finding.reporter_name || 'Sin registro';
  const preview = finding.brief_description
    ? finding.brief_description.length > 120
      ? `${finding.brief_description.substring(0, 120)}...`
      : finding.brief_description
    : '';
  const imagenes = finding.attachments || [];
  const acciones = finding.action_plans_count || 0;
  const id = finding.id;

  return (
    <Card
      sx={{
        borderRadius: 5,
        boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.02)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 32px -12px rgba(0, 0, 0, 0.12)'
        }
      }}
    >
      {/* Header con color según estado */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 2,
          py: 0.85,
          bgcolor: styles.headerBg,
          color: styles.headerColor,
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, flexWrap: 'wrap' }}>
          <Box
            sx={{
              bgcolor: 'rgba(255,255,255,0.7)',
              px: 0.6,
              py: 0.15,
              borderRadius: 40,
              fontWeight: 600,
              fontSize: '0.7rem'
            }}
          >
            {id}
          </Box>
          <Typography sx={{ fontWeight: 600, fontSize: '0.78rem' }}>{titulo}</Typography>
        </Box>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onFollowUp?.(finding);
          }}
          sx={{
            bgcolor: 'rgba(255,255,255,0.6)',
            width: 26,
            height: 26,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
          }}
        >
          {isLocked ? <Lock sx={{ fontSize: 14 }} /> : <LockOpen sx={{ fontSize: 14 }} />}
        </Box>
      </Box>

      {/* Carrusel de imágenes */}
      <ImageCarousel images={imagenes} />

      {/* Cuerpo principal */}
      <Box
        sx={{
          p: 1.75,
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: 1.25,
          alignItems: 'start',
          bgcolor: '#ffffff'
        }}
      >
        {/* Fecha vertical */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            textAlign: 'center',
            bgcolor: '#f9fafc',
            p: '0.35rem 0.25rem',
            borderRadius: 2,
            minWidth: 52
          }}
        >
          <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: '#1f3e48' }}>
            {day}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.6rem',
              fontWeight: 500,
              color: '#6c7e8f',
              textTransform: 'uppercase',
              mt: 0.35
            }}
          >
            {month} {year}
          </Typography>
        </Box>

        {/* Info central */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {/* Fuente */}
          <Typography
            sx={{
              fontSize: '0.95rem',
              fontWeight: 700,
              color: '#0b2b34',
              letterSpacing: '-0.2px',
              lineHeight: 1.2
            }}
          >
            {titulo}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {registro && (
              <Box
                sx={{
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.3,
                  flexWrap: 'wrap',
                  bgcolor: '#fafcff',
                  px: 0.5,
                  py: 0.15,
                  borderRadius: 20
                }}
              >
                <Typography sx={{ fontWeight: 600, color: '#3f5c6b' }}>Registró</Typography>

                <Typography sx={{ fontWeight: 500, color: '#1e2f3a' }}>{registro}</Typography>
              </Box>
            )}

            {compania && (
              <Box
                sx={{
                  fontSize: '0.65rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.3,
                  flexWrap: 'wrap',
                  bgcolor: '#fafcff',
                  px: 0.5,
                  py: 0.15,
                  borderRadius: 20
                }}
              >
                <Typography sx={{ fontWeight: 600, color: '#3f5c6b' }}>Compañía</Typography>

                <Typography sx={{ fontWeight: 500, color: '#1e2f3a' }}>{compania}</Typography>
              </Box>
            )}

            {reporto && (
              <Box
                sx={{
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 0.5,
                  flexWrap: 'wrap',
                  bgcolor: '#fafcff',
                  px: 0.5,
                  py: 0.15
                }}
              >
                <Typography sx={{ fontWeight: 600, color: '#3f5c6b' }}>Reportó</Typography>

                <Typography sx={{ fontWeight: 500, color: '#1e2f3a' }}>{reporto}</Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Kebab menu */}
        <Box>
          <IconButton
            onClick={handleClick}
            sx={{
              bgcolor: '#f1f5f9',
              width: 30,
              height: 30,
              borderRadius: 10,
              color: '#2d4f6e',
              '&:hover': { bgcolor: '#e2e8f0' }
            }}
          >
            <MoreVert sx={{ fontSize: 16 }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              sx: {
                borderRadius: 2,
                boxShadow: '0 16px 28px -8px rgba(0, 0, 0, 0.15)',
                minWidth: 220,
                p: 0.4
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => handleAction('view')} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <Visibility fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Ver Información"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <MenuItem onClick={() => handleAction('edit')} disabled={isLocked} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <Edit fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Editar Hallazgo"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => handleAction('five-whys')} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <Filter5 fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Análisis de 5 porqués"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <MenuItem onClick={() => handleAction('cause-analysis')} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <Psychology fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Análisis de causas"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <MenuItem onClick={() => handleAction('history')} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <History fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Historial de cambios"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => handleAction('pdf')} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <PictureAsPdf fontSize="small" sx={{ color: '#254e6b' }} />
              </ListItemIcon>
              <ListItemText
                primary="Descargar ficha PDF"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500 }}
              />
            </MenuItem>

            <Divider />

            <MenuItem onClick={() => handleAction('delete')} disabled={isLocked} sx={{ py: 0.6 }}>
              <ListItemIcon>
                <Delete fontSize="small" sx={{ color: '#ef4444' }} />
              </ListItemIcon>
              <ListItemText
                primary="Eliminar hallazgo"
                primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: 500, color: '#ef4444' }}
              />
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box
        sx={{
          px: 2,
          mb: 1.75
        }}
      >
        <Typography
          sx={{
            fontSize: '0.68rem',
            color: '#334e68',
            bgcolor: '#f9fbfd',
            p: '0.5rem 0.75rem',
            borderRadius: 1,
            borderLeft: '3px solid #2c7da0',
            lineHeight: 1.4
          }}
        >
          {preview}
        </Typography>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          bgcolor: '#f1f5f9',
          borderTop: '1px solid #eef2f8',
          px: 2,
          py: 0.65,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box
          onClick={(e) => {
            e.stopPropagation();
            setActionsDrawerOpen(true);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: '#ecfdf5',
            px: 0.75,
            py: 0.15,
            borderRadius: 40,
            color: '#0f6e4a',
            fontWeight: 500,
            fontSize: '0.65rem',
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              bgcolor: '#d1fae5'
            }
          }}
        >
          <Inbox sx={{ fontSize: 12 }} />
          <Typography>({acciones}) acciones</Typography>
        </Box>
        <Box
          onClick={(e) => {
            e.stopPropagation();
            onUploadEvidence?.(finding);
          }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: '#ffffff',
            border: '1px solid #dfe7ef',
            borderRadius: 60,
            px: 0.75,
            py: 0.15,
            cursor: 'pointer',
            transition: '0.2s',
            color: '#2b6a8c',
            fontSize: '0.65rem',
            fontWeight: 500,
            '&:hover': {
              bgcolor: '#f0f7fc',
              borderColor: '#2b6a8c'
            }
          }}
        >
          <CloudUpload sx={{ fontSize: 12 }} />
          <Typography>Subir evidencia</Typography>
        </Box>
      </Box>

      <ActionsDrawer
        open={actionsDrawerOpen}
        finding={finding}
        onClose={() => setActionsDrawerOpen(false)}
      />
    </Card>
  );
};

export default FindingCard;
