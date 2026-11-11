import { prefetchApi } from "@/api/useApiQuery";
import { getPresetRange, type DateRange } from "@/pages/tickets/teamSummaryQuery";

export const TEAM_PERFORMANCE_URL = "/team-performance/";
export const teamPerformanceParams = (range: DateRange) => ({
  start_date: range.startDate, end_date: range.endDate,
});
export const prefetchTeamPerformance = () =>
  prefetchApi(TEAM_PERFORMANCE_URL, teamPerformanceParams(getPresetRange("weekly")));

export type PerformanceCount = { total: number; completed: number; progress: number };
export type EmployeePerformance = PerformanceCount & {
  id: number; name: string; username: string; count: number;
  worklet: PerformanceCount; dolist: PerformanceCount;
};
export type EmployeeWorkItem = {
  id: string; employee_id: number; kind: "Work Let" | "Do List";
  number: string; task: string; description: string; current_status: string;
  priority: string; target_date: string; creator_name: string; assigned_to_name: string;
  est_hours: number; schedule: string;
};
export type TeamPerformanceSummary = {
  total: number; statuses: Record<string, number>;
  employees: EmployeePerformance[]; work_items: EmployeeWorkItem[];
};
