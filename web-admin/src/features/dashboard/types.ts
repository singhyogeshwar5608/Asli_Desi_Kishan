export interface DashboardTotals {
  totalMembers: number;
  activeMembers: number;
  totalOrders: number;
  todaysOrders: number;
  totalSales: number;
  totalBv: number;
}

export interface TopMember {
  memberId: string;
  fullName: string;
  email: string;
  bv?: {
    total?: number;
    leftLeg?: number;
    rightLeg?: number;
  };
  stats?: {
    teamSize?: number;
  };
}

export interface DashboardMetricsResponse {
  totals: DashboardTotals;
  topMembers: TopMember[];
  salesSeries: Array<{ label: string; sales: number; bv: number }>;
}
