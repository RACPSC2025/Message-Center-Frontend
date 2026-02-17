// src/components/Findings/FindingAttachmentsTab.jsx
import { Box, Typography, List, ListItem, ListItemText, IconButton } from '@mui/material';
import { Download, Visibility } from '@mui/icons-material';

export default function FindingAttachmentsTab({ attachments, findingId, isEditing }) {
  if (!attachments || attachments.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No hay adjuntos disponibles
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Adjuntos ({attachments.length})
      </Typography>

      <List>
        {attachments.map((attachment, index) => (
          <ListItem
            key={attachment.id || index}
            divider
            secondaryAction={
              <Box>
                <IconButton edge="end">
                  <Visibility />
                </IconButton>
                <IconButton edge="end">
                  <Download />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={attachment.file_name || 'Archivo'}
              secondary={attachment.type || 'Tipo desconocido'}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}