import { Box, Container } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { backgroundColor, headerHeight } from '../config/constants';
import { usePageVisibility } from '../hooks/usePageVisibility';
import { fetchNewMessageCount } from '../stores/globalDataSlice';
import { getPastTimestamp } from '../utils/dateTimeFunctions';
import TheFullPageLoader from './TheFullPageLoader';
import TheLayoutHeader from './TheLayoutHeader';
import Sidebar from './Sidebar';
import FilterSidebar from './FilterSidebar';
import ModuleBand, { MODULE_BAND_HEIGHT } from './ModuleBand';

function Layout({ children }) {
  const isPageVisible = usePageVisibility();
  const timerIdRef = useRef(null);
  const [isPollingEnabled, setIsPollingEnabled] = useState(true);
  const dispatch = useDispatch();
  const [sidebarWidth, setSidebarWidth] = useState(72);
  const [filterSidebarWidth, setFilterSidebarWidth] = useState(40);
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

  const isVisibleFullPageLoader = useSelector((state) => state.globalData.loading);

  useEffect(() => {
    const INTERVAL = 5 * 60 * 1000;

    const pollNewMessages = () => {
      try {
        const INTERVAL_IN_SECONDS = INTERVAL / 1000;
        const ts = getPastTimestamp(INTERVAL_IN_SECONDS, 'second');
        dispatch(fetchNewMessageCount(ts));
      } catch (error) {
        console.error('[Error] Polling new message count failed. Stopped polling.', error);
        setIsPollingEnabled(false);
      }
    };

    const startPolling = () => {
      timerIdRef.current = setInterval(pollNewMessages, INTERVAL);
    };

    const stopPolling = () => {
      clearInterval(timerIdRef.current);
    };

    if (isPageVisible && isPollingEnabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isPageVisible, isPollingEnabled, dispatch]);

  return (
    <Container maxWidth="100vw" disableGutters={true}>
      {isVisibleFullPageLoader ? (
        <TheFullPageLoader />
      ) : (
        <Box
          sx={{
            height: '100%',
            width: '100%',
            background: backgroundColor,
            overflow: 'hidden'
          }}
        >
          <Sidebar onWidthChange={setSidebarWidth} filterPanelExpanded={filterPanelExpanded} />
          <FilterSidebar sidebarWidth={sidebarWidth} onWidthChange={setFilterSidebarWidth} onExpandedChange={setFilterPanelExpanded} />
          <Box
            sx={{
              ml: `${sidebarWidth + filterSidebarWidth}px`,
              width: `calc(100% - ${sidebarWidth + filterSidebarWidth}px)`,
              height: '100%',
              transition: 'margin-left 0.2s ease-in-out, width 0.2s ease-in-out'
            }}
          >
            <TheLayoutHeader />
            <ModuleBand />
            <Box
              component="main"
              sx={{ height: `calc(100vh - ${headerHeight}px - ${MODULE_BAND_HEIGHT}px)`, overflowY: 'auto' }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      )}
    </Container>
  );
}

export default Layout;
