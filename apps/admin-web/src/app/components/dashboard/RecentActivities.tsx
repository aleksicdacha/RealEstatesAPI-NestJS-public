"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card } from 'primereact/card';
import { Skeleton } from 'primereact/skeleton';

interface RecentActivity {
  id: string;
  type: 'property' | 'user' | 'sale';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

interface RecentActivitiesProps {
  activities: RecentActivity[];
  loading: boolean;
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  activities, 
  loading 
}) => {
  const t = useTranslations('dashboard');
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card title={t('recentActivities')}>
      {loading ? (
        <div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex align-items-center p-3 border-bottom-1 surface-border">
              <Skeleton shape="circle" size="2.5rem" className="mr-3" />
              <div className="flex-1">
                <Skeleton width="100%" height="1rem" className="mb-2" />
                <Skeleton width="60%" height="0.8rem" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="timeline timeline-left">
          {activities.map((activity) => {
            // Extract just the activity name from title like "dashboard.activities.propertyUpdated"
            const activityName = activity.title.split('.').pop() || '';
            
            // Use direct translation key from dashboard namespace
            const translatedTitle = t(activityName as any);
            
            // Determine icon and color based on activity name
            let icon = 'pi-building';
            let iconColor = 'text-blue-500';
            
            if (activityName === 'propertyUpdated') {
              icon = 'pi-refresh';
              iconColor = 'text-orange-500';
            } else if (activityName === 'propertyDeleted') {
              icon = 'pi-trash';
              iconColor = 'text-red-500';
            } else if (activityName === 'newPropertyAdded') {
              icon = 'pi-plus-circle';
              iconColor = 'text-green-500';
            } else if (activityName === 'newUserRegistered' || activityName === 'userUpdated') {
              icon = 'pi-user';
              iconColor = 'text-purple-500';
            }
            
            return (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-marker">
                  <i className={`pi ${icon} ${iconColor}`}></i>
                </div>
                <div className="timeline-content">
                  <div className="font-semibold text-900">{translatedTitle}</div>
                  <div className="text-600 mb-2">{activity.description}</div>
                  <small className="text-400">{formatDate(activity.timestamp)}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};