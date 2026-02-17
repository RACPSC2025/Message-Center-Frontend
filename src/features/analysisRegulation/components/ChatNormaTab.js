import { Box, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { SendRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import LexicalInput from '../../../components/Input/lexicalWYSWYG/LexicalInput';

const ChatNormaTab = ({ 
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
          placeholder={t('Consulta sobre el documento')} 
          JSONData={setUserText}
          minRows={8}
          maxRows={15}
        />
        
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Tooltip title="Enviar consulta sobre el documento">
            <IconButton
              onClick={onSend}
              disabled={loading}
              size="large"
              sx={{
                backgroundColor: '#2196f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2'
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0'
                }
              }}
            >
              {loading ? (
                <CircularProgress size={28} sx={{ color: 'white' }} />
              ) : (
                <SendRounded />
              )}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatNormaTab;
