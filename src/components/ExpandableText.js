import React, { useState } from 'react';
import { Typography, Link } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ExpandableText = ({ text, maxChars = 100, sx = {} }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  // Si el texto es corto, mostrarlo completo sin botón
  if (text.length <= maxChars) {
    return (
      <Typography variant="body2" sx={sx}>
        {text}
      </Typography>
    );
  }

  // Texto a mostrar según el estado
  const displayText = isExpanded ? text : `${text.substring(0, maxChars)}...`;

  return (
    <Typography variant="body2" sx={sx}>
      {displayText}{' '}
      <Link
        component="button"
        variant="body2"
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{ 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            textDecoration: 'none',
            color: 'primary.main',
            ml: 0.5
        }}
      >
        {isExpanded ? t('show_less') : t('show_more')}
      </Link>
    </Typography>
  );
};

export default ExpandableText;
