import { lazy, type ComponentType } from "react";

type PageModule = { default: ComponentType };

/**
 * A lazily loaded page whose chunk can be fetched ahead of time. The import
 * promise is shared, so a hover/idle preload and the real render never
 * download twice.
 */
function lazyPage(loader: () => Promise<PageModule>) {
  let promise: Promise<PageModule> | undefined;
  const load = () => {
    promise ??= loader().catch(
      (error) => {
        promise = undefined; // allow a retry after a failed chunk download
        throw error;
      },
    );
    return promise;
  };
  const Component = lazy(load);
  return Object.assign(Component, { preload: load });
}

/** Home Page declaration used across the frontend. */
export const HomePage = lazyPage(() => import("@/pages/HomePage.tsx"));
/** Landing declaration used across the frontend. */
export const Landing = lazyPage(() => import("@/pages/Landing.tsx"));
/** Dashboard declaration used across the frontend. */
export const Dashboard = lazyPage(() => import("@/pages/tickets/Dashboard.tsx"));
export const TeamAnalysis = lazyPage(() => import("@/pages/tickets/teamAnalysis.tsx"));
/** Reports declaration used across the frontend. */
export const Reports = lazyPage(() => import("@/pages/tickets/Reports.tsx"));
/** Tickets declaration used across the frontend. */
export const Tickets = lazyPage(() => import("@/pages/tickets/Tickets.tsx"));
/** Internal Tickets declaration used across the frontend. */
export const InternalTickets = lazyPage(() => import("@/pages/tickets/InternalTickets.tsx"));
/** Self Tickets declaration used across the frontend. */
export const SelfTickets = lazyPage(() => import("@/pages/tickets/SelfTickets.tsx"));
/** Users declaration used across the frontend. */
export const Users = lazyPage(() => import("@/pages/users/Users.tsx"));
/** Roles declaration used across the frontend. */
export const Roles = lazyPage(() => import("@/pages/users/Roles.tsx"));
/** Documents declaration used across the frontend. */
export const Documents = lazyPage(() => import("@/pages/general/Documents.tsx"));
/** ICPro Calendar declaration used across the frontend. */
export const ICProCalendar = lazyPage(() => import("@/pages/general/ICProCalendar.tsx"));
/** Suggestions declaration used across the frontend. */
export const Suggestions = lazyPage(() => import("@/pages/general/Suggestions.tsx"));
/** Lesson Learnt declaration used across the frontend. */
export const LessonLearnt = lazyPage(() => import("@/pages/general/LessonLearnt.tsx"));
/** Project Configuration declaration used across the frontend. */
export const ProjectConfiguration = lazyPage(() => import("@/pages/ProjectConfiguration.tsx"));
/** Phase Configuration declaration used across the frontend. */
export const PhaseConfiguration = lazyPage(() => import("@/pages/PhaseConfiguration.tsx"));
/** Time Sheet declaration used across the frontend. */
export const TimeSheet = lazyPage(() => import("@/pages/timesheet/TimeSheet.tsx"));
/** Timesheet Logs declaration used across the frontend. */
export const TimesheetLogs = lazyPage(() => import("@/pages/timesheet/TimesheetLogs.tsx"));
/** Timesheet Analysis declaration used across the frontend. */
export const TimesheetAnalysis = lazyPage(() => import("@/pages/timesheet/TimesheetAnalysis.tsx"));

const pagesByPath: Record<string, { preload: () => Promise<PageModule> }> = {
  "/Home": Landing,
  "/Home/Dashboard": Dashboard,
  "/Home/TeamAnalysis": TeamAnalysis,
  "/Home/Tickets": Tickets,
  "/Home/InternalTickets": InternalTickets,
  "/Home/SelfTickets": SelfTickets,
  "/Home/Reports": Reports,
  "/Home/TimeSheet": TimeSheet,
  "/Home/TimesheetLogs": TimesheetLogs,
  "/Home/TimesheetAnalysis": TimesheetAnalysis,
  "/Home/Documents": Documents,
  "/Home/ICProCalendar": ICProCalendar,
  "/Home/Suggestions": Suggestions,
  "/Home/LessonLearnt": LessonLearnt,
  "/Home/Users": Users,
  "/Home/Roles": Roles,
  "/Home/ProjectConfiguration": ProjectConfiguration,
  "/Home/PhaseConfiguration": PhaseConfiguration,
};

/** Fetch a route's code ahead of navigation (sidebar hover/focus, idle time). */
export function preloadRoute(path: string) {
  void pagesByPath[path]?.preload().catch(() => undefined);
}

