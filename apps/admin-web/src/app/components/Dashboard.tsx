"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { formatCurrency } from '../utils/currency';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsCard } from './dashboard/StatsCard';
import { RecentPropertiesTable } from './dashboard/RecentPropertiesTable';
import { PropertyDistribution } from './dashboard/PropertyDistribution';
import { RecentActivities } from './dashboard/RecentActivities';
import { QuickStats } from './dashboard/QuickStats';
import { QuickActions } from './dashboard/QuickActions';
import AveragePriceChart from './AveragePriceChart';

const Dashboard: React.FC = () => {
  const t = useTranslations('dashboard');
  const { 
    loading, 
    stats, 
    recentProperties, 
    recentActivities, 
    chartData,
    refreshData
  } = useDashboardData();

  return (
    <div className="grid">
      {/* Stats Cards Row */}
      <div className="col-12">
        <div className="grid">
          <div className="col-12 md:col-6 lg:col-3">
            <StatsCard
              title={t('totalProperties')}
              value={stats.totalProperties}
              icon="pi pi-building"
              backgroundColor="#3B82F6"
              chartData={chartData.totalPropertiesChart}
              chartType="line"
              chartLabel={t('trend')}
              loading={loading}
            />
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <StatsCard
              title={t('activeProperties')}
              value={stats.activeProperties}
              icon="pi pi-check-circle"
              backgroundColor="#10B981"
              chartData={chartData.activePropertiesChart}
              chartType="bar"
              chartLabel={t('activity')}
              loading={loading}
            />
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <StatsCard
              title={t('inactiveProperties')}
              value={stats.soldProperties}
              icon="pi pi-dollar"
              backgroundColor="#F97316"
              chartData={chartData.soldPropertiesChart}
              chartType="doughnut"
              chartLabel={t('sales')}
              loading={loading}
            />
          </div>

          <div className="col-12 md:col-6 lg:col-3">
            <StatsCard
              title={t('averagePrice')}
              value={formatCurrency(stats.averagePrice)}
              icon="pi pi-euro"
              backgroundColor="#8B5CF6"
              chartData={chartData.averagePriceChart}
              chartType="bar"
              chartLabel={t('price')}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="col-12">
        <QuickActions />
      </div>

      {/* Charts and Tables Row */}
      <div className="col-12 lg:col-8">
        <RecentPropertiesTable 
          properties={recentProperties} 
          loading={loading}
          onRefresh={refreshData}
        />
      </div>

      <div className="col-12 lg:col-4">
        <PropertyDistribution
          activeProperties={stats.activeProperties}
          soldProperties={stats.soldProperties}
          totalProperties={stats.totalProperties}
          loading={loading}
        />
      </div>

      {/* Average Price Chart */}
      <div className="col-12">
        <AveragePriceChart />
      </div>

      {/* Recent Activities */}
      <div className="col-12 lg:col-6">
        <RecentActivities 
          activities={recentActivities} 
          loading={loading} 
        />
      </div>

      {/* Quick Stats */}
      <div className="col-12 lg:col-6">
        <QuickStats
          averagePrice={stats.averagePrice}
          totalUsers={stats.totalUsers}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Dashboard;
