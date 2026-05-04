import { useState } from 'react';
import { Box, Menu, MenuItem, Typography } from '@mui/material';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useTranslation } from 'react-i18next';
import { getAPIUrl, shouldShowBackToDashboard } from '../config/constants';
import storage from '../utils/storage';

const TheLayoutHeaderActionDropdown = ({ userDetails }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();
  const showBackToDashboard = shouldShowBackToDashboard();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    storage.clearToken();
    storage.removeSystemToken();
    const apiUrl = getAPIUrl() || '';
    const normalizedBase = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
    window.location.href = `${normalizedBase}login-express/`;
  };

  const handleBackToDashboard = () => {
    const apiUrl = getAPIUrl() || '';
    const normalizedBase = apiUrl.endsWith('/') ? apiUrl : `${apiUrl}/`;
    window.location.href = `${normalizedBase}dashboard`;
  };

  const truncateText = (text, maxLength = 12) =>
    text && text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;

  return (
    <>
      <Box
        sx={{
          maxWidth: '240px',
          height: '100%',
          px: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          outline: 'none',
          border: 'none',
          backgroundColor: 'transparent'
        }}
        component="button"
        onClick={handleClick}
      >
        <AccountCircleOutlinedIcon />
        <Box
          sx={{
            mx: 0.5,
            flex: '1 0',
            minWidth: 0
          }}
          textAlign="left"
        >
          <Typography variant="subtitle2">
            {truncateText(userDetails.fullname)}
          </Typography>
          <Typography variant="body2">
            {truncateText('Superadmin')}
          </Typography>
        </Box>
      </Box>
  
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {showBackToDashboard && (
          <MenuItem onClick={handleBackToDashboard}>{t('BackToDashboard')}</MenuItem>
        )}
        <MenuItem onClick={handleSignOut}>{t('SignOut')}</MenuItem>
      </Menu>
    </>
  );
}
export default TheLayoutHeaderActionDropdown;
