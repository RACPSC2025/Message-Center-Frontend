import { ListAlt } from '@mui/icons-material';
import {
  Box,
  Paper
} from '@mui/material';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import SpeedDialComponent from '../../components/SpeedDialComponent';
import { useHasPermission } from '../../hooks/usePlatformConfig';
import { selectFilterItemValue } from '../../stores/filterSlice';
import CreateRequestDialog from './CreateRequestDialog';
import LegalComunicationsLedger from './LegalComunicationsLedger';

export default function LegalComunications() {
  const [filteredCount, setFilteredCount] = useState(0);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [createDrawerContext, setCreateDrawerContext] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const canCreateRequirement = useHasPermission('legal_matrix', 'create_requirement');
  const idRequisitoActual = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  );
  const selectedView = useSelector(
    (state) =>
      selectFilterItemValue(state, 'legal_comunications', 'selectedLegalComunicationsView') ?? 'list'
  );
  const speedDialActions = [{ icon: <ListAlt />, name: 'new_filing_request' }];

  return (
    <BaseFeaturePageLayout>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 2 }}>
          {selectedView === 'list' ? (
            <LegalComunicationsLedger
              refreshKey={refreshKey}
              onFilteredCountChange={setFilteredCount}
              onOpenCreateRequest={(context = null) => {
                setCreateDrawerContext(context);
                setOpenCreateDrawer(true);
              }}
            />
          ) : (
            <Paper
              elevation={0}
              sx={{
                minHeight: '100%',
                borderRadius: 3,
                border: '1px solid #E7EDF4',
                bgcolor: '#FFFFFF'
              }}
            />
          )}
        </Box>

        {canCreateRequirement && idRequisitoActual && (
          <SpeedDialComponent
            openSpeedDial={openSpeedDial}
            handleCloseSpeedDial={() => setOpenSpeedDial(false)}
            handleOpenSpeedDial={() => setOpenSpeedDial(true)}
            speedDialActions={speedDialActions}
            handleClick={() => {
              setCreateDrawerContext(null);
              setOpenCreateDrawer(true);
            }}
          />
        )}

        <CreateRequestDialog
          open={openCreateDrawer}
          variant="drawer"
          parentContext={createDrawerContext}
          onClose={() => {
            setOpenCreateDrawer(false);
            setCreateDrawerContext(null);
          }}
          onSuccess={() => {
            setOpenCreateDrawer(false);
            setCreateDrawerContext(null);
            setRefreshKey((currentKey) => currentKey + 1);
          }}
        />
      </Box>
    </BaseFeaturePageLayout>
  );
}
