import NatureIcon from '@mui/icons-material/Nature';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export default function AmbientalPermit() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
        color: 'text.secondary'
      }}
    >
      <NatureIcon sx={{ fontSize: 64, opacity: 0.4 }} />
      <Typography variant="h6">{t('ambiental_permit')}</Typography>
    </Box>
  );
}
