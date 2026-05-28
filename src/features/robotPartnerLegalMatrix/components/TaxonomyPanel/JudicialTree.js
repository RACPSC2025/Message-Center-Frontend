import { Box, Typography, Chip, Divider } from '@mui/material';
import { BalanceRounded } from '@mui/icons-material';

const JudicialTree = ({ data }) => {
  const sections = data.sections ?? [];
  const falla = data.falla ?? [];
  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <BalanceRounded sx={{ fontSize: 14, color: '#ef6c00' }} />
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Documento judicial
        </Typography>
        <Chip label={`${data.total_sections ?? sections.length} secciones`} size="small" sx={{ height: 18, fontSize: 10 }} />
      </Box>

      {(data.radicacion || data.magistrado_ponente) && (
        <Box sx={{ mb: 1, p: 1, backgroundColor: '#fff3e0', borderRadius: 1 }}>
          {data.radicacion && (
            <Typography variant="caption" sx={{ display: 'block', fontSize: 10 }}>
              <strong>Radicación:</strong> {data.radicacion}
            </Typography>
          )}
          {data.magistrado_ponente && (
            <Typography variant="caption" sx={{ display: 'block', fontSize: 10 }}>
              <strong>M. Ponente:</strong> {data.magistrado_ponente}
            </Typography>
          )}
        </Box>
      )}

      {sections.map((sec) => (
        <Box key={sec.name} sx={{ mb: 0.75, pl: 1, borderLeft: '3px solid #ffb74d' }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: '#e65100', display: 'block' }}>
            {sec.name}
          </Typography>
          {sec.content_preview && (
            <Typography variant="caption" sx={{ color: '#757575', fontSize: 10 }}>
              {sec.content_preview}…
            </Typography>
          )}
        </Box>
      ))}

      {falla.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" fontWeight={700} sx={{ color: '#b71c1c', display: 'block', mb: 0.5 }}>
            FALLA
          </Typography>
          {falla.map((item) => (
            <Box key={item.numeral} sx={{ mb: 0.5, pl: 1 }}>
              <Typography variant="caption" sx={{ fontSize: 10 }}>
                <strong>{item.numeral}:</strong> {item.text}
              </Typography>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
};

export default JudicialTree;
