import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { selectFilterItemValue } from '../stores/filterSlice';

/**
 * Componente de Gráfico de Doble Anillo.
 * Renderiza dos anillos concéntricos:
 * 1. Anillo Exterior: Segmentos de estados (Ciclos: Completado, En Progreso, etc.)
 * 2. Anillo Interior: Progreso total de la tarea (Porcentaje 0-100%)
 */
export const TaskDoubleRingChart = ({ 
  percentage, 
  stats,
  taskState,
  chartData,
  
  size = 80, 
  strokeWidth = 8,
  innerStrokeWidth = 6,
  gap = 2
}) => {
  // 1. Obtener estados y colores desde Redux
  const listTaskStatus = useSelector((state) => selectFilterItemValue(state, 'task', 'task_list_status')) || [];

  // Estado para la animación del número central
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  // --- 1. Dimensiones del Gráfico ---
  
  // Anillo Exterior (Estados)
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Anillo Interior (Progreso)
  // Calculamos el radio interno restando grosores y gap para que encaje dentro
  const innerRadius = radius - (strokeWidth / 2) - gap - (strokeWidth / 2);
  const innerCircumference = innerRadius * 2 * Math.PI;

  // --- 2. Animación del Porcentaje ---
  // --- 2. Animación del Porcentaje ---
  useEffect(() => {
    let animationFrameId;
    const duration = 1500; 
    const startValue = displayPercentage;
    const endValue = Number(percentage) || 0; // Forzamos a número

    // Si ya estamos en el valor final, no hacemos nada
    if (Math.round(startValue) === Math.round(endValue)) return;

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutQuart = (x) => 1 - Math.pow(1 - x, 4);
      const current = startValue + (endValue - startValue) * easeOutQuart(progress);
      
      setDisplayPercentage(current); // Guardamos el float para precisión

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    // LIMPIEZA: Evita que se solapen animaciones si percentage cambia rápido
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [percentage]);
  //console.log('porcentaje', percentage);
  // --- 3. Preparación de Colores ---
  // Mapa base (defaults)
  const defaultColors = {
    '1': '#00f57a', // Completed
    '2': '#1a90ff', // In Progress
    '3': '#fbc02d', // Open
    '4': '#fb3d61'  // Expired
  };

  // Construir mapa final combinando defaults con Redux
  const statusColors = { ...defaultColors };
  if (listTaskStatus && listTaskStatus.length > 0) {
    listTaskStatus.forEach(status => {
      const code = String(status.value_number);
      if (status.color_code) {
        statusColors[code] = status.color_code;
      }
    });
  }

  // Determinar color dinámico del anillo interior
  const innerRingColor = statusColors[String(taskState)] || '#eeeeee';

  // --- 4. Preparación de Datos (Anillo Exterior) ---
  let segments = [];
  let total = 0;

  if (chartData && Array.isArray(chartData)) {
    // Modo Dinámico
    segments = chartData;
    total = segments.reduce((acc, curr) => acc + (curr.value || 0), 0);
  } else if (stats) {
    // Modo Legacy
    total = (stats.completed + stats.inProgress + stats.expired + stats.open);
    segments = [
      { value: stats.completed, color: statusColors['1'], key: 'completed' },
      { value: stats.inProgress, color: statusColors['2'], key: 'inProgress' },
      { value: stats.expired, color: statusColors['4'], key: 'expired' },
      { value: stats.open, color: statusColors['3'], key: 'open' }
    ];
  }

  const hasData = total > 0;

  // --- 5. Cálculo de Segmentos SVG (Anillo Exterior) ---
  let currentOffset = 0;
  const renderedSegments = segments.map((segment) => {
    let segmentPercentage;
    if (segment.percentage !== undefined) {
      segmentPercentage = segment.percentage;
    } else if (total > 0) {
      segmentPercentage = ((segment.value || 0) / total) * 100;
    } else {
      segmentPercentage = 0;
    }
    
    const len = hasData ? (segmentPercentage / 100) * circumference : 0;
    const offset = -currentOffset;
    currentOffset += len;

    return {
      ...segment,
      strokeDasharray: `${Math.max(0, len - (segments.length > 1 ? 2 : 0))} ${circumference}`,
      strokeDashoffset: offset
    };
  });

  // --- 6. Renderizado ---
  // Anillo Interior: Longitud de arco
  const innerProgressLen = ((percentage || 0) / 100) * innerCircumference;
  const center = size / 2;
  const transitionStyle = { transition: 'stroke-dasharray 2s ease-out, stroke-dashoffset 2s ease-out' };

  //console.log("Mostrando estadísticas de la tarea", stats);
  //console.log("Mostrando estado de la tarea", taskState);
  //console.log("Color seleccionado para estado", taskState, ":", innerRingColor);
  const finalValueToShow = displayPercentage > 0 ? displayPercentage : percentage;
  return (
    
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: size, height: size }}>
      {/* SVG Container: Rotado -90deg para empezar desde arriba */}
      <svg
        style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* === ANILLO INTERIOR (Progreso Tarea) === */}
        {/* Fondo Gris */}
        <circle
          stroke="#edf2f4"
          fill="transparent"
          r={innerRadius}
          cx={center}
          cy={center}
          strokeWidth={innerStrokeWidth}
        />
        {/* Arco de Progreso (Color Dinámico) */}
        {percentage > 0 && (
          <circle
            stroke={innerRingColor}
            fill="transparent"
            r={innerRadius}
            cx={center}
            cy={center}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(0, innerProgressLen)} ${innerCircumference}`}
            style={transitionStyle}
          />
        )}

        {/* === ANILLO EXTERIOR (Estados Ciclos) === */}
        {/* Fondo Gris */}
        <circle
          stroke="#edf2f4"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeWidth={strokeWidth}
        />
        
        {/* Segmentos de Colores */}
        {hasData && renderedSegments.map((segment, index) => {
            const shouldRender = segment.percentage !== undefined ? segment.percentage > 0 : segment.value > 0;
            return shouldRender && (
              <circle
                key={index}
                stroke={segment.color}
                fill="transparent"
                r={radius}
                cx={center}
                cy={center}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={segment.strokeDasharray}
                strokeDashoffset={segment.strokeDashoffset}
                style={transitionStyle}
              />
            );
        })}
      </svg>
      
      {/* Texto Central */}
      <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ fontWeight: 900, fontSize: size > 80 ? '1rem' : '0.75rem', color: '#263238' }}>
          {Math.round(finalValueToShow)}%
        </Typography>
      </Box>
    </Box>
  );
};

export default TaskDoubleRingChart;
