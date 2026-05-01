import { forwardRef } from 'react';
import { Box } from '@mui/material';
import { grey } from '@mui/material/colors';

const BaseFeaturePageLayout = forwardRef(function BaseFeaturePageLayout({ children }, ref) {
  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '100%',
        backgroundColor: grey[100],
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          flexWrap: 'nowrap'
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

export default BaseFeaturePageLayout;
