import { NotificationsNone } from '@mui/icons-material';
import { Badge, Box, IconButton, Typography } from '@mui/material';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { headerHeight } from '../config/constants';
import { useLanguage } from '../providers/languageProvider';
import { useNavConfig } from '../hooks/useNavConfig';
import { dashboardMessage } from '../stores/messages/dashboardMessageSlice';
import TheLayoutHeaderActionDropdown from './TheLayoutHeaderActionDropdown';
import { useUnreadMessagesPolling } from '../hooks/useUnreadMessagesPolling';
import { fetchUnreadMessagesCount } from '../stores/messages/unreadMessagesSlice';

const EMPTY_OBJECT = {};

const SYSTEM_MODULES = {
  notifications: { es: 'Centro de Notificaciones', en: 'Notification Center' },
};

function LayoutHeader() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();

  const user = useSelector((state) => state.globalData.userDetails ?? EMPTY_OBJECT);
  const unreadCount = useSelector((state) => state.unreadMessages?.count ?? 0);
  const activeModule = useSelector((state) => state.globalData.activeModule);
  const { workareas, modules } = useNavConfig();

  const { workareaName, moduleName } = useMemo(() => {
    const mod = modules.find((m) => m.routeKey === activeModule);
    const wa = mod ? workareas.find((w) => w.modules?.includes(mod.slug)) : null;
    return {
      workareaName: wa ? (language === 'en' ? wa.name?.en : wa.name?.es) : '',
      moduleName: mod
        ? (language === 'en' ? mod.name?.en : mod.name?.es)
        : (SYSTEM_MODULES[activeModule]?.[language] ?? ''),
    };
  }, [modules, workareas, activeModule, language]);
  const { refreshCount } = useUnreadMessagesPolling(30000, true);

  const isNotificationsActive = location.pathname.includes('/notifications');

  useEffect(() => {
    dispatch(dashboardMessage({}));
    refreshCount();
  }, [location]); // eslint-disable-line

  useEffect(() => {
    const handleMessageCreated = () => {
      dispatch(fetchUnreadMessagesCount('1'));
    };
    window.addEventListener('dashboard-message-created', handleMessageCreated);
    return () => window.removeEventListener('dashboard-message-created', handleMessageCreated);
  }, [dispatch]);

  return (
    <Box
      component="header"
      sx={{
        width: '100%',
        height: headerHeight,
        backgroundColor: '#fff',
        borderBottom: '1px solid rgba(224, 224, 224, 0.7)',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        gap: 1
      }}
    >
      {/* Breadcrumb — left side */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
        {workareaName && (
          <>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {workareaName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>/</Typography>
          </>
        )}
        {moduleName && (
          <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {moduleName}
          </Typography>
        )}
      </Box>
      <IconButton
        aria-label="Notifications"
        sx={{ border: isNotificationsActive ? '1px solid #19aabb' : 'none' }}
        onClick={() => navigate('view/notifications')}
        color={isNotificationsActive ? 'primary' : 'default'}
      >
        <Badge
          badgeContent={unreadCount}
          max={999}
          sx={{ '& .MuiBadge-badge': { backgroundColor: 'rgb(220 38 38)', color: 'white' } }}
        >
          <NotificationsNone />
        </Badge>
      </IconButton>

      <TheLayoutHeaderActionDropdown userDetails={user || {}} />
    </Box>
  );
}

export default LayoutHeader;
