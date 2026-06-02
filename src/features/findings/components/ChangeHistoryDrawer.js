import { useMemo } from 'react';
import { Drawer, Box, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import TableComponent from '../../../components/TableComponent';

const ChangeHistoryDrawer = ({ open, finding, onClose }) => {
  const { t } = useTranslation();

  const columnDefs = useMemo(
    () => [
      { headerName: t('modification_date'), field: 'fecha_modificacion', width: 180 },
      { headerName: t('User'), field: 'usuario', width: 150 },
      { headerName: t('State'), field: 'estado', width: 120 },
      { headerName: t('Action'), field: 'accion', width: 150 },
      { headerName: t('previous_data'), field: 'data_anterior', width: 200 },
      { headerName: t('new_value'), field: 'nuevo_valor', width: 200 }
    ],
    [t]
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 1000,
          maxWidth: '95vw',
          height: '100vh',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          borderBottom: '1px solid #e0e0e0'
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          {t('change_history_title', { id: finding?.id })}
        </Typography>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Fuente / Sin fuente */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: '#f9fafb' }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {finding?.finding_source_name || t('Nosource')} - ID: {finding?.id}
        </Typography>
      </Box>

      {/* Lista de cambios */}
      <Box sx={{ flexGrow: 1, minHeight: 0, p: 2.5 }}>
        <TableComponent
          rowData={[]}
          columnDefs={columnDefs}
          sortable
          filterable
          resizable
          pagination
          perPage={10}
        />
      </Box>
    </Drawer>
  );
};

export default ChangeHistoryDrawer;
