import CloseIcon from '@mui/icons-material/Close';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHasPermission, useModuleFeature } from '../../hooks/usePlatformConfig';
import BaseTab from '../../components/BaseTab';
import AnalysisRegulation from '../analysisRegulation/AnalysisRegulation';
import Articles from '../articles/Articles';
import Compliance from '../compliance/Compliance';
import Details from '../details/Details';
import ComunicationsLedger from './ComunicationsLedger';
import { DEFAULT_LEGAL_MATRIX_TAB_ID, LEGAL_MATRIX_TAB_IDS } from './tabIds';
// import Compliance from './Compliance';

export default function OptionsDrawer({
  openOptionsDrawer = false,
  onCloseOptionsDrawer = () => {},
  activeTabId = DEFAULT_LEGAL_MATRIX_TAB_ID,
  setActiveTabId = () => {},
  optinDrawerData = [],
  Title = '',
  onlyShowCreateRequirementTab = false,
  onCreateSuccess = () => {},
  editInitialData = null
}) {
  // const [activeTab, setActiveTab] = useState(0);
  const [loadingAI, setLoadingAI] = useState('not clicked');
  const [anchorEl, setAnchorEl] = useState(null);
  const { t } = useTranslation();
  const [complianceData, setCompliancedata] = useState([]);
  const canCreateArticle = useHasPermission('legal_matrix', 'create_article');
  const canViewAnalysisIa = Boolean(useModuleFeature('legal_matrix', 'analysis_ia'));
  const canViewCompliance = Boolean(useModuleFeature('legal_matrix', 'compliance_view'));

  const handleLexicalInput = (data) => {};

  const handleAIClick = () => {
    setLoadingAI('clicked');
    setTimeout(() => setLoadingAI('loaded'), 2000);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  let tabList = [
    canCreateArticle
      ? {
          id: LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT,
          label: t('create_legal_requirement'),
          component: (
            <Details
              handleMenuOpen={handleMenuOpen}
              optinDrawerData={optinDrawerData}
              setCompliancedata={setCompliancedata}
              complianceData={complianceData}
              onSuccess={onCreateSuccess}
              initialData={editInitialData}
            />
          )
        }
      : null,
    {
      id: LEGAL_MATRIX_TAB_IDS.REGULATORY_COMMUNICATIONS,
      label: t('regulatory_communications'),
      component: (
        <ComunicationsLedger
          optinDrawerData={optinDrawerData}
          setCompliancedata={setCompliancedata}
          complianceData={complianceData}
        />
      )
    },
    canViewAnalysisIa
      ? {
          id: LEGAL_MATRIX_TAB_IDS.ANALYSIS_OF_REGULATION,
          label: t('analysis_of_regulation'),
          component: (
            <AnalysisRegulation
              handleMenuOpen={handleMenuOpen}
              handleAIClick={handleAIClick}
              handleLexicalInput={handleLexicalInput}
              loadingAI={loadingAI}
              optinDrawerData={optinDrawerData}
              setCompliancedata={setCompliancedata}
              complianceData={complianceData}
            />
          )
        }
      : null,
    {
      id: LEGAL_MATRIX_TAB_IDS.ARTICLES,
      label: t('articles'),
      component: (
        <Articles
          optinDrawerData={optinDrawerData}
          setCompliancedata={setCompliancedata}
          complianceData={complianceData}
        />
      )
    },
    canViewCompliance
      ? {
          id: LEGAL_MATRIX_TAB_IDS.COMPLIANCE,
          label: t('compliance'),
          component: (
            <Compliance
              optinDrawerData={optinDrawerData}
              setCompliancedata={setCompliancedata}
              complianceData={complianceData}
            />
          )
        }
      : null
  ].filter(Boolean);

  if (onlyShowCreateRequirementTab) {
    tabList = tabList.filter(tab => tab.id === LEGAL_MATRIX_TAB_IDS.CREATE_LEGAL_REQUIREMENT);
  }

  const fallbackTabId = tabList[0]?.id ?? null;
  const safeActiveTabId = tabList.some((tab) => tab.id === activeTabId) ? activeTabId : fallbackTabId;
  const safeActiveTabIndex = tabList.findIndex((tab) => tab.id === safeActiveTabId);

  useEffect(() => {
    if (safeActiveTabId && activeTabId !== safeActiveTabId) {
      setActiveTabId(safeActiveTabId);
    }
  }, [activeTabId, safeActiveTabId, setActiveTabId]);

  return (
    <>
      <Drawer
        anchor="right"
        open={openOptionsDrawer}
        onClose={() => {
          onCloseOptionsDrawer();
          setLoadingAI('not clicked');
        }}
        PaperProps={{
          sx: {
            maxWidth: '90%',
            width: { sm: '50vw', md: '40vw', lg: '90%' }
          }
        }}
      >
        <AppBar position="static">
          <Toolbar>
            <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
              {Title}
            </Typography>
            <IconButton
              edge="end"
              onClick={() => {
                onCloseOptionsDrawer();
                setLoadingAI('not clicked');
              }}
              aria-label="close"
            >
              <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
          </Toolbar>
        </AppBar>
        <BaseTab
          items={tabList}
          activeTab={Math.max(0, safeActiveTabIndex)}
          tabContainerProps={{
            //sx: { mb: 2 ,
            onChange: (_, newValue) => setActiveTabId(tabList[newValue]?.id)
          }}
        />
        <Box
          display="flex"
          flexDirection="row"
          gap={6}
          sx={{ minHeight: '90vh', overflowY: 'auto', p: 2 }}
        >
          {tabList[Math.max(0, safeActiveTabIndex)]?.component}
        </Box>
      </Drawer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <MenuItem onClick={handleMenuClose}>{t('see_notes')}</MenuItem>
        <MenuItem onClick={handleMenuClose}>{t('Create')}</MenuItem>
      </Menu>
    </>
  );
}