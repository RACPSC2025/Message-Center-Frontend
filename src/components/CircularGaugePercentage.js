import React from 'react'
import ReactECharts from 'echarts-for-react'

// Inner hole diameter ≈ 70% of half the chart height × 2 = 70% × 75 × 2 = 105px
const INNER_HOLE_PX = 105;

function CircularGaugePercentage({color = "#00C853", percentage = 75}) {
  const circularProgressBarOptions = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'],
        avoidLabelOverlap: false,
        hoverAnimation: true,
        label: {
          show: true,
          position: 'center',
          fontSize: '25',
          fontWeight: 'bold',
          formatter: function (params) {
            if (percentage < 50) {
              return `${100.0 - params.value}%`
            } else {
              return `${params.value}%`
            }
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '25',
            fontWeight: 'bold',
            formatter: '{d}%'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: `${percentage}`, name: 'Completion', itemStyle: { color: `${color}`, borderRadius: 10 } },
          { value: `${100 - percentage}`, name: 'Remaining', itemStyle: { color: '#FFF' } }
        ]
      }
    ]
  };

  return (
    <div style={{ position: 'relative', height: '150px', width: '100%' }}>
      {/* Imagen de fondo centrada en el hueco interior del donut */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: INNER_HOLE_PX,
        height: INNER_HOLE_PX,
        borderRadius: '50%',
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
      }}>
        <img
          src="/assets/chart_background.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <ReactECharts
        option={circularProgressBarOptions}
        style={{ position: 'relative', zIndex: 1, height: '150px', width: '100%', background: 'transparent' }}
      />
    </div>
  )
}

export default CircularGaugePercentage