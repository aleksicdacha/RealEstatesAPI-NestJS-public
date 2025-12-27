"use client";

import { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Card } from 'primereact/card';
import { Calendar } from 'primereact/calendar';
import { useTranslations } from 'next-intl';

interface PropertyStats {
  propertyType: string;
  averagePrice: number;
  count: number;
}

export default function AveragePriceChart() {
  const t = useTranslations('dashboard');
  const tCommon = useTranslations('common');
  const [chartData, setChartData] = useState<any>(null);
  const [chartOptions, setChartOptions] = useState<any>(null);
  
  // Set default date range to last year
  const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);
    return [startDate, endDate];
  };
  
  const [dateRange, setDateRange] = useState<Date[] | null>(getDefaultDateRange());
  const [loading, setLoading] = useState(true);

  const fetchStats = async (startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let url = 'http://localhost:3000/v1/properties/stats/average-price-by-type';
      const params = new URLSearchParams();
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      
      // Handle both array and object responses
      const data: PropertyStats[] = Array.isArray(result) ? result : [];

      if (data.length === 0) {
        setChartData(null);
        setChartOptions(null);
        setLoading(false);
        return;
      }

      // Prepare chart data
      const labels = data.map(item => item.propertyType);
      const prices = data.map(item => item.averagePrice);
      const counts = data.map(item => item.count);

      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--text-color');
      const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
      const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

      setChartData({
        labels: labels,
        datasets: [
          {
            label: t('averagePrice'),
            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
            borderColor: documentStyle.getPropertyValue('--blue-500'),
            data: prices
          }
        ]
      });

      setChartOptions({
        maintainAspectRatio: false,
        aspectRatio: 0.8,
        plugins: {
          legend: {
            labels: {
              fontColor: textColor
            }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context: any) {
                const index = context.dataIndex;
                return `Count: ${counts[index]}`;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColorSecondary,
              font: {
                weight: 500
              }
            },
            grid: {
              display: false,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColorSecondary
            },
            grid: {
              color: surfaceBorder,
              drawBorder: false
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching property stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load stats with default date range on mount
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].toISOString().split('T')[0];
      const endDate = dateRange[1].toISOString().split('T')[0];
      fetchStats(startDate, endDate);
    }
  }, []);

  useEffect(() => {
    if (dateRange && dateRange[0] && dateRange[1]) {
      const startDate = dateRange[0].toISOString().split('T')[0];
      const endDate = dateRange[1].toISOString().split('T')[0];
      fetchStats(startDate, endDate);
    } else if (dateRange === null) {
      fetchStats();
    }
  }, [dateRange]);

  return (
    <Card title={t('averagePriceByType')} className="mb-4">
      <div className="mb-3">
        <Calendar 
          value={dateRange} 
          onChange={(e) => setDateRange(e.value as Date[])}
          selectionMode="range" 
          readOnlyInput 
          placeholder={t('selectDateRange')}
          showIcon
          className="w-full"
        />
      </div>
      {loading ? (
        <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i>
        </div>
      ) : chartData ? (
        <Chart type="bar" data={chartData} options={chartOptions} style={{ height: '400px' }} />
      ) : (
        <div className="flex justify-content-center align-items-center" style={{ height: '400px' }}>
          <p className="text-500">{tCommon('noData')}</p>
        </div>
      )}
    </Card>
  );
}
