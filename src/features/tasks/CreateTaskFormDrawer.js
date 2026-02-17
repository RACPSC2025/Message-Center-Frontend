import { Close } from '@mui/icons-material';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import CreateTaskForm from '../compliance/CreateTaskForm';

export default function CreateTaskFormDrawer({ open, handleClose, onSuccess }) {
    const { t } = useTranslation();

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    maxWidth: '70vw',
                    width: {
                        sm: '70vw',
                        md: '60vw',
                        lg: '50vw'
                    }
                }
            }}
        >
            <AppBar position="static">
                <Toolbar>
                    <Typography color="white" variant="h5" sx={{ flexGrow: 1 }}>
                        {t('Añadir Tarea')}
                    </Typography>
                    <IconButton edge="end" onClick={handleClose} aria-label="close">
                        <Close sx={{ color: 'white' }} />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box sx={{ p: 3 }}>
                <CreateTaskForm
                    onSuccess={() => {
                        if (onSuccess) onSuccess();
                        handleClose();
                    }}
                />
            </Box>
        </Drawer>
    );
}
