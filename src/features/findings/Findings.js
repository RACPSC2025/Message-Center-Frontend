import React, { useState } from 'react';
import { Box } from '@mui/material';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import ViewControls from '../../components/ViewControls';
import FindingsListView from './views/FindingsListView';
import FindingsReportView from './views/FindingsReportView';
import FindingsHowToView from './views/FindingsHowToView';

const Findings = () => {
  const [selectedView, setSelectedView] = useState('list');
  const viewTabArray = ['list', 'report', 'howto'];

  const changeView = (view) => {
    setSelectedView(view);
  };

  return (
    <BaseFeaturePageLayout>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Tabs para vistas */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: 2,
            paddingTop: 1,
            borderRadius: 1
          }}
        >
          <ViewControls
            viewTabArray={viewTabArray}
            selectedView={selectedView}
            onViewChange={changeView}
          />
        </Box>

        {/* Vistas */}
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
          {selectedView === 'list' && <FindingsListView />}

          {selectedView === 'report' && <FindingsReportView />}

          {selectedView === 'howto' && <FindingsHowToView />}
        </Box>
      </Box>
    </BaseFeaturePageLayout>
  );
};

export default Findings;
