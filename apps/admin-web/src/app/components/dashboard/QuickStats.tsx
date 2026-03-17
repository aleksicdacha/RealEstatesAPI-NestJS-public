"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';
import { formatCurrency } from '../../utils/currency';

interface QuickStatsProps {
  averagePrice: number;
  totalUsers: number;
  loading: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ 
  averagePrice, 
  totalUsers, 
  loading 
}) => {
  const t = useTranslations('dashboard');

  return (
    <Card title={t('quickStats')}>
      <div className="grid">
        <div className="col-6">
          <div className="text-center p-3">
            <i className="pi pi-chart-line text-4xl text-blue-500 mb-3"></i>
            <div className="text-900 font-semibold mb-2">{t('avgPrice')}</div>
            {loading ? (
              <Skeleton width="80%" height="1.5rem" />
            ) : (
              <div className="text-xl text-600">{formatCurrency(averagePrice)}</div>
            )}
          </div>
        </div>
        
        <div className="col-6">
          <div className="text-center p-3">
            <i className="pi pi-users text-4xl text-green-500 mb-3"></i>
            <div className="text-900 font-semibold mb-2">{t('totalUsers')}</div>
            {loading ? (
              <Skeleton width="60%" height="1.5rem" />
            ) : (
              <div className="text-xl text-600">{totalUsers}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border-round">
        <div className="flex align-items-center">
          <i className="pi pi-info-circle text-blue-500 mr-2"></i>
          <span className="text-blue-800">
            {t('systemStatus')}
          </span>
        </div>
      </div>
    </Card>
  );
};