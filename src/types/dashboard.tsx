// types/dashboard.ts
export interface DashboardStats {
  id: string;
  totalServices: number;
  totalDoctors: number;
  totalPatients: number;
  totalRevenue: number;
}

export interface ServiceStatistic {
  id: string;
  type: string;
  date: string;
  count: number;
}

export interface ServiceStatisticsResponse {
  id: string;
  values: ServiceStatistic[];
}

export interface MedicationStatisticsResponse {
  id: string;
  values: any[];
}