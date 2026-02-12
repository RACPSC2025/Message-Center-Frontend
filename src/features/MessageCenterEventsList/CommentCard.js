import { Box, Typography, Avatar, IconButton, Menu, MenuItem, Button } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReplyIcon from '@mui/icons-material/Reply'; // Icono para 'Responder'
// Importar iconos SVG o usar equivalentes de MUI
import AttachmentViewer from './AttachmentViewer'; 
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function CommentCard({ 
  comment, 
  role, // 'Ejecutor' o 'Revisor'
  onEdit, 
  onDelete, 
  onUploadAttachment,
  formatDate
}) {
  // Manejo de menú de acciones ("Más")
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const { t } = useTranslation();

  const styles = {
    card: {
      display: 'flex',
      gap: 2,
      padding: '20px 0',
      borderBottom: '1px solid #e9ecef',
      '&:last-child': { borderBottom: 'none' }
    },
    avatar: {
      width: 44,
      height: 44,
      bgcolor: 'rgba(0, 169, 180, 0.1)',
      color: '#00A9B4',
      fontSize: 16,
      fontWeight: 600,
      border: '1.5px solid #ffffff',
      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
    },
    roleBadge: {
      fontSize: 13,
      fontWeight: 400,
      color: '#6c757d',
      bgcolor: '#f8f9fa',
      padding: '2px 10px',
      borderRadius: '20px',
      border: '1px solid #e9ecef'
    }
  };

  return (
    <Box sx={styles.card}>
      {/* Avatar */}
      <Avatar sx={styles.avatar}>
        {comment.userName.slice(0, 2).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        {/* Meta Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#212529' }}>
            {comment.userName}
          </Typography>
          <Typography sx={styles.roleBadge}>
            {role}
          </Typography>
          {/* Fecha */}
          <Typography sx={{ fontSize: 13, color: '#6c757d', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {/* Icono Fecha */}
            <CalendarTodayIcon sx={{ fontSize: 14 }} />
            {formatDate}
          </Typography>
        </Box>

        {/* Contenido */}
        <Typography sx={{ fontSize: 15, lineHeight: 1.5, color: '#212529', my: 1.5, whiteSpace: 'pre-line' }}>
          {comment.comment}
        </Typography>

        {/* Adjuntos (Reutilizando AttachmentViewer) */}
        {comment.attachment && comment.attachment.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2, mt: 1 }}>
             {comment.attachment.map((att, index) => (
                <AttachmentViewer key={index} attachment={att} />
             ))}
          </Box>
        )}

        {/* Acciones */}
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button 
            startIcon={<AttachFileIcon />} 
            onClick={() => { handleClose(); onUploadAttachment(comment); }}
            sx={{ color: '#6c757d', textTransform: 'none', '&:hover': { bgcolor: '#f8f9fa', color: '#212529' } }}
          >
            {t('up_attachment')}
          </Button>

          {/* Menú desplegable para "Más" */}
          {/* <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
             <MenuItem onClick={() => { handleClose(); onEdit(comment); }}>Editar</MenuItem>
             <MenuItem onClick={() => { handleClose(); onDelete(comment); }}>Eliminar</MenuItem>
             <MenuItem onClick={() => { handleClose(); onUploadAttachment(comment); }}>Subir Adjunto</MenuItem>
          </Menu> */}
        </Box>
      </Box>
    </Box>
  );
}

export default CommentCard;
