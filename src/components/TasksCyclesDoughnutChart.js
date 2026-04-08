import { Box, Typography } from '@mui/material';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
  selectFilterItemValue,
} from '../stores/filterSlice';

const useFilterItemValue = (module, fieldName) =>
  useSelector((state) => selectFilterItemValue(state, module, fieldName));

const centerTextPlugin = {
  id: 'centerTextPlugin',
  afterDraw: (chart) => {
    if (!chart.chart) {
      return;
    }
    let width = chart.chart.width,
      height = chart.chart.height,
      ctx = chart.chart.ctx;

    ctx.restore();
    let fontSize = (height / 114).toFixed(2);
    ctx.font = fontSize + 'em sans-serif';
    ctx.textBaseline = 'middle';

    let text = 'Center Text',
      textX = Math.round((width - ctx.measureText(text).width) / 2),
      textY = height / 2;

    ctx.fillText(text, textX, textY);
    ctx.save();
  }
};

ChartJS.register(ArcElement, Tooltip, Legend);
ChartJS.register(centerTextPlugin);

function TaskCyclesDoughnutChart({
  dataSetTasks,
  dataSetCycles,
  chartOptions = {
    cutout: '70%',
    responsive: true,
    tooltipItems: false,
    plugins: {
      legend: {
        display: false
      },
      centerTextPlugin: {
        display: true,
        text: 'Tasks & Cycles',
        color: 'black',
        fontStyle: 'bold',
        font: 'Arial',
        minFontSize: 12,
        maxFontSize: 20
      }
    }
  }
}) {
  const { t } = useTranslation();

  // listTaskStatus podría ser null o undefined en algunos momentos, como al recargar la página o limpiar filtros
  const listTaskStatus = useFilterItemValue('task', 'task_list_status') || [];

  /*
  const chartData = {
    labels: [t('open'), t('InProgress'), t('closed'), t('Delayed')],

    datasets: [
      {
        label: t('tasks'),
        data: [
          dataSetTasks.openTasks,
          dataSetTasks.inProgressTasks,
          dataSetTasks.closedTasks,
          dataSetTasks.delayedTasks
        ],
        backgroundColor: [
          'rgba(22, 185, 172, 1)',
          'rgba(214, 203, 111, 1)',
          'rgba(33,239,136, 1)',
          'rgba(240, 98, 125, 1)'
        ],
        borderWidth: 0
      },
      {
        backgroundColor: ['rgba(0, 0, 0, 0)'],
        hoverBackgroundColor: ['rgba(0, 0, 0, 0)'],
        borderWidth: 0
      },
      {
        label: t('cycles'),
        data: [
          dataSetTasks.openCycles,
          dataSetTasks.inProgressCycles,
          dataSetTasks.completedCycles,
          dataSetTasks.delayedCycles
        ],
        backgroundColor: [
          'rgba(22, 185, 172, 1)',
          'rgba(214, 203, 111, 1)',
          'rgba(33,239,136, 1)',
          'rgba(240, 98, 125, 1)'
        ],
        borderWidth: 0
      }
    ]
  };
  */

  const hasDynamicStatusData =
    Array.isArray(dataSetTasks?.taskStatusData) &&
    dataSetTasks.taskStatusData.length > 0 &&
    Array.isArray(dataSetTasks?.cycleStatusData) &&
    dataSetTasks.cycleStatusData.length > 0;

  const mapStatusToKey = (statusValue, suffix = 'Tasks') => {
    switch (statusValue) {
      case 'pending':
        return `open${suffix}`;
      case 'completed':
        return `closed${suffix}`;
      case 'delayed':
        return `delayed${suffix}`;
      case 'permanent':
        return `inProgress${suffix}`;
      default:
        return `unknown${suffix}`;
    }
  };

  const labels = hasDynamicStatusData
    ? dataSetTasks.taskStatusData.map((status) => status.label)
    : listTaskStatus.map((status) => t(status.label));

  const tasksValues = hasDynamicStatusData
    ? dataSetTasks.taskStatusData.map((status) => Number(status.value) || 0)
    : listTaskStatus.map((status) => {
      const key = mapStatusToKey(status.value);
      return Number(dataSetTasks?.[key]) || 0;
    });

  const cyclesValues = hasDynamicStatusData
    ? dataSetTasks.cycleStatusData.map((status) => Number(status.value) || 0)
    : listTaskStatus.map((status) => {
      const key = mapStatusToKey(status.value, 'Cycles');
      return Number(dataSetTasks?.[key]) || 0;
    });

  const colors = hasDynamicStatusData
    ? dataSetTasks.taskStatusData.map((status) => status.color)
    : listTaskStatus.map((status) => status.color_code);

  const chartData = {
    labels,
    datasets: [
      {
        label: t('tasks'),
        data: tasksValues,
        backgroundColor: colors,
        borderWidth: 0
      },
      {
        backgroundColor: ['rgba(0, 0, 0, 0)'],
        hoverBackgroundColor: ['rgba(0, 0, 0, 0)'],
        borderWidth: 0
      },
      {
        label: t('cycles'),
        data: cyclesValues,
        backgroundColor: colors,
        borderWidth: 0
      }
    ]
  };

  return (
    <Box>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Doughnut options={chartOptions} data={chartData} style={{ zIndex: '1000' }} />
        <Typography color="white" variant="h5" sx={{ textAlign:'center', position: 'absolute', marginTop: '-1.5rem', fontSize: '1.1rem', maxFontSize: '1.1rem', minFontSize: '1.1rem' }}>
          {dataSetTasks.numberOfTasks + ' ' + t('tasks')}
        </Typography>
        <Typography color="white" variant="h5" sx={{ position: 'absolute', paddingTop: '3rem', fontSize: '1.1rem', maxFontSize: '1.1rem', minFontSize: '1.1rem' }}>
          {dataSetTasks.numberOfCycles + ' ' + t('cycles')}
        </Typography>
      </div>
    </Box>
  );
}

export default TaskCyclesDoughnutChart;
