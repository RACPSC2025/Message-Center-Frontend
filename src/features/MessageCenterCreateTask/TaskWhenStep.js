import { AssignmentReturned, DownloadDone, Loop } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Radio,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAlertList } from '../../stores/tasks/fetchAlertListSlice';
import { isValidArray } from '../../utils/others';
import CyclicFormData from './CyclicFormData';
import PermanentFormData from './PermanentFormData';
import UniqueFormData from './UniqueFormData';

const EMPTY_ARRAY = [];

function TaskWhenStep({ onTaskWhenStepChange, taskWhenFormModel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selectedWhenSwitch, setSelectedWhenSwitch] = useState(null);
  const [switchForDialog, setSwitchForDialog] = useState(null);
  const [whenFormModel, setWhenFormModel] = useState({});
  const [uniqueFormModel, setUniqueFormModel] = useState({});
  const [cyclicFormModel, setCyclicFormModel] = useState({});
  const [permanentFormModel, setPermanentFormModel] = useState({});
  const [activityType, setActivityType] = useState('');
  const [expandedTaskType, setExpandedTaskType] = useState('uniqueSwitch');
  const [openDialog, setOpenDialog] = useState(false);

  const alertList = useSelector((state) => state?.fetchAlertList?.data?.data ?? EMPTY_ARRAY);

  const handleFetchAlert = () => {
    dispatch(fetchAlertList());
  };

  const handleWhenSwitch = (event) => {
    const nextSwitch = event.target.name;
    setSwitchForDialog(nextSwitch);
    setExpandedTaskType(nextSwitch);
    if (selectedWhenSwitch !== null) {
      setOpenDialog(true);
    } else {
      setSelectedWhenSwitch(nextSwitch);
    }
  };

  const handleAcceptDialog = () => {
    setSelectedWhenSwitch(switchForDialog);
    setOpenDialog(false);
  };

  const handleUniqueFormData = (formData) => {
    setUniqueFormModel(formData);
  };

  const handleCyclicFormData = (formData) => {
    setCyclicFormModel(formData);
  };

  const handlePermanentFormData = (formData) => {
    setPermanentFormModel(formData);
  };

  useEffect(() => {
    handleFetchAlert();
  }, []);

  useEffect(() => {
    if (selectedWhenSwitch === 'uniqueSwitch') {
      setActivityType('1');
      setWhenFormModel((prevState) => ({
        ...prevState,
        activity_type: '1'
      }));
    } else if (selectedWhenSwitch === 'cyclicSwitch') {
      setActivityType('3');
      setWhenFormModel((prevState) => ({
        ...prevState,
        activity_type: '3'
      }));
    } else if (selectedWhenSwitch === 'permanentSwitch') {
      setActivityType('5');
      setWhenFormModel((prevState) => ({
        ...prevState,
        activity_type: '5'
      }));
    } else {
      setWhenFormModel((prevState) => ({
        ...prevState,
        activity_type: ''
      }));
    }
  }, [selectedWhenSwitch]);

  useEffect(() => {
    setWhenFormModel((prevState) => {
      let activeModel = {};
      if (activityType === '1') {
        activeModel = uniqueFormModel;
      } else if (activityType === '3') {
        activeModel = cyclicFormModel;
      } else if (activityType === '5') {
        activeModel = permanentFormModel;
      }

      return {
        ...prevState,
        ...activeModel,
        activity_type: activityType
      };
    });
  }, [uniqueFormModel, cyclicFormModel, permanentFormModel, activityType]);

  useEffect(() => {
    setUniqueFormModel(taskWhenFormModel);
    setCyclicFormModel(taskWhenFormModel);
    setPermanentFormModel(taskWhenFormModel);
  }, []);

  useEffect(() => {
    onTaskWhenStepChange(whenFormModel);
  }, [whenFormModel, onTaskWhenStepChange]);

  const taskTypeOptions = [
    {
      value: 'uniqueSwitch',
      label: t('unique'),
      icon: <AssignmentReturned fontSize="small" />,
      description:
        'Este tipo de tarea se ejecuta una sola vez dentro del ciclo del proyecto. Se utiliza para actividades puntuales con una fecha de inicio y fin definidas, como una reunión específica, una entrega o la revisión de un documento. Una vez completada, no se vuelve a generar automáticamente.'
    },
    {
      value: 'cyclicSwitch',
      label: t('cyclic'),
      icon: <Loop fontSize="small" />,
      description:
        'Son tareas que deben repetirse un número determinado de veces durante el desarrollo del proyecto. Por ejemplo, pueden ser inspecciones semanales, reportes mensuales o capacitaciones trimestrales. Se programan con una frecuencia establecida y se mantienen activas hasta cumplir con el número de repeticiones configuradas.'
    },
    {
      value: 'permanentSwitch',
      label: t('permanent'),
      icon: <DownloadDone fontSize="small" />,
      description:
        'Estas tareas no tienen un número fijo de repeticiones, ya que representan obligaciones continuas que deben cumplirse de forma permanente mientras el proyecto esté activo. Se generan dinámicamente en el tiempo y están asociadas a procesos críticos como el cumplimiento normativo, mantenimiento preventivo o monitoreo constante. No finalizan a menos que el proyecto se cierre o se desactiven manualmente.'
    }
  ];

  const handleAccordionChange = (value) => (_event, isExpanded) => {
    setExpandedTaskType(isExpanded ? value : false);
  };

  return (
    <>
      <Typography variant="body1" margin="20px 0">
        {t('when_step_description')}
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        gap={2}
        alignItems="start"
        padding={0}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            {t('choose_task_type')}
          </Typography>
          {taskTypeOptions.map((option) => (
            <Accordion
              key={option.value}
              expanded={expandedTaskType === option.value}
              onChange={handleAccordionChange(option.value)}
              disableGutters
              sx={{
                border: '1px solid rgba(211,211,211,0.8)',
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '& + &': { mt: 1 }
              }}
            >
              <AccordionSummary
                expandIcon={<KeyboardArrowDownIcon />}
                sx={{
                  minHeight: 54,
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1.5,
                    my: 1
                  }
                }}
              >
                <Radio
                  checked={selectedWhenSwitch === option.value}
                  name={option.value}
                  onChange={handleWhenSwitch}
                  onClick={(event) => event.stopPropagation()}
                  size="small"
                />
                {option.icon}
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {option.label}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 0, pl: 7, pr: 3, pb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {option.description}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {isValidArray(alertList) &&
          (selectedWhenSwitch === 'uniqueSwitch' ? (
            <UniqueFormData
              formModel={uniqueFormModel}
              onFormModelChange={handleUniqueFormData}
              alert={alertList}
            />
          ) : selectedWhenSwitch === 'cyclicSwitch' ? (
            <CyclicFormData
              formModel={cyclicFormModel}
              onFormModelChange={handleCyclicFormData}
              alert={alertList}
            />
          ) : selectedWhenSwitch === 'permanentSwitch' ? (
            <PermanentFormData
              formModel={permanentFormModel}
              onFormModelChange={handlePermanentFormData}
              alert={alertList}
            />
          ) : (
            <div>{t('choose_task_type')}</div>
          ))}

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          aria-labelledby="alert-dialog-switch-task"
        >
          <DialogTitle>{t('switch_task')}</DialogTitle>
          <DialogContent>{t('switch_task_description')}</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)} color="primary">
              {t('Cancel')}
            </Button>
            <Button onClick={handleAcceptDialog} color="primary">
              {t('Accept')}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
}

export default TaskWhenStep;
