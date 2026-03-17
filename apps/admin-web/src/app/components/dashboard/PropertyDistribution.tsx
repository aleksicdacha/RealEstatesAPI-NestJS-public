"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { ProgressBar } from 'primereact/progressbar';
import { Skeleton } from 'primereact/skeleton';

interface PropertyDistributionProps {
  activeProperties: number;
  soldProperties: number;
  totalProperties: number;
  loading: boolean;
}

export const PropertyDistribution: React.FC<PropertyDistributionProps> = ({
  activeProperties,
  soldProperties,
  totalProperties,
  loading
}) => {
  const t = useTranslations('dashboard');

  return (
    <Card title={t('propertyDistribution')} className="h-full">
      {loading ? (
        <Skeleton width="100%" height="250px" />
      ) : (
        <div className="flex flex-column gap-4">
          <div>
            <div className="flex justify-content-between mb-2">
              <span>{t('active')}</span>
              <span>{activeProperties}</span>
            </div>
            <ProgressBar 
              value={totalProperties > 0 ? (activeProperties / totalProperties) * 100 : 0} 
              className="mb-3" 
            />
          </div>
          
          <div>
            <div className="flex justify-content-between mb-2">
              <span>{t('inactive')}</span>
              <span>{soldProperties}</span>
            </div>
            <ProgressBar 
              value={totalProperties > 0 ? (soldProperties / totalProperties) * 100 : 0} 
              className="mb-3" 
            />
          </div>
          
          <div>
            <div className="flex justify-content-between mb-2">
              <span>{t('total')}</span>
              <span>{totalProperties}</span>
            </div>
            <ProgressBar value={100} />
          </div>
        </div>
      )}
    </Card>
  );
};