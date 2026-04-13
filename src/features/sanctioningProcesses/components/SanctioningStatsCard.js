import { Box, Paper, Typography } from '@mui/material';
import SanctioningProgressRing from './SanctioningProgressRing';

function SanctioningStatsCard({ 
  title, 
  subtitle, 
  value, 
  percentage, 
  color = '#006971',
  size = 100,
  strokeWidth = 8
}) {

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: '1px solid #edf2f4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        bgcolor: 'white',
        height: '100%'
      }}
    >
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#263238',
            fontSize: '1.1rem',
            lineHeight: 1.2
          }}
        >
          {title}
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            color: '#78909c',
            fontSize: '0.75rem',
            mt: 0.5
          }}
        >
          {subtitle}
        </Typography>
        
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: color,
            fontSize: '2.5rem',
            mt: 1
          }}
        >
          {value}
        </Typography>
      </Box>
      
      <SanctioningProgressRing
        percentage={percentage}
        color={color}
        size={size}
        strokeWidth={strokeWidth}
      />
    </Paper>
  );
}

export default SanctioningStatsCard;
