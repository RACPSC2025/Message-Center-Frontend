import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { SendRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LexicalInput from '../../../components/Input/lexicalWYSWYG/LexicalInput';

const KnowledgeBaseTab = ({ 
  userText, 
  setUserText, 
  onSend, 
  loading 
}) => {
  const { t } = useTranslation();

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box 
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          p: 2,
          backgroundColor: '#fafafa'
        }}
      >
        <LexicalInput 
          placeholder={t('Escribe el texto para análisis en la base de conocimientos')} 
          JSONData={setUserText}
          minRows={10}
          maxRows={20}
        />

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Tooltip title="Analizar en base de conocimientos">
            <IconButton
              onClick={onSend}
              disabled={loading}
              size="large"
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#388e3c'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={28} color="inherit" />
              ) : (
                <SendRounded fontSize="medium" />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default KnowledgeBaseTab;
