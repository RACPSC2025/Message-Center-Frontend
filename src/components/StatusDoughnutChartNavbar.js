import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectListOptions } from '../stores/filterSlice';

import { STATUS_COLORS } from '../config/statusColors';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDoughnutChart({
  dataSet,
  showInfoOnHover = false,
  chartOptions = {
    cutout: '80%'
  }
}) {
  const { t } = useTranslation();

  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));
  const taskStatusList   = useSelector((state) => selectListOptions(state, 'task', 'task_list_status'));
  const legalStatusList  = useSelector((state) => selectListOptions(state, 'LegalMatriz', 'legal_list_status'));

  const colorMap = {};
  actionStatusList.forEach((s) => { colorMap[s.value] = s.color_code; });
  taskStatusList.forEach((s)   => { colorMap[s.value] = s.color_code; });
  legalStatusList.forEach((s)  => { colorMap[s.value] = s.color_code; });

  const chartDataValue = dataSet.map(({ value }) => value);
  const chartDataColors = dataSet.map(({ key, color }) => {
    // STATUS_COLORS is authoritative — frontend palette owns the visual language.
    // API / Redux colors are fallback for any key not defined in STATUS_COLORS.
    return STATUS_COLORS[key] || String(color || '').trim() || colorMap[key] || '#ccc';
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

  const mergedChartOptions = {
    ...chartOptions,
    plugins: {
      ...(chartOptions?.plugins ?? {}),
      tooltip: {
        ...(chartOptions?.plugins?.tooltip ?? {}),
        enabled: showInfoOnHover
      }
    }
  };

  return <Doughnut options={mergedChartOptions} data={chartData} />;
}

export default StatusDoughnutChart;
