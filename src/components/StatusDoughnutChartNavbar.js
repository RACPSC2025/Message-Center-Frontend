import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectListOptions } from '../stores/filterSlice';

import { STATUS } from '../config/constants';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDoughnutChart({
  dataSet,
  chartOptions = {
    cutout: '80%'
  }
}) {
  const { t } = useTranslation();
  
  // Obtener los colores desde el filterSlice para diferentes módulos
  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));
  const taskStatusList = useSelector((state) => selectListOptions(state, 'task', 'task_list_status'));
  const legalStatusList = useSelector((state) => selectListOptions(state, 'LegalMatriz', 'legal_list_status'));

  // Combinar todas las listas de estado en un solo mapa de colores
  const colorMap = {};
  
  // Agregar colores de acciones
  actionStatusList.forEach(status => {
    colorMap[status.value] = status.color_code;
  });
  
  // Agregar colores de tareas
  taskStatusList.forEach(status => {
    colorMap[status.value] = status.color_code;
  });
  
  // Agregar colores de legales
  legalStatusList.forEach(status => {
    colorMap[status.value] = status.color_code;
  });

  // Mapeo estático como fallback
  const STATUS_TO_COLOR_MAPPING = {
    [STATUS.completed]: 'rgba(33,239,136, 1)',
    [STATUS.delayed]: 'rgba(240, 98, 125, 1)',
    [STATUS.pending]: 'rgba(214, 203, 111, 1)',
    [STATUS.in_progress]: 'rgba(22, 185, 172, 1)',
    // Actions module keys
    'open': 'rgba(253, 253, 150, 1)',
    'closed': 'rgba(33,239,136, 1)',
    'cancelled': 'rgba(156, 163, 175, 1)',
    'delayed': 'rgba(240, 98, 125, 1)'
  };

  const chartDataValue = dataSet.map(({ value }) => value);
  const chartDataColors = dataSet.map(({ key }) => {
    // Primero intentar usar el color desde Redux, luego el mapeo estático
    return colorMap[key] || STATUS_TO_COLOR_MAPPING[key] || '#ccc';
  });

  const chartData = {
    datasets: [
      {
        //label: t('number_of_votes'),
        data: chartDataValue,
        backgroundColor: chartDataColors,
        borderColor: chartDataColors,
        borderWidth: 1
      }
    ]
  };

  return <Doughnut options={chartOptions} data={chartData} />;
}

export default StatusDoughnutChart;
