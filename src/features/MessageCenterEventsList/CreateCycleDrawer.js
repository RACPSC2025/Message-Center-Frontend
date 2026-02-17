import { Close } from '@mui/icons-material';
import { 
  AppBar, 
  Box, 
  Drawer, 
  IconButton, 
  Toolbar, 
  Typography, 
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Grid,
  Button
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import InputProgressSlider from '../../components/Input/InputProgressSlider';

export default function CreateCycleDrawer({
  openCreateCycleDrawer = false,
  onCloseCreateCycleDrawer = () => {}
}) {
  const { t } = useTranslation();

  return (
    <Drawer
      anchor="right"
      open={openCreateCycleDrawer}
      onClose={onCloseCreateCycleDrawer}
      PaperProps={{
        sx: {
          maxWidth: '70vw',
          width: {
            sm: '70vw',
            md: '60vw',
            lg: '40vw'
          }
        }
      }}
    >
      {/* Header del drawer (Crear ciclo) */}
      <AppBar position="static">
        <Toolbar>
          <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
            {t('Create_cycle')}
          </Typography>

          <IconButton edge="end" onClick={onCloseCreateCycleDrawer} aria-label="close">
            <Close sx={{ color: 'white' }} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenido del drawer */}
      <Box sx={{ px: 5, py: 2, flexGrow: 1}}>
        {/* Sección: Información General */}
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('Section_general_info')}
          </Typography>

          <Divider sx={{ mb: 2 }} />

          {/* Campo: Ciclo */}
          <TextField
            fullWidth
            label={t('cycle')}
            variant="outlined"
            sx={{ mb: 1 }}
          />
        </Box>
      
        {/* Sección: Cronograma y Alertas */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('Section_schedule_alerts')}
          </Typography>

          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={2}>
            {/* Campo: Fecha de inicio */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('ExpectedStartDate')}
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Campo: Fecha de fin */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('final_date')}
                type="date"
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            {/* Grid: Alerta Inicio y Alerta Fin */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('start_alert')}
                type="number"
                variant="outlined"
              />
            </Grid>

            {/* Campo: Alerta fin */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t('end_alert')}
                type="number"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Box>

        {/* Sección: Progreso */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {t('progress')}
          </Typography>

          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            {/* Selector: Estado */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>{t('Estado')}</InputLabel>

                <Select
                  fullWidth
                  label={t('Status')}
                  defaultValue="pendiente"
                >
                  <MenuItem value="pendiente">{t('Pending')}</MenuItem>
                  <MenuItem value="proceso">{t('InProgress')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Slider: Porcentaje de avance */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                {t('progress_percentage')}
              </Typography>

              <InputProgressSlider
                label={t('progress_percentage')}
                value={0}
                onChange={(value) => console.log('Progress:', value)}
                min={0}
                max={100}
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ mt: 3 }}>
            <Grid container spacing={2} justifyContent="flex-end">
              {/* Botón de cancelar*/}
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={onCloseCreateCycleDrawer}
                  sx={{ minWidth: 120 }}
                >
                  {t('Cancel')}
                </Button>
              </Grid>

              {/* Botón de crear */}
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 120 }}
                  onClick={() => console.log('Crear ciclo')}
                >
                  {t('Create_cycle')}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}