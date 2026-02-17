// src/components/Findings/FindingActionPlansTab.jsx
import { Box, Typography, List, ListItem, ListItemText, Chip } from '@mui/material';

export default function FindingActionPlansTab({ actionPlans, findingId }) {
  if (!actionPlans || actionPlans.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No hay planes de acción registrados
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Planes de Acción ({actionPlans.length})
      </Typography>

      <List>
        {actionPlans.map((plan, index) => (
          <ListItem key={plan.id || index} divider>
            <ListItemText
              primary={plan.action_description || 'Sin descripción'}
              secondary={
                <>
                  <Typography variant="caption" display="block">
                    Responsable: {plan.responsible_name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Revisor: {plan.reviewer_name || 'N/A'}
                  </Typography>
                </>
              }
            />
            <Chip
              label={plan.status || 'Pendiente'}
              size="small"
              color={plan.status === 'Completado' ? 'success' : 'default'}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}