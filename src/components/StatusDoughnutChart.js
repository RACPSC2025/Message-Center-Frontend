import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectListOptions } from '../stores/filterSlice';
import { STATUS_COLORS } from '../config/statusColors';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDoughnutChart({
  dataSet,
  chartOptions = {}
}) {
  const { t } = useTranslation();

  // Same 3-list resolution as StatusDoughnutChartNavbar for color consistency
  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));
  const taskStatusList   = useSelector((state) => selectListOptions(state, 'task', 'task_list_status'));
  const legalStatusList  = useSelector((state) => selectListOptions(state, 'LegalMatriz', 'legal_list_status'));

  const colorMap = {};
  actionStatusList.forEach((s) => { colorMap[s.value] = s.color_code; });
  taskStatusList.forEach((s)   => { colorMap[s.value] = s.color_code; });
  legalStatusList.forEach((s)  => { colorMap[s.value] = s.color_code; });

  const labelMap = dataSet.reduce((acc, item) => {
    if (item?.key) acc[item.key] = item.label || item.key;
    return acc;
  }, {});

  const defaultOptions = {
    cutout: '80%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const statusKey = dataSet[context.dataIndex]?.key;
            const label = labelMap[statusKey]
              || actionStatusList.find((s) => s.value === statusKey)?.label
              || statusKey;
            return `${context.parsed} ${label}`;
          }
        }
      }
    }
  };

  const finalChartOptions = { ...defaultOptions, ...chartOptions };

  const chartDataValue = dataSet.map(({ value }) => value);
  const chartDataColors = dataSet.map(({ key, color }) => {
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

  
  const totalDataValue = chartDataValue.reduce((sum, value) => sum + value, 0);

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
        <Doughnut options={finalChartOptions} data={chartData} />
        <Typography color="white" variant="h5" sx={{ textAlign:'center', position: 'absolute', marginTop: '0.5rem' }}>
          {totalDataValue + ' ' + t('Actions')}
        </Typography>
      </div>
    </Box>
  );
}

export default StatusDoughnutChart;
