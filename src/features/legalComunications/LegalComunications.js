import { Box } from '@mui/material';
import BaseFeaturePageLayout from '../../components/BaseFeaturePageLayout';
import LegalComunicationsLedger from './LegalComunicationsLedger';

export default function LegalComunications() {
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
          <LegalComunicationsLedger />
        </Box>
      </Box>
    </BaseFeaturePageLayout>
  );
}
