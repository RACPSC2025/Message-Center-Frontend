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
  moduleLabel,
  date,
  message,
  desc,
  keywordToHighlight = '',
  onClick,
  onCheckChanged,
  onToggleImportant,
  onMarkAsRead,
  onMarkAsUnread,
  status,
  showSelectionCheckbox = false,
  isSelected = false,
  isActive = false,
  isUnread = false,
  isImportant = false,
  targetDate = null
}) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const renderHighlightedText = (text) => {
    const content = String(text || '');
    const keyword = String(keywordToHighlight || '').trim();

    if (!keyword || !content) {
      return content;
    }

    const pattern = new RegExp(`(${escapeRegExp(keyword)})`, 'gi');
    const parts = content.split(pattern);

    return parts.map((part, index) => {
      if (part.toLowerCase() === keyword.toLowerCase()) {
        return (
          <Box
            key={`highlight-${index}`}
            component="mark"
            sx={{
              px: 0.25,
              borderRadius: '2px',
              backgroundColor: '#fff59d',
              color: 'inherit'
            }}
          >
            {part}
          </Box>
        );
      }

      return <span key={`text-${index}`}>{part}</span>;
    });
  };

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
        border: isActive ? `1px solid ${blue[500]}` : '1px solid transparent',
        boxShadow: isActive ? '0px 2px 8px rgba(25, 118, 210, 0.25)' : 'none',
        pt: 0.5,
        pb: 0.5,
        pl: 3.5,
        pr: 1,
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
          '& .hover-buttons': { visibility: 'visible' }
        }
      }}
      onClick={onClick}
    >
      {/* Status bar */}
      {status && (
        <Box sx={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '5px', bgcolor: STATUS_TO_COLOR_MAPPING[status] }} />
      )}

      {/* Checkbox */}
      {showSelectionCheckbox && (
        <Box sx={{ position: 'absolute', left: 10, top: 10, height: '1.5rem', width: '1.5rem' }}>
          <Checkbox
            sx={{ p: 0 }}
            checked={isSelected}
            onChange={(event) => onCheckChanged(event.target.checked)}
            onClick={(event) => event.stopPropagation()}
          />
        </Box>
      )}

      {/* Email state icon — absolute left */}
      <Box sx={{ position: 'absolute', left: 10, top: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {isUnread
          ? <MarkEmailUnreadIcon sx={{ fontSize: 16, color: blue[700] }} />
          : <MailOutlineIcon sx={{ fontSize: 16, color: grey[400] }} />
        }
      </Box>

      {/* Main row: left text + right 3-row column */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 1 }}>

        {/* LEFT — text content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            className="mc-text-overflow"
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 400, display: 'block' }}
          >
            {renderHighlightedText(reviewer)}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: isUnread ? '#1a3a5c' : 'text.primary', fontWeight: 400 }}
          >
            {renderHighlightedText(message)}
          </Typography>
          <Typography
            className="mc-text-overflow"
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 400, display: 'block' }}
          >
            {renderHighlightedText(desc)}
          </Typography>
        </Box>

        {/* RIGHT — 3-row column */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, flexShrink: 0, pt: 0.25 }}>

          {/* Row 1: targetDate + unread dot */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {targetDate && (
              <Typography variant="caption" sx={{ color: 'orange', whiteSpace: 'nowrap', fontWeight: 400 }}>
                {targetDate}
              </Typography>
            )}
            {isUnread && (
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: blue[600], boxShadow: `0 0 0 2px ${blue[100]}`, flexShrink: 0 }} />
            )}
          </Box>

          {/* Row 2: envelope action + flag */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
            {isUnread
              ? onMarkAsRead && (
                  <Tooltip title={t('mark_as_read')}>
                    <IconButton size="small" sx={{ p: 0 }} onClick={handleMarkAsRead}>
                      <DraftsIcon fontSize="small" sx={{ color: blue[600] }} />
                    </IconButton>
                  </Tooltip>
                )
              : onMarkAsUnread && (
                  <Tooltip title={t('mark_as_unread')}>
                    <IconButton size="small" sx={{ p: 0 }} onClick={handleMarkAsUnread}>
                      <MarkEmailUnreadIcon fontSize="small" sx={{ color: grey[600] }} />
                    </IconButton>
                  </Tooltip>
                )
            }

            {isImportant ? (
              <Tooltip title={t('remove_flag')}>
                <IconButton size="small" sx={{ p: 0 }} onClick={(e) => { e.stopPropagation(); onToggleImportant(); }}>
                  <FlagIcon sx={{ color: red[800] }} fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Box className="hover-buttons" sx={{ visibility: 'hidden' }}>
                <Tooltip title={t('add_flag')}>
                  <IconButton size="small" sx={{ p: 0 }} onClick={(e) => { e.stopPropagation(); onToggleImportant(); }}>
                    <FlagOutlinedIcon color="action" fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            <Box className="hover-buttons" sx={{ visibility: 'hidden' }}>
              <Tooltip title={t('more_options')}>
                <IconButton size="small" sx={{ p: 0 }} onClick={handleMenuClick}>
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Row 3: module badge */}
          {moduleLabel && (
            <Typography
              variant="caption"
              sx={{
                px: 0.75,
                py: 0.125,
                borderRadius: '10px',
                border: `1px solid ${blue[300]}`,
                backgroundColor: blue[50],
                color: blue[800],
                fontWeight: 500,
                lineHeight: 1.4,
                whiteSpace: 'nowrap'
              }}
            >
              {moduleLabel}
            </Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{ mt: 0.5 }} />

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