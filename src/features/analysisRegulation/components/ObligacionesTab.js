import { useState } from 'react';
import {
  Box, Typography, Chip, Button, CircularProgress,
  Alert, Collapse, Divider, Tooltip,
} from '@mui/material';
import {
  GavelRounded, ExpandMore, ExpandLess, PlayArrowRounded,
} from '@mui/icons-material';
import { getToken } from '../../../lib/iaApi';

const getBaseUrl = () =>
  (window.__APP_CONFIG__?.api_url_ia || 'http://localhost:8000/').replace(/\/$/, '');

async function analyzeObligations(source) {
  const token = await getToken();
  if (!token) throw new Error('No autenticado');
  const params = new URLSearchParams({ source });
  const res = await fetch(`${getBaseUrl()}/v1/documents/obligations/analyze?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Error ${res.status}`);
  return data;
}

const PRIORITY_SX = {
  Alta:  { backgroundColor: '#fdecea', color: '#c62828' },
  Media: { backgroundColor: '#fff8e1', color: '#e65100' },
  Baja:  { backgroundColor: '#e8f5e9', color: '#2e7d32' },
};

function ObligationRow({ item }) {
  const [expanded, setExpanded] = useState(false);
  const a = item.analysis;

  return (
    <>
      <Box
        display="flex" alignItems="flex-start" gap={1}
        sx={{
          py: 1, px: 1, borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
          '&:hover': { backgroundColor: '#fafafa' },
          opacity: a.is_valid ? 1 : 0.5,
        }}
        onClick={() => setExpanded(p => !p)}
      >
        {/* Artículo */}
        <Typography
          variant="caption"
          fontWeight={700}
          sx={{ color: '#1565c0', minWidth: 110, flexShrink: 0, pt: 0.25 }}
        >
          {item.section_id}
        </Typography>

        {/* Descripción */}
        <Typography variant="caption" sx={{ flex: 1, color: '#424242', pt: 0.25 }}>
          {a.description}
          {!a.is_valid && (
            <Typography component="span" variant="caption" color="error" sx={{ ml: 0.5 }}>
              (extracción fallida)
            </Typography>
          )}
        </Typography>

        {/* Sujeto */}
        <Typography variant="caption" sx={{ minWidth: 90, flexShrink: 0, color: '#616161', pt: 0.25 }}>
          {a.subject}
        </Typography>

        {/* Plazo */}
        <Typography variant="caption" sx={{ minWidth: 80, flexShrink: 0, color: '#616161', pt: 0.25 }}>
          {a.deadline}
        </Typography>

        {/* Prioridad */}
        <Chip
          label={a.priority}
          size="small"
          sx={{
            height: 18, fontSize: 10, flexShrink: 0,
            ...(PRIORITY_SX[a.priority] || {}),
          }}
        />

        {/* Prob */}
        <Typography variant="caption" sx={{ minWidth: 36, flexShrink: 0, color: '#9e9e9e', textAlign: 'right', pt: 0.25 }}>
          {(a.prob_task * 100).toFixed(0)}%
        </Typography>

        {/* Pág */}
        <Typography variant="caption" sx={{ minWidth: 30, flexShrink: 0, color: '#bdbdbd', textAlign: 'right', pt: 0.25 }}>
          {a.page_start === a.page_end ? a.page_start : `${a.page_start}–${a.page_end}`}
        </Typography>

        {expanded ? <ExpandLess sx={{ fontSize: 16, flexShrink: 0 }} /> : <ExpandMore sx={{ fontSize: 16, flexShrink: 0 }} />}
      </Box>

      <Collapse in={expanded} unmountOnExit>
        <Box sx={{ px: 2, py: 1.5, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="caption" fontWeight={700} sx={{ color: '#9e9e9e', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 0.5 }}>
            Texto original — pág. {a.page_start}{a.page_start !== a.page_end ? `–${a.page_end}` : ''}
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: '0.78rem', color: '#212121' }}>
            {a.original_content}
          </Typography>
          {a.tables_count > 0 && (
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#9e9e9e' }}>
              {a.tables_count} tabla{a.tables_count !== 1 ? 's' : ''} detectada{a.tables_count !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Collapse>
    </>
  );
}

const ObligacionesTab = ({ source }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await analyzeObligations(source);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!source) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={1}>
        <GavelRounded sx={{ fontSize: 48, color: '#bdbdbd' }} />
        <Typography variant="body2" color="text.disabled">
          Carga un PDF para analizar sus obligaciones
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '560px', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Box display="flex" alignItems="center" gap={1}>
          <GavelRounded color="primary" sx={{ fontSize: 18 }} />
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Análisis de obligaciones
          </Typography>
          {data && (
            <Chip
              label={`${data.total_obligations} obligaciones`}
              size="small" color="primary" variant="outlined"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>
        <Tooltip title="El análisis usa LLM — puede tardar 5–30 seg según el documento">
          <span>
            <Button
              size="small"
              variant="contained"
              startIcon={loading ? <CircularProgress size={14} sx={{ color: 'white' }} /> : <PlayArrowRounded />}
              disabled={loading}
              onClick={handleAnalyze}
              sx={{ fontSize: 11 }}
            >
              {loading ? 'Analizando...' : data ? 'Re-analizar' : 'Analizar'}
            </Button>
          </span>
        </Tooltip>
      </Box>

      <Divider sx={{ mb: 1 }} />

      {/* Estados */}
      {loading && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={2}>
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Procesando artículos con LLM...
          </Typography>
          <Typography variant="caption" color="text.disabled">
            El backend analiza 3 artículos en paralelo. Puede tardar hasta 30 seg.
          </Typography>
        </Box>
      )}

      {error && !loading && (
        <Alert severity="error" sx={{ fontSize: '0.8rem', mb: 1 }}>{error}</Alert>
      )}

      {!data && !loading && !error && (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={6} gap={1}>
          <Typography variant="body2" color="text.disabled">
            Presiona &quot;Analizar&quot; para identificar obligaciones legales en el documento
          </Typography>
        </Box>
      )}

      {/* Tabla de obligaciones */}
      {data && !loading && (
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {/* Header columnas */}
          <Box
            display="flex" gap={1}
            sx={{ px: 1, py: 0.5, backgroundColor: '#f5f5f5', borderBottom: '2px solid #e0e0e0', position: 'sticky', top: 0, zIndex: 1 }}
          >
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 110, flexShrink: 0, color: '#616161' }}>Artículo</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ flex: 1, color: '#616161' }}>Descripción</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 90, flexShrink: 0, color: '#616161' }}>Sujeto</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 80, flexShrink: 0, color: '#616161' }}>Plazo</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 60, flexShrink: 0, color: '#616161' }}>Prioridad</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 36, flexShrink: 0, color: '#616161', textAlign: 'right' }}>Prob.</Typography>
            <Typography variant="caption" fontWeight={700} sx={{ minWidth: 30, flexShrink: 0, color: '#616161', textAlign: 'right' }}>Pág.</Typography>
            <Box sx={{ width: 16, flexShrink: 0 }} />
          </Box>

          {data.items.map((item, i) => (
            <ObligationRow key={item.section_id ?? i} item={item} />
          ))}

          {data.items.length === 0 && (
            <Box display="flex" justifyContent="center" py={4}>
              <Typography variant="body2" color="text.disabled">No se encontraron obligaciones</Typography>
            </Box>
          )}

          <Typography variant="caption" sx={{ display: 'block', px: 1, py: 1, color: '#bdbdbd' }}>
            Modelo: {data.model_used?.split('/').pop() ?? data.model_used}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ObligacionesTab;
