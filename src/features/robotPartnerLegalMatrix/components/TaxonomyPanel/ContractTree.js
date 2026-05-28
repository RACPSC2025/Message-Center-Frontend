import { Box, Typography, Chip } from '@mui/material';
import { GavelRounded } from '@mui/icons-material';

const ContractTree = ({ data }) => {
  const clauses = data.clauses ?? [];
  return (
    <Box sx={{ px: 1, py: 0.5 }}>
      <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1 }}>
        <GavelRounded sx={{ fontSize: 14, color: '#5c6bc0' }} />
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          Documento contractual
        </Typography>
        <Chip label={`${data.total_clauses ?? clauses.length} cláusulas`} size="small" sx={{ height: 18, fontSize: 10 }} />
      </Box>
      {clauses.map((clause) => (
        <Box
          key={clause.identifier}
          sx={{ mb: 1, p: 1, borderLeft: '3px solid #7986cb', borderRadius: 1, backgroundColor: '#f8f9ff' }}
        >
          <Typography variant="caption" fontWeight={700} sx={{ color: '#3949ab', display: 'block' }}>
            {clause.title}
          </Typography>
          {clause.content_preview && (
            <Typography variant="caption" sx={{ color: '#757575', fontSize: 10 }}>
              {clause.content_preview}…
            </Typography>
          )}
        </Box>
      ))}
      {clauses.length === 0 && (
        <Typography variant="body2" color="text.disabled">Sin cláusulas</Typography>
      )}
    </Box>
  );
};

export default ContractTree;
