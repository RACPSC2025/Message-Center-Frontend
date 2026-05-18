import React from 'react'
import ReactECharts from 'echarts-for-react'

// Inner hole diameter ≈ 70% of half the chart height × 2 = 70% × 75 × 2 = 105px
const INNER_HOLE_PX = 105;

function CircularGaugePercentage({color = "#00C853", percentage = 75}) {
  const displayValue = percentage < 50 ? (100.0 - percentage) : percentage;

  const circularProgressBarOptions = {
    backgroundColor: 'transparent',
    series: [
      {
        type: 'pie',
        radius: ['70%', '85%'],
        avoidLabelOverlap: false,
        hoverAnimation: true,
        label: { show: false },
        emphasis: { label: { show: false } },
        labelLine: { show: false },
        data: [
          { value: `${percentage}`, name: 'Completion', itemStyle: { color: `${color}`, borderRadius: 10 } },
          { value: `${100 - percentage}`, name: 'Remaining', itemStyle: { color: '#FFF' } }
        ]
      }
    ]
  };

  return (
    <div style={{ position: 'relative', height: '150px', width: '100%' }}>
      {/* ECharts canvas — base layer */}
      <ReactECharts
        option={circularProgressBarOptions}
        style={{ position: 'relative', zIndex: 1, height: '150px', width: '100%', background: 'transparent' }}
      />
      {/* Imagen en el hueco — encima del canvas para no depender de transparencia ECharts */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: INNER_HOLE_PX,
        height: INNER_HOLE_PX,
        borderRadius: '50%',
        overflow: 'hidden',
        zIndex: 2,
        pointerEvents: 'none',
      }}>
        <img
          src="/assets/chart_background.png"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      {/* Porcentaje — sobre la imagen */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 3,
        pointerEvents: 'none',
        color: '#000',
        fontSize: '25px',
        fontWeight: 'bold',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}>
        {displayValue}%
      </div>
    </div>
  )
}

export default CircularGaugePercentage