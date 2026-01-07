"use client";

import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: number[];
  labels: string[];
  type: 'line' | 'bar' | 'doughnut';
  cardColor: string;
}

const ChartComponent: React.FC<ChartProps> = ({ data, labels, type, cardColor }) => {
  const chartRef = useRef<any>(null);

  useEffect(() => {
    // Cleanup on unmount to prevent tooltip errors
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, []);

  const getChartOptions = () => {
    const baseColor = getColorFromCardColor(cardColor);
    
    if (type === 'doughnut') {
      return {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 8
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: baseColor,
            borderWidth: 1,
            displayColors: true,
            cornerRadius: 4,
            callbacks: {
              label: function(context: any) {
                if (!context || !context.parsed) return '';
                return `Value: ${context.parsed}`;
              }
            }
          },
        },
        cutout: '35%',
        elements: {
          arc: {
            borderWidth: 4,
          },
        },
        interaction: {
          intersect: false,
          mode: 'index' as const,
        },
      };
    }
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: {
          top: 10,
          bottom: 10,
          left: 12,
          right: 12
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: baseColor,
          borderWidth: 1,
          displayColors: false,
          cornerRadius: 4,
          callbacks: {
            title: function() {
              return '';
            },
            label: function(context: any) {
              if (!context || !context.parsed) return '';
              const value = typeof context.parsed === 'number' ? context.parsed : context.parsed.y || 0;
              return `Value: ${value}`;
            }
          }
        },
      },
      scales: {
        x: {
          display: false,
          grid: {
            display: false,
          },
        },
        y: {
          display: false,
          grid: {
            display: false,
          },
          beginAtZero: true,
          min: 0,
        },
      },
      elements: {
        point: {
          radius: 5,
          hoverRadius: 8,
          borderWidth: 3,
        },
        line: {
          tension: 0.4,
          borderWidth: 3,
        },
        bar: {
          borderRadius: 6,
        }
      },
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
    };
  };

  const getColorFromCardColor = (cardColor: string) => {
    switch (cardColor) {
      case '#3B82F6': return '#3b82f6';
      case '#10B981': return '#10b981';
      case '#8B5CF6': return '#8b5cf6';
      case '#F97316': return '#f97316';
      default: return '#6b7280';
    }
  };

  const getChartData = () => {
    const baseColor = getColorFromCardColor(cardColor);
    
    // Ensure we have valid data
    const validData = data && data.length > 0 ? data : [10, 15, 12, 18, 14];
    
    if (type === 'line') {
      return {
        labels,
        datasets: [
          {
            data: validData,
            borderColor: baseColor,
            backgroundColor: `${baseColor}50`,
            borderWidth: 4,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: baseColor,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      };
    } else if (type === 'doughnut') {
      return {
        labels: ['Active', 'Inactive', 'Other'],
        datasets: [
          {
            data: validData.slice(0, 3),
            backgroundColor: [
              `${baseColor}`,
              `${baseColor}80`,
              `${baseColor}50`,
            ],
            borderColor: '#fff',
            borderWidth: 3,
            hoverBorderWidth: 4,
          },
        ],
      };
    } else {
      return {
        labels,
        datasets: [
          {
            data: validData,
            backgroundColor: `${baseColor}`,
            borderColor: baseColor,
            borderWidth: 1,
            borderRadius: 4,
            borderSkipped: false,
            barThickness: 10,
            maxBarThickness: 14,
          },
        ],
      };
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center bg-white bg-opacity-15 rounded-md border border-white border-opacity-20" style={{minHeight: '64px', minWidth: '96px'}}>
      {type === 'line' ? (
        <Line ref={chartRef} data={getChartData()} options={getChartOptions()} />
      ) : type === 'doughnut' ? (
        <Doughnut ref={chartRef} data={getChartData()} options={getChartOptions()} />
      ) : (
        <Bar ref={chartRef} data={getChartData()} options={getChartOptions()} />
      )}
    </div>
  );
};

interface MiniChartProps {
  data: number[];
  type: 'line' | 'bar' | 'doughnut';
  cardColor: string;
}

export const MiniChart: React.FC<MiniChartProps> = ({ data, type, cardColor }) => {
  const labels = data.map((_, index) => `Point ${index + 1}`);
  
  // Ensure we always have valid numerical array data
  let validData: number[] = [];
  
  if (Array.isArray(data) && data.length > 0 && data.every(item => typeof item === 'number' && !isNaN(item))) {
    validData = data;
  } else {
    console.warn(`⚠️ Invalid data for ${type} chart, using fallback:`, data);
    validData = [10, 20, 15, 25, 18, 22, 16]; // Default fallback
  }
  
  // Add a simple fallback visualization if data is still invalid
  if (!validData || validData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-200 rounded-md" style={{minHeight: '48px', minWidth: '80px'}}>
        <div className="text-xs text-red-800">No Data</div>
      </div>
    );
  }
  
  return (
    <div className="w-full h-full">
      <ChartComponent
        data={validData}
        labels={labels}
        type={type}
        cardColor={cardColor}
      />
    </div>
  );
};