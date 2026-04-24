import { Box, Typography } from '@mui/material';

export default function LegalComunications() {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%'
      }}
    >
      <Typography variant="h6" color="text.secondary">
        Comunicaciones Legales
      </Typography>
    </Box>
  );
}
