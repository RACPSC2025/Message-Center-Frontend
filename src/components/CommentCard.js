import {
  Box,
  Typography,
  Avatar,
  Skeleton,
  Button
} from '@mui/material';
import {
  Edit as EditIcon,
  AttachFile as AttachmentIcon,
  CalendarToday as CalendarTodayIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

import { useTranslation } from 'react-i18next';

import { getInitials } from '../utils/others';

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

export default function CommentCard({ comment, onClickEdit, wrapperStyle = {}, loading = false, role = 'otro' }) {
  const { t } = useTranslation();
  
  const handleAttachmentClick = (url) => {
    window.open(url, '_blank');
  };

  const getAttachmentIcon = (filename) => {
    if (!filename) return <AttachmentIcon />;
    
    const extension = filename.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon sx={{ color: '#dc2626' }} />;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return <DescriptionIcon sx={{ color: '#2563eb' }} />;
      default:
        return <AttachmentIcon />;
    }
  };

  const formatDate = comment?.comment_time ? new Date(comment.comment_time).toLocaleDateString() : '';

  return (
    <Box sx={styles.card}>
      {/* Avatar */}
      <Avatar sx={styles.avatar}>
        {loading ? (
          <Skeleton animation="wave" variant="circular" width={44} height={44} />
        ) : (
          getInitials(comment.author_name || t('User'))
        )}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        {/* Meta Header */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 1, mb: 0.5 }}>
          
          {/* Nombre del autor */}
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#212529' }}>
            {loading ? (
              <Skeleton animation="wave" height={20} width="40%" />
            ) : (
              comment.author_name || t('User_Unnamed')
            )}
          </Typography>
          
          {/* Email del autor (si existe) */}
          {comment?.author_email && !loading && (
            <Typography sx={{ fontSize: 13, color: '#6c757d' }}>
              {comment.author_email}
            </Typography>
          )}
          
          {/* Rol */}
          <Typography sx={styles.roleBadge}>
            {loading ? (
              <Skeleton animation="wave" height={16} width="50px" />
            ) : (
              role
            )}
          </Typography>

          {/* Fecha */}
          <Typography sx={{ fontSize: 13, color: '#6c757d', display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {loading ? (
              <Skeleton animation="wave" height={16} width="80px" />
            ) : (
              <>
                <CalendarTodayIcon sx={{ fontSize: 14 }} />
                {formatDate}
              </>
            )}
          </Typography>
        </Box>

        {/* Contenido */}
        <Typography sx={{ fontSize: 15, lineHeight: 1.5, color: '#212529', my: 1.5, whiteSpace: 'pre-line' }}>
          {loading ? (
            <>
              <Skeleton animation="wave" height={20} style={{ marginBottom: 6 }} />
              <Skeleton animation="wave" height={20} width="80%" />
            </>
          ) : (
            comment.comment
          )}
        </Typography>

        {/* Adjuntos */}
        {loading ? (
          <Skeleton animation="wave" height={32} width="120px" sx={{ mt: 1 }} />
        ) : (
          comment?.attachments?.length > 0 && (
            <Box sx={{ mt: 1 }}>
              {comment.attachments.map((attachment, index) => (
                <Button 
                  key={attachment.id || index}
                  startIcon={getAttachmentIcon(attachment.old_filename)}
                  onClick={() => handleAttachmentClick(attachment.path)}
                  sx={{ 
                    color: '#6c757d', 
                    textTransform: 'none', 
                    '&:hover': { bgcolor: '#f8f9fa', color: '#212529' },
                    mr: 1,
                    mb: 1
                  }}
                >
                  {attachment.old_filename || `Adjunto ${index + 1}`}
                </Button>
              ))}
            </Box>
          )
        )}

        {/* Acciones */}
        {loading ? (
          <Skeleton animation="wave" height={32} width="80px" sx={{ mt: 1 }} />
        ) : (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            <Button 
              onClick={onClickEdit}
              startIcon={<EditIcon />}
              sx={{ color: '#6c757d', textTransform: 'none', '&:hover': { bgcolor: '#f8f9fa', color: '#212529' } }}
            >
              {t('edit')}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
