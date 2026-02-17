import FlagIcon from '@mui/icons-material/Flag';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread';
import DraftsIcon from '@mui/icons-material/Drafts';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box, Checkbox, Divider, IconButton, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import { red, blue, grey } from '@mui/material/colors';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { backgroundColor, STATUS_TO_COLOR_MAPPING } from '../config/constants';

function MessageCenterCardItem({
  reviewer,
  date,
  message,
  desc,
  onClick,
  onCheckChanged,
  onToggleImportant,
  onMarkAsRead,
  onMarkAsUnread,
  status,
  isSelected = false,
  isActive = false,
  isUnread = false,
  isImportant = false,
  targetDate = null
}) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
  };

  const handleMarkAsRead = (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    setTimeout(() => {
      if (onMarkAsRead) {
        onMarkAsRead();
      }
    }, 0);
  };

  const handleMarkAsUnread = (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    setTimeout(() => {
      if (onMarkAsUnread) {
        onMarkAsUnread();
      }
    }, 0);
  };

  const handleToggleImportant = (event) => {
    event.stopPropagation();
    handleMenuClose();
    
    setTimeout(() => {
      onToggleImportant();
    }, 0);
  };

  return (
    <Box
      sx={{
        cursor: 'pointer',
        position: 'relative',
        bgcolor: isActive 
          ? 'blue2.main' 
          : isUnread 
            ? 'rgba(25, 118, 210, 0.08)'
            : backgroundColor,
        pt: 0.5,
        pl: 3.5,
        transition: 'all 0.3s ease',
        borderLeft: isUnread ? `3px solid ${blue[500]}` : 'none',
        '&:hover': {
          bgcolor: isActive 
            ? 'blue2.main' 
            : isUnread 
              ? 'rgba(25, 118, 210, 0.12)' 
              : 'rgba(200, 200, 200, 0.2)',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          zIndex: 1,
          '& .hover-buttons': {
            visibility: 'visible'
          }
        }
      }}
      onClick={onClick}
    >
      {/* Status bar */}
      {status && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: '5px',
            bgcolor: STATUS_TO_COLOR_MAPPING[status]
          }}
        />
      )}

      {/* Checkbox */}
      <Box
        sx={{
          position: 'absolute',
          left: 10,
          top: 10,
          height: '1.5rem',
          width: '1.5rem'
        }}
      >
        <Checkbox
          sx={{
            p: 0
          }}
          checked={isSelected}
          onChange={(event) => {
            onCheckChanged(event.target.checked);
          }}
          onClick={(event) => {
            event.stopPropagation();
          }}
        />
      </Box>

      {/* Ícono de estado de lectura */}
      <Box
        sx={{
          position: 'absolute',
          left: 10,
          top: 32,
          height: '1rem',
          width: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {isUnread ? (
          <MarkEmailUnreadIcon 
            sx={{ 
              fontSize: 16,
              color: blue[700]
            }} 
          />
        ) : (
          <MailOutlineIcon 
            sx={{ 
              fontSize: 16,
              color: grey[400]
            }} 
          />
        )}
      </Box>

      {/* Container for reviewer and date */}
      <Box sx={{ width: '100%', pr: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ flex: '1 0 50%', minWidth: 0 }}>
            <Typography 
              className="mc-text-overflow" 
              variant="caption" 
              color="text.primary"
              fontWeight={isUnread ? 700 : 400}
              sx={{
                color: isUnread ? blue[900] : 'text.primary'
              }}
            >
              {reviewer}
            </Typography>
          </Box>

          {targetDate && (
            <Typography variant="caption" fontWeight="bold" sx={{ color: 'orange' }}>
              {targetDate}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Typography
            variant="body1"
            color="text.primary"
            fontWeight={isUnread ? 'bold' : 'normal'}
            sx={{
              color: isUnread ? blue[900] : 'text.primary',
              flex: 1,
              mr: 1
            }}
          >
            {message}
          </Typography>
          
          {/* 🔹 Action buttons container - SIEMPRE VISIBLE */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 0.5
            }}
          >
            {/* 🔹 Botón de estado de lectura - SIEMPRE VISIBLE */}
            {isUnread ? (
              // Si NO está leído → mostrar botón "marcar como leído"
              onMarkAsRead && (
                <Tooltip title={t('mark_as_read')}>
                  <IconButton
                    size="small"
                    sx={{ p: 0 }}
                    onClick={handleMarkAsRead}
                  >
                    <DraftsIcon fontSize="small" sx={{ color: blue[600] }} />
                  </IconButton>
                </Tooltip>
              )
            ) : (
              // Si SÍ está leído → mostrar botón "marcar como no leído"
              onMarkAsUnread && (
                <Tooltip title={t('mark_as_unread')}>
                  <IconButton
                    size="small"
                    sx={{ p: 0 }}
                    onClick={handleMarkAsUnread}
                  >
                    <MarkEmailUnreadIcon fontSize="small" sx={{ color: grey[600] }} />
                  </IconButton>
                </Tooltip>
              )
            )}

            {/* 🔹 Botón de flag - SIEMPRE VISIBLE si es importante */}
            {isImportant && (
              <Tooltip title={t('remove_flag')}>
                <IconButton
                  size="small"
                  sx={{ p: 0 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleImportant();
                  }}
                >
                  <FlagIcon sx={{ color: red[800] }} fontSize="small" />
                </IconButton>
              </Tooltip>
            )}

            {/* 🔹 Botones que aparecen solo en hover */}
            <Box
              className="hover-buttons"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                visibility: 'hidden'
              }}
            >
              {/* Botón de flag cuando NO es importante - solo en hover */}
              {!isImportant && (
                <Tooltip title={t('add_flag')}>
                  <IconButton
                    size="small"
                    sx={{ p: 0 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleImportant();
                    }}
                  >
                    <FlagOutlinedIcon color="action" fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Botón de menú contextual - solo en hover */}
              <Tooltip title={t('more_options')}>
                <IconButton
                  size="small"
                  sx={{ p: 0 }}
                  onClick={handleMenuClick}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
              {/* Punto azul indicador de no leído: se muestra siempre, después de los botones hover */}
              {isUnread && (
                <Box
                  sx={{
                    position: 'absolute',
                    // colocar a la derecha del contenido de acciones para no solapar checkbox
                    right: 8,
                    top: 12,
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    bgcolor: blue[600],
                    boxShadow: `0 0 0 2px ${blue[100]}`
                  }}
                />
              )}
          </Box>
        </Box>

        
      {/* Punto azul indicador de no leído: movido para mostrarse después de los botones hover */}

        <Typography 
          className="mc-text-overflow" 
          variant="body1" 
          fontWeight={isUnread ? 500 : 400}
          sx={{
            color: isUnread ? blue[900] : 'text.secondary'
          }}
        >
          {desc}
        </Typography>
      </Box>

      <Divider sx={{ mt: 1 }} />

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        disableAutoFocusItem
        disableEnforceFocus
      >
        {isUnread && onMarkAsRead && (
          <MenuItem onClick={handleMarkAsRead}>
            <DraftsIcon fontSize="small" sx={{ mr: 1, color: blue[600] }} />
            {t('mark_as_read')}
          </MenuItem>
        )}
        
        {!isUnread && onMarkAsUnread && (
          <MenuItem onClick={handleMarkAsUnread}>
            <MarkEmailUnreadIcon fontSize="small" sx={{ mr: 1, color: blue[600] }} />
            {t('mark_as_unread')}
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleToggleImportant}>
          {isImportant ? (
            <>
              <FlagOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
              {t('remove_flag')}
            </>
          ) : (
            <>
              <FlagIcon fontSize="small" sx={{ mr: 1, color: red[800] }} />
              {t('add_flag')}
            </>
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default MessageCenterCardItem;