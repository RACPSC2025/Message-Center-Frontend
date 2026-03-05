import { Box, Typography } from '@mui/material';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';

export default function EmptyState({ title, subtitle }) {
  return (
    <Box
      sx={{
        border: '1px dashed #e0e0e0',
        borderRadius: 2,
        p: 6,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 1.25,
        color: '#607d8b'
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#eafcfc'
        }}
      >
        <ChatBubbleOutline sx={{ fontSize: 30, color: '#71e9ec' }} />
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem', color: '#263238', mt: 0.5 }}>
        {title}
      </Typography>
      <Typography sx={{ fontWeight: 500, fontSize: '0.9rem', maxWidth: 420 }}>
        {subtitle}
      </Typography>
    </Box>
  );
}
