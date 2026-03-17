'use client';

import { useState, useEffect, useRef } from 'react';
import { propertyService, Property } from '@/services/property.service';
import { userService, User } from '@/services/user.service';

export interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  soldProperties: number;
  totalUsers: number;
  totalValue: number;
  averagePrice: number;
  monthlyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'property' | 'user' | 'sale';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export interface ChartData {
  totalPropertiesChart: number[];
  activePropertiesChart: number[];
  soldPropertiesChart: number[];
  averagePriceChart: number[];
}

export const useDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false);
  const isMountedRef = useRef(false);
  
  const [stats, setStats] = useState<DashboardStats>({
    totalProperties: 0,
    activeProperties: 0,
    soldProperties: 0,
    totalUsers: 0,
    totalValue: 0,
    averagePrice: 0,
    monthlyGrowth: 0
  });
  
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [chartData, setChartData] = useState<ChartData>({
    totalPropertiesChart: [8, 12, 10, 14, 13, 15, 16],
    activePropertiesChart: [15, 18, 12, 20, 16, 22, 19],
    soldPropertiesChart: [35, 25, 15],
    averagePriceChart: [120, 125, 118, 130, 128, 132, 135]
  });

  const generateTrendData = (currentValue: number, variance: number = 0.2): number[] => {
    const safeValue = typeof currentValue === 'number' && !isNaN(currentValue) && currentValue > 0 
      ? currentValue 
      : 10;
      
    const trend = [];
    let value = safeValue * (0.6 + Math.random() * 0.3);
    for (let i = 0; i < 7; i++) {
      trend.push(Math.round(value));
      value += (safeValue - value) * 0.15 + (Math.random() - 0.5) * variance * safeValue;
    }
    trend[6] = safeValue;
    
    return trend;
  };

  const loadDashboardData = async () => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      console.log('[Dashboard] Skipping duplicate API call - already loading');
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      
      console.log('[Dashboard] Loading dashboard data...');
      
      // Load properties
      const propertiesResponse = await propertyService.getProperties({ 
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        order: 'DESC'
      });
      
      
      // Load users (no sorting since User entity doesn't have createdAt)
      const usersResponse = await userService.getUsers({ page: 1, limit: 100 });
      
      
      // Check if responses have the expected structure
      if (!propertiesResponse || !propertiesResponse.items) {
        throw new Error('Invalid properties response structure');
      }
      
      if (!usersResponse || !usersResponse.items) {
        throw new Error('Invalid users response structure');
      }
      
      // Calculate statistics
      const properties = propertiesResponse.items;
      const users = usersResponse.items;
      
      const activeProperties = properties.filter((p: Property) => p.status === 'active').length;
      const soldProperties = properties.filter((p: Property) => p.status === 'inactive').length;
      
      const totalValue = properties.reduce((sum: number, p: Property) => {
        const price = parseFloat(p.price.toString()) || 0;
        return sum + price;
      }, 0);
      
      const averagePrice = properties.length > 0 ? Math.round(totalValue / properties.length) : 0;
      
      setStats({
        totalProperties: properties.length,
        activeProperties,
        soldProperties,
        totalUsers: users.length,
        totalValue,
        averagePrice,
        monthlyGrowth: Math.random() * 20 - 10 // Mock data
      });
      
      // Generate chart data
      setChartData({
        totalPropertiesChart: generateTrendData(properties.length || 0, 0.1),
        activePropertiesChart: generateTrendData(activeProperties || 0, 0.15),
        soldPropertiesChart: [activeProperties, soldProperties, properties.length - activeProperties - soldProperties],
        averagePriceChart: generateTrendData(Math.round(averagePrice / 1000) || 120, 0.05)
      });
      
      // Recent properties (last 5)
      setRecentProperties(properties.slice(0, 5));
      
      // Generate recent activities from properties and users
      const propertyActivities: RecentActivity[] = [];
      
      // Add newly created properties
      properties.slice(0, 5).forEach((p: Property) => {
        const createdDate = new Date(p.createdAt);
        const updatedDate = new Date(p.updatedAt);
        const timeDiff = updatedDate.getTime() - createdDate.getTime();
        
        // If created and updated are very close (< 5 seconds), it's a new property
        if (timeDiff < 5000) {
          propertyActivities.push({
            id: `create-${p.id}`,
            type: 'property' as const,
            title: `newPropertyAdded`,
            description: `${p.code} - ${p.address}`,
            timestamp: p.createdAt,
            status: p.status
          });
        } else {
          // It was updated after creation
          propertyActivities.push({
            id: `update-${p.id}`,
            type: 'property' as const,
            title: `propertyUpdated`,
            description: `${p.code} - ${p.address}`,
            timestamp: p.updatedAt,
            status: p.status
          });
        }
      });
      
      // Add deleted properties (status = deleted or inactive)
      properties
        .filter((p: Property) => p.status === 'deleted')
        .slice(0, 3)
        .forEach((p: Property) => {
          propertyActivities.push({
            id: `delete-${p.id}`,
            type: 'property' as const,
            title: `propertyDeleted`,
            description: `${p.code} - ${p.address}`,
            timestamp: p.updatedAt,
            status: p.status
          });
        });
      
      // Don't include user activities since User entity doesn't have createdAt timestamp
      const userActivities: RecentActivity[] = [];
      
      console.log('[DEBUG] Property activities:', propertyActivities.map(a => ({ desc: a.description, timestamp: a.timestamp })));
      console.log('[DEBUG] User activities:', userActivities.map(a => ({ desc: a.description, timestamp: a.timestamp })));
      
      const allActivities = [...propertyActivities, ...userActivities];
      console.log('[DEBUG] Before sort:', allActivities.map(a => ({ desc: a.description, timestamp: a.timestamp })));
      
      const activities = allActivities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Limit to 10 most recent activities
      
      console.log('[DEBUG] After sort and slice:', activities.map(a => ({ desc: a.description, timestamp: a.timestamp })));
      
      setRecentActivities(activities);
      
      console.log('[Dashboard] Dashboard data loaded successfully');
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    if (!isMountedRef.current && typeof window !== 'undefined') {
      isMountedRef.current = true;
      loadDashboardData();
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return {
    loading,
    error,
    stats,
    recentProperties,
    recentActivities,
    chartData,
    refreshData: loadDashboardData
  };
};