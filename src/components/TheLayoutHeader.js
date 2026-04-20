import { ExpandMore, NotificationsNone } from '@mui/icons-material';
import { Badge, Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { headerHeight } from '../config/constants';
import { useLanguage } from '../providers/languageProvider';
import { GlobalConfig } from '../routes/RoutesFile';
import { dashboardMessage } from '../stores/messages/dashboardMessageSlice';
import TheLayoutHeaderActionDropdown from './TheLayoutHeaderActionDropdown';
import { useUnreadMessagesPolling } from '../hooks/useUnreadMessagesPolling';
import { fetchUnreadMessagesCount } from '../stores/messages/unreadMessagesSlice';

function LayoutHeader() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { modulePermissions, moduleGroups } = useContext(GlobalConfig);
  const { language, changeLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('notifications');
  const [anchorEl, setAnchorEl] = useState(null);
  const [groupAnchorEls, setGroupAnchorEls] = useState({});

  const languageLabel = language === 'en' ? 'EN' : 'ES';
  const user = useSelector((state) => state.globalData.userDetails ?? {});
  const unreadCount = useSelector((state) => state.unreadMessages?.count ?? 0);
  const { refreshCount } = useUnreadMessagesPolling(30000, true);

  const permitTabs = modulePermissions?.filter((tabs) => tabs?.visibility !== false);
  const notificationTab = permitTabs?.find((module) => module?.moduleName === 'notifications');

  const activeGroupKey = useMemo(() => {
    if (!moduleGroups?.length || !activeTab) return null;
    const group = moduleGroups.find((g) => g.modules.some((m) => m.key === activeTab));
    return group?.groupKey ?? null;
  }, [moduleGroups, activeTab]);

  const handleGroupClick = (groupKey, event) => {
    setGroupAnchorEls((prev) => ({ ...prev, [groupKey]: event.currentTarget }));
  };

  const handleGroupClose = (groupKey) => {
    setGroupAnchorEls((prev) => ({ ...prev, [groupKey]: null }));
  };

  const handleModuleNavigate = (groupKey, moduleKey) => {
    handleGroupClose(groupKey);
    navigate(`view/${moduleKey}`);
    setActiveTab(moduleKey);
  };

  const handleFetchDashboardMessages = () => {
    dispatch(dashboardMessage({}));
  };

  const handleOpen = (event) => setAnchorEl(event.currentTarget);

  const handleClose = (lang) => {
    setAnchorEl(null);
    if (lang) changeLanguage(lang);
  };

  useEffect(() => {
    const handleMessageCreated = () => {
      console.log('New message created, refreshing unread count');
      dispatch(fetchUnreadMessagesCount('1'));
      if (user?.id_administradores) {
        dispatch(fetchUnreadMessagesCount('1'));
      }
    };
    window.addEventListener('dashboard-message-created', handleMessageCreated);
    return () => window.removeEventListener('dashboard-message-created', handleMessageCreated);
  }, [dispatch, user?.id_administradores]);

  useEffect(() => {
    const { pathname } = location;
    const pathnameArr = pathname.split('/');
    setActiveTab(pathnameArr.pop().trim());
    handleFetchDashboardMessages();
    refreshCount();
  }, [location]);

  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        width: '100%',
        height: headerHeight,
        pl: 2,
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(224, 224, 224, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          display: 'flex',
          height: '100%',
          alignItems: 'flex-end'
        }}
      >
        {(moduleGroups ?? []).map((group) => (
          <Box key={group.groupKey}>
            <Button
              onClick={(e) => handleGroupClick(group.groupKey, e)}
              endIcon={<ExpandMore sx={{ fontSize: '18px !important' }} />}
              sx={{
                height: 48,
                borderRadius: 0,
                px: 2,
                textTransform: 'none',
                fontSize: '0.875rem',
                fontWeight: activeGroupKey === group.groupKey ? 600 : 400,
                borderBottom:
                  activeGroupKey === group.groupKey
                    ? '2px solid #19aabb'
                    : '2px solid transparent',
                color: activeGroupKey === group.groupKey ? '#19aabb' : 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.04)',
                  borderBottomColor:
                    activeGroupKey === group.groupKey ? '#19aabb' : 'rgba(0,0,0,0.2)'
                }
              }}
            >
              {group.title}
            </Button>
            <Menu
              anchorEl={groupAnchorEls[group.groupKey]}
              open={Boolean(groupAnchorEls[group.groupKey])}
              onClose={() => handleGroupClose(group.groupKey)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              slotProps={{ paper: { sx: { minWidth: 220 } } }}
            >
              {group.modules.map((mod) => (
                <MenuItem
                  key={mod.key}
                  onClick={() => handleModuleNavigate(group.groupKey, mod.key)}
                  selected={activeTab === mod.key}
                  sx={{ gap: 1, py: 1 }}
                >
                  {mod.icon}
                  <span>{mod.skipTranslation ? mod.label : t(mod.label)}</span>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ))}
      </Box>

      <Box sx={{ ml: 'auto', mr: '1rem' }}>
        <Button variant="outlined" size="small" onClick={handleOpen}>
          {languageLabel}
          <ExpandMore />
        </Button>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleClose()}>
          <MenuItem onClick={() => handleClose('en')}>{t('english')}</MenuItem>
          <MenuItem onClick={() => handleClose('es')}>{t('spanish')}</MenuItem>
        </Menu>
      </Box>

      {notificationTab && (
        <IconButton
          aria-label="Notifications"
          sx={{
            mr: '1rem',
            border: activeTab === 'notifications' ? '1px solid #19aabb' : 'none'
          }}
          onClick={() => {
            navigate(`view/notifications`);
            setActiveTab('notifications');
          }}
          color={activeTab === 'notifications' ? 'primary' : ''}
        >
          <Badge
            badgeContent={unreadCount}
            max={999}
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'rgb(220 38 38 / var(--tw-bg-opacity, 1))',
                color: 'white'
              }
            }}
          >
            <NotificationsNone />
          </Badge>
        </IconButton>
      )}

      <TheLayoutHeaderActionDropdown userDetails={user || {}} />
    </Box>
  );
}

export default LayoutHeader;
