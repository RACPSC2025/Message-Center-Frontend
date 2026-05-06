import { Box, IconButton, Tooltip, CircularProgress, Typography, Paper, Chip } from '@mui/material';
import { SendRounded, SourceRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import LexicalInput from '../../../components/Input/lexicalWYSWYG/LexicalInput';

const ChatNormaTab = ({
  userText,
  setUserText,
  onSend,
  loading,
  messages = [],
}) => {
  const { t } = useTranslation();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box display="flex" flexDirection="column" sx={{ height: '620px', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden' }}>

      {/* ── Área de mensajes ── */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {messages.length === 0 ? (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Typography variant="body2" color="text.disabled" textAlign="center">
              Carga un PDF y haz una pregunta sobre la norma
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => (
            <Box
              key={idx}
              display="flex"
              flexDirection="column"
              alignItems={msg.role === 'user' ? 'flex-end' : 'flex-start'}
            >
              <Paper
                elevation={0}
                sx={{
                  maxWidth: '88%',
                  p: 1.5,
                  borderRadius: msg.role === 'user'
                    ? '16px 16px 4px 16px'
                    : '16px 16px 16px 4px',
                  backgroundColor: msg.role === 'user' ? '#1976d2' : '#fff',
                  color: msg.role === 'user' ? '#fff' : 'text.primary',
                  border: msg.role === 'user' ? 'none' : '1px solid #e0e0e0',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}
                >
                  {msg.text}
                </Typography>

                {/* Fuentes */}
                {msg.sources && msg.sources.filter(s => s !== 'unknown').length > 0 && (
                  <Box mt={1.5} pt={1} sx={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <Box display="flex" alignItems="center" gap={0.5} mb={0.75}>
                      <SourceRounded sx={{ fontSize: 13, opacity: 0.7 }} />
                      <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
                        Fuentes
                      </Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {msg.sources.filter(s => s !== 'unknown').slice(0, 3).map((src, i) => {
                        const label = typeof src === 'string'
                          ? src
                          : src.metadata?.['x-amz-bedrock-kb-source-uri']?.split('/').pop()
                            || `Fuente ${i + 1}`;
                        return (
                          <Chip
                            key={i}
                            label={label}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: 10,
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              color: 'inherit',
                            }}
                          />
                        );
                      })}
                    </Box>
                  </Box>
                )}

                {/* Indicadores calidad */}
                {msg.grade && (
                  <Box mt={0.75} display="flex" gap={0.5} flexWrap="wrap">
                    <Chip
                      label={msg.grade}
                      size="small"
                      sx={{ height: 18, fontSize: 10, backgroundColor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                    />
                    {msg.hallucination && (
                      <Chip
                        label="⚠ posible alucinación"
                        size="small"
                        color="warning"
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    )}
                    {msg.cacheHit && (
                      <Chip
                        label="caché"
                        size="small"
                        sx={{ height: 18, fontSize: 10, backgroundColor: 'rgba(255,255,255,0.15)', color: 'inherit' }}
                      />
                    )}
                  </Box>
                )}
              </Paper>
              {msg.timestamp && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.25, mx: 0.5, opacity: 0.5, fontSize: 10 }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </Typography>
              )}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* ── Input area ── */}
      <Box
        sx={{
          p: 1.5,
          backgroundColor: '#fff',
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
        }}
      >
        <Box flex={1}>
          <LexicalInput
            placeholder={t('Consulta sobre el documento')}
            JSONData={setUserText}
            minRows={2}
            maxRows={6}
          />
        </Box>
        <Tooltip title="Enviar consulta">
          <span>
            <IconButton
              onClick={onSend}
              disabled={loading}
              size="medium"
              sx={{
                mb: 0.5,
                backgroundColor: '#2196f3',
                color: 'white',
                '&:hover': { backgroundColor: '#1976d2' },
                '&.Mui-disabled': { backgroundColor: '#e0e0e0' },
              }}
            >
              {loading
                ? <CircularProgress size={20} sx={{ color: 'white' }} />
                : <SendRounded />
              }
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default ChatNormaTab;
