import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { apiQueryKey, fetchApi, prefetchApi, useApiQuery } from "@/api/useApiQuery";
import { freshnessFor } from "@/api/queryClient";
import type { WorkItemKind } from "@/components/dashboard/WorkItemRecordDialog";
import type { EmployeePerformance, PerformanceCount } from "@/pages/tickets/teamPerformanceQuery";
import type { TicketData } from "@/types/dataTypes";

/** Date Preset declaration used across the frontend. */
export type DatePreset = "weekly" | "biweekly" | "monthly" | "custom";
/** Date Range declaration used across the frontend. */
export type DateRange = { startDate: string; endDate: string };

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/** get Preset Range declaration used across the frontend. */
export const getPresetRange = (preset: Exclude<DatePreset, "custom">): DateRange => {
  const today = new Date();

  if (preset === "monthly") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { startDate: formatDate(start), endDate: formatDate(end) };
  }

  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + (preset === "biweekly" ? 13 : 6));
  return { startDate: formatDate(start), endDate: formatDate(end) };
};

/** TEAM_SUMMARY_URL declaration used across the frontend. */
export const TEAM_SUMMARY_URL = "/summary/";

/** Params for the Team Analysis summary; one cache entry per date range. */
export const teamSummaryParams = (range: DateRange, departmentId?: number) => ({
  include_executive: true,
  is_internal: false,
  department_id: departmentId,
  start_date: range.startDate,
  end_date: range.endDate,
});

/** Warm the default (weekly) Team Analysis summary, e.g. on sidebar hover. */
export const prefetchTeamSummary = () =>
  prefetchApi(TEAM_SUMMARY_URL, teamSummaryParams(getPresetRange("weekly")));

/* ---- Team Analysis data: one summary, then one report per team ---- */

type DepartmentLoad = { id: number; name: string; count: number; color?: string };

type TicketSummary = {
  total: number;
  statuses: Record<string, number>;
  departments: Record<string, number>;
  weekly_target_tickets: TicketData[];
  deptData: DepartmentLoad[];
};

type TeamReportRow = {
  id?: string | number | null;
  number: string;
  task: string;
  current_status: string;
  priority?: string;
  creator_name?: string;
  assigned_to_name?: string;
  target_date?: string | null;
  est_hours?: number | null;
  act_hours?: number | null;
};

/** One team's report: its tickets and Do List for the range. */
type TeamReport = {
  department: { id: number | null; name: string; manager: string };
  tickets: TeamReportRow[];
  dolist: TeamReportRow[];
};

/** A team with ticket and Do List completion, in the employee progress shape. */
export type TeamProgress = EmployeePerformance & { manager: string };

/** One ticket or Do List item due in the range, with its team. */
export type TeamWorkItem = TeamReportRow & {
  /** Unique per row: kind, team and number. */
  key: string;
  kind: Extract<WorkItemKind, "Ticket" | "Do List">;
  team_id: number;
  team_name: string;
};

const DONE_STATUSES = new Set(["completed", "closed"]);

const countProgress = (rows: TeamReportRow[]): PerformanceCount => {
  const completed = rows.filter((row) => DONE_STATUSES.has(String(row.current_status).toLowerCase())).length;
  return {
    total: rows.length,
    completed,
    progress: rows.length ? Math.round((completed / rows.length) * 100) : 0,
  };
};

/**
 * Team Analysis data. The summary lists the teams; each team's report (the
 * same cached request the team report used) supplies its tickets and Do List.
 * Ticket rows gain target date and hours from the summary's target tickets.
 */
export function useTeamAnalysis(range: DateRange) {
  const summaryQuery = useApiQuery<Partial<TicketSummary>>(TEAM_SUMMARY_URL, teamSummaryParams(range));
  const departments = useMemo(() => summaryQuery.data?.deptData ?? [], [summaryQuery.data]);

  const reportQueries = useQueries({
    queries: departments.map((department) => {
      const params = teamSummaryParams(range, department.id);
      return {
        queryKey: apiQueryKey(TEAM_SUMMARY_URL, params),
        queryFn: ({ signal }: { signal: AbortSignal }) => fetchApi<TeamReport>(TEAM_SUMMARY_URL, params, signal),
        ...freshnessFor(TEAM_SUMMARY_URL),
      };
    }),
  });

  const reportsData = reportQueries.map((query) => query.data);
  const reportsKey = reportQueries.map((query) => query.dataUpdatedAt).join(",");

  const result = useMemo(() => {
    const targets = new Map(
      (summaryQuery.data?.weekly_target_tickets ?? []).map((ticket) => [ticket.number, ticket]),
    );
    const teams: TeamProgress[] = [];
    const items: TeamWorkItem[] = [];

    departments.forEach((department, index) => {
      const report = reportsData[index];
      const tickets = report?.tickets ?? [];
      const dolist = report?.dolist ?? [];
      const ticketCounts = countProgress(tickets);
      const dolistCounts = countProgress(dolist);
      const all = countProgress([...tickets, ...dolist]);
      teams.push({
        id: department.id,
        name: department.name,
        username: department.name,
        manager: report?.department.manager ?? "",
        count: all.total,
        ...all,
        worklet: ticketCounts,
        dolist: dolistCounts,
      });
      const toItem = (kind: TeamWorkItem["kind"]) => (row: TeamReportRow): TeamWorkItem => {
        const target = kind === "Ticket" ? targets.get(row.number) : undefined;
        return {
          ...row,
          target_date: row.target_date ?? target?.target_date ?? null,
          est_hours: row.est_hours ?? target?.est_hours ?? null,
          act_hours: row.act_hours ?? target?.act_hours ?? null,
          key: `${kind}-${department.id}-${row.number}`,
          kind,
          team_id: department.id,
          team_name: department.name,
        };
      };
      items.push(...tickets.map(toItem("Ticket")), ...dolist.map(toItem("Do List")));
    });

    return { teams, items };
    // reportsKey changes whenever any team report's data does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departments, reportsKey, summaryQuery.data]);

  const reportsPending = reportQueries.some((query) => query.isPending);
  const reportsError = reportQueries.some((query) => query.isError);

  return {
    ...result,
    loading: summaryQuery.isPending || reportsPending,
    isError: summaryQuery.isError || reportsError,
    hasData: Boolean(summaryQuery.data),
    isFetching: summaryQuery.isFetching || reportQueries.some((query) => query.isFetching),
    refetch: () => {
      void summaryQuery.refetch();
      reportQueries.forEach((query) => void query.refetch());
    },
  };
}
