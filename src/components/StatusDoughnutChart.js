import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectListOptions } from '../stores/filterSlice';

ChartJS.register(ArcElement, Tooltip, Legend);

function StatusDoughnutChart({
  dataSet,
  chartOptions = {
    cutout: '80%'
  }
}) {
  const { t } = useTranslation();
  
  // Obtener los colores desde el filterSlice
  const actionStatusList = useSelector((state) => selectListOptions(state, 'actions', 'filter_status'));

  const colorMap = actionStatusList.reduce((acc, status) => {
    acc[status.value] = status.color_code;
    return acc;
  }, {});

  const chartDataValue = dataSet.map(({ value }) => value);
  const chartDataColors = dataSet.map(({ key }) => {
    const color = colorMap[key] || '#ccc';
    return color;
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
        <Doughnut options={chartOptions} data={chartData} />
        <Typography color="white" variant="h5" sx={{ textAlign:'center', position: 'absolute', marginTop: '0.5rem' }}>
          {totalDataValue + ' ' + t('Actions')}
        </Typography>
      </div>
    </Box>
  );
}

export default StatusDoughnutChart;
