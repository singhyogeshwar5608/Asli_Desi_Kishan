import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import type { DashboardMetricsResponse } from './types';

const DASHBOARD_METRICS_KEY = ['dashboard-metrics'];

export const fetchDashboardMetrics = async () => {
  const { data } = await apiClient.get<DashboardMetricsResponse>('/reports/dashboard');
  return data;
};

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: DASHBOARD_METRICS_KEY,
    queryFn: fetchDashboardMetrics,
    staleTime: 1000 * 60 * 5,
  });
};
