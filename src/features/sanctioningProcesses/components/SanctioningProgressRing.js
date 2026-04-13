import { Box, Typography } from '@mui/material';
import { calculateProgressRing } from '../utils';

function SanctioningProgressRing({ 
  percentage, 
  color = '#006971',
  size = 100,
  strokeWidth = 8
}) {
  const { radius, circumference, center, progressLen, transitionStyle } = 
    calculateProgressRing(size, strokeWidth, percentage);

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      <svg
        style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Fondo Gris */}
        <circle
          stroke="#edf2f4"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeWidth={strokeWidth}
        />
        
        {/* Arco de Progreso */}
        {percentage > 0 && (
          <circle
            stroke={color}
            fill="transparent"
            r={radius}
            cx={center}
            cy={center}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, progressLen)} ${circumference}`}
            style={transitionStyle}
          />
        )}
      </svg>
      
      {/* Porcentaje */}
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '1rem',
            color: color
          }}
        >
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
}

export default SanctioningProgressRing;
