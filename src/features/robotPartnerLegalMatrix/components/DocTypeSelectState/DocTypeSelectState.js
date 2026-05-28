import { useState } from 'react';
import {
  Box, Typography, Button, Card, CardActionArea,
  CardContent, Chip,
} from '@mui/material';
import {
  GavelRounded, AccountBalanceRounded,
  AutoAwesomeRounded, ArrowForwardRounded,
} from '@mui/icons-material';
import PDFViewerComponent from '../../../../components/Input/lexicalWYSWYG/PDFViewerComponent';

const DOC_TYPE_OPTIONS = [
  {
    id: 'general',
    label: 'Normativa General',
    icon: <GavelRounded sx={{ fontSize: 28, color: '#1565c0' }} />,
    description: 'Aplica a toda la organización (leyes, decretos, resoluciones generales)',
    color: '#e3f2fd',
    border: '#1565c0',
    docType: 'normativo',
    requisitoGeneral: '1',
  },
  {
    id: 'especifica',
    label: 'Normativa Específica',
    icon: <AccountBalanceRounded sx={{ fontSize: 28, color: '#1b5e20' }} />,
    description: 'Aplica a una planta, negocio o nivel organizacional concreto',
    color: '#e8f5e9',
    border: '#2e7d32',
    docType: 'normativo',
    requisitoGeneral: '0',
  },
  {
    id: 'auto',
    label: 'Detectar automáticamente',
    icon: <AutoAwesomeRounded sx={{ fontSize: 28, color: '#757575' }} />,
    description: 'El backend intenta determinar el alcance del documento',
    color: '#f5f5f5',
    border: '#bdbdbd',
    docType: null,
    requisitoGeneral: null,
    experimental: true,
  },
];

const NONE = Symbol('none');

const DocTypeSelectState = ({ pdfUrl, fileName, onConfirm }) => {
  const [selectedId, setSelectedId] = useState(NONE);

  const selectedOpt = DOC_TYPE_OPTIONS.find((o) => o.id === selectedId) ?? null;

  return (
    <Box display="flex" sx={{ height: '100%', overflow: 'hidden' }}>
      {/* Left: PDF preview */}
      <Box sx={{ flex: 1, overflow: 'hidden', borderRight: '1px solid #e0e0e0' }}>
        {pdfUrl && <PDFViewerComponent pdfUrl={pdfUrl} />}
      </Box>

      {/* Right: type selector */}
      <Box
        display="flex"
        flexDirection="column"
        sx={{ width: 320, flexShrink: 0, px: 3, py: 3, overflowY: 'auto' }}
        gap={2}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            ¿Qué alcance tiene la normativa?
          </Typography>
          {fileName && (
            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
              {fileName}
            </Typography>
          )}
        </Box>

        <Box display="flex" flexDirection="column" gap={1.5}>
          {DOC_TYPE_OPTIONS.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <Card
                key={opt.id}
                elevation={0}
                sx={{
                  border: `2px solid ${isSelected ? opt.border : '#e0e0e0'}`,
                  backgroundColor: isSelected ? opt.color : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <CardActionArea onClick={() => setSelectedId(opt.id)} sx={{ px: 2, py: 1.5 }}>
                  <Box display="flex" alignItems="flex-start" gap={1.5}>
                    {opt.icon}
                    <Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" fontWeight={700}>
                          {opt.label}
                        </Typography>
                        {opt.experimental && (
                          <Chip
                            label="Experimental"
                            size="small"
                            sx={{ height: 16, fontSize: 9, backgroundColor: '#eeeeee' }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {opt.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>

        <Button
          variant="contained"
          size="medium"
          endIcon={<ArrowForwardRounded />}
          disabled={!selectedOpt}
          onClick={() => onConfirm({ docType: selectedOpt.docType, requisitoGeneral: selectedOpt.requisitoGeneral })}
          sx={{ mt: 1 }}
        >
          Indexar documento
        </Button>

        <Typography variant="caption" color="text.disabled" textAlign="center">
          El alcance determina cómo se clasifica el requisito en la matriz legal
        </Typography>
      </Box>
    </Box>
  );
};

export default DocTypeSelectState;
