import { Box, Typography } from '@mui/material';
import { TableChart, Insights, CalendarMonth, ListAlt, Tune, Dashboard, HelpOutline } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const ViewControls = ({ 
  viewTabArray, 
  selectedView, 
  onViewChange
}) => {
  const { t } = useTranslation();

  // Iconos
  const iconMapping = (viewTab, selectedView) => {
    const color = selectedView === viewTab ? 'warning' : 'action';

    const icons = {
      table:       <TableChart color={color} fontSize="medium" />,
      report:      <Insights color={color} fontSize="medium" />,
      calendar:    <CalendarMonth color={color} fontSize="medium" />,
      list:        <ListAlt color={color} fontSize="medium" />,
      adjustments: <Tune color={color} fontSize="medium" />,
      dashboard:   <Dashboard color={color} fontSize="medium" />,
      howto:       <HelpOutline color={color} fontSize="medium" />
    };

    return icons[viewTab] || null;
  };

  return (
    <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-end', pb: 0.5 }}>
      {viewTabArray.map((viewTab) => {
        const isActive = selectedView === viewTab;

        return (
          <Box
            key={viewTab}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { opacity: 1 }
            }}
            onClick={() => onViewChange(viewTab)}
          >
            {/* Ícono */}
            <Box sx={{ color: isActive ? '#f57c00' : '#b0bec5', mb: 0.2 }}>
              {iconMapping(viewTab, selectedView)}
            </Box>
            
            {/* Texto */}
            <Typography sx={{ 
              fontSize: '0.7rem', 
              fontWeight: 800, 
              color: isActive ? '#263238' : '#b0bec5',
              textTransform: 'capitalize' 
            }}>
              {t(viewTab)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default ViewControls;