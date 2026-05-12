import CloseIcon from '@mui/icons-material/Close';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import AnalysisRegulation from '../analysisRegulation/AnalysisRegulation';

/**
 * Drawer reutilizable para análisis de documentos con IA.
 * Se puede desplegar desde distintos módulos; el nombre del módulo origen
 * se guarda en sourceModule y se usa como namespace en el store Redux.
 */
export default function AnalysisDocumentoDrawer({
  open = false,
  onClose = () => {},
  sourceModule = 'DocumentAnalysis',
  fileUrl = null,
  fileName = null,
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          maxWidth: '90%',
          width: { sm: '50vw', md: '40vw', lg: '90%' }
        }
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography color="white" variant="h5">
              Análisis de documento
            </Typography>
            {sourceModule && (
              <Typography color="white" variant="caption" sx={{ opacity: 0.75 }}>
                {sourceModule}
              </Typography>
            )}
          </Box>
          <IconButton edge="end" onClick={onClose} aria-label="close">
            <CloseIcon sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, minHeight: '90vh', overflowY: 'auto' }}>
        <AnalysisRegulation
          storeModule={sourceModule}
          initialFileUrl={fileUrl}
          initialFileName={fileName}
        />
      </Box>
    </Drawer>
  );
}
