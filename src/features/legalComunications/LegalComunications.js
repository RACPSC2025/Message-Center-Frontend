import { CheckCircle, Insights, ListAlt } from '@mui/icons-material';
import {
  Box,
  Paper,
  Typography
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
  const [selectedView, setSelectedView] = useState('list');
  const [filteredCount, setFilteredCount] = useState(0);
  const [openSpeedDial, setOpenSpeedDial] = useState(false);
  const [openCreateDrawer, setOpenCreateDrawer] = useState(false);
  const [createDrawerContext, setCreateDrawerContext] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const canCreateRequirement = useHasPermission('legal_matrix', 'create_requirement');
  const idRequisitoActual = useSelector((state) =>
    selectFilterItemValue(state, 'LegalMatriz', 'id_requisito_actual')
  );

  const viewTabs = [
    { id: 'list', label: 'Lista', Icon: ListAlt },
    { id: 'report', label: 'Reporte', Icon: Insights }
  ];
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            px: { xs: 2, md: 3 },
            py: 1,
            bgcolor: '#FFFFFF',
            borderBottom: '1px solid #EDF2F4',
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, ml: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircle sx={{ fontSize: '1.1rem', color: 'text.secondary' }} />
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  fontSize: '0.98rem',
                  fontStyle: 'italic',
                  whiteSpace: 'nowrap'
                }}
              >
                {filteredCount} comunicacion{filteredCount !== 1 ? 'es' : ''} encontrada
                {filteredCount !== 1 ? 's' : ''}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 3.5, alignItems: 'flex-end', pb: 0.5 }}>
              {viewTabs.map(({ id, label, Icon }) => {
                const isActive = selectedView === id;

                return (
                  <Box
                    key={id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { opacity: 1 }
                    }}
                    onClick={() => setSelectedView(id)}
                  >
                    <Box sx={{ color: isActive ? '#F57C00' : '#B0BEC5', mb: 0.2 }}>
                      <Icon color={isActive ? 'warning' : 'action'} fontSize="medium" />
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        color: isActive ? '#263238' : '#B0BEC5',
                        textTransform: 'capitalize'
                      }}
                    >
                      {label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>

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
