"use client";

import React from 'react';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { MiniChart } from './MiniChart';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  backgroundColor: string;
  chartData: number[];
  chartType: 'line' | 'bar' | 'doughnut';
  chartLabel: string;
  loading?: boolean;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  backgroundColor,
  chartData,
  chartType,
  chartLabel,
  loading = false
}) => {
  return (
    <Card 
      className="text-white relative overflow-hidden" 
      style={{ minHeight: '140px', backgroundColor }}
    >
      <div className="flex justify-content-between align-items-start h-full">
        <div className="flex-1">
          <div className="text-white-alpha-90 mb-2 font-medium">{title}</div>
          {loading ? (
            <Skeleton width="60%" height="2rem" />
          ) : (
            <div className="text-3xl font-semibold text-white">{value}</div>
          )}
        </div>
        <div className="flex flex-column align-items-center justify-content-start ml-3" style={{ minWidth: '100px' }}>
          <i className={`${icon} text-2xl text-white-alpha-90 mb-2`}></i>
          {loading ? (
            <div className="w-full h-20 bg-white-alpha-20 border-round-sm"></div>
          ) : (
            <div className="flex flex-column align-items-center w-full">
              <div className="text-xs mb-2 font-semibold text-white">{chartLabel}</div>
              <div className="w-full h-20">
                <MiniChart 
                  data={chartData} 
                  type={chartType}
                  cardColor={backgroundColor}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};