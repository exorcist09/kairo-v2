import axiosInstance from "./axios";

export interface AnalyticsGraphData {
  points: string;
  labels: string[];
  yAxis: string[];
  total: string;
  successRate: string;
}

export interface HomeAnalyticsData {
  cards: {
    totalWorkflows: number;
    executionsToday: number;
    executionsYesterday: number;
    percentChangeVsYesterday: number | null;
    successRate: number;
    totalExecutions: number;
    completedExecutions: number;
    failedExecutions: number;
  };
  graph: {
    Today: AnalyticsGraphData;
    "7 Days": AnalyticsGraphData;
    "30 Days": AnalyticsGraphData;
  };
}

export const getHomeAnalytics = async (): Promise<HomeAnalyticsData> => {
  const response = await axiosInstance.get("/analytics/");
  return response.data.data;
};
