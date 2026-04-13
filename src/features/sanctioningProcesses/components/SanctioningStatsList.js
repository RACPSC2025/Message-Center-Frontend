import { Grid } from '@mui/material';
import SanctioningStatsCard from './SanctioningStatsCard';

function SanctioningStatsList({ 
  stats = [],
  spacing = 3,
  columns = { xs: 12, md: 4 }
}) {
  return (
    <Grid container spacing={spacing} sx={{ mb: 3 }}>
      {stats.map((stat, index) => (
        <Grid item {...columns} key={index}>
          <SanctioningStatsCard
            title={stat.title}
            subtitle={stat.subtitle}
            value={stat.value}
            percentage={stat.percentage}
            color={stat.color}
          />
        </Grid>
      ))}
    </Grid>
  );
}

export default SanctioningStatsList;