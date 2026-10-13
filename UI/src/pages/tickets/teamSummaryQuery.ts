import { prefetchApi } from "../../api/useApiQuery";

export type DatePreset = "weekly" | "biweekly" | "monthly" | "custom";
export type DateRange = { startDate: string; endDate: string };

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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
