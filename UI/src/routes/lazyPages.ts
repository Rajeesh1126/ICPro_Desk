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

export const Login = lazyPage(() => import("@/pages/Login.tsx"));
export const ForgotPassword = lazyPage(() => import("@/pages/users/ForgotPassword.tsx"));
export const ResetPassword = lazyPage(() => import("@/pages/users/ResetPassword.tsx"));
export const HomePage = lazyPage(() => import("@/pages/HomePage.tsx"));
export const Landing = lazyPage(() => import("@/pages/Landing.tsx"));
export const Dashboard = lazyPage(() => import("@/pages/tickets/Dashboard.tsx"));
export const Reports = lazyPage(() => import("@/pages/tickets/Reports.tsx"));
export const Tickets = lazyPage(() => import("@/pages/tickets/Tickets.tsx"));
export const InternalTickets = lazyPage(() => import("@/pages/tickets/InternalTickets.tsx"));
export const SelfTickets = lazyPage(() => import("@/pages/tickets/SelfTickets.tsx"));
export const Users = lazyPage(() => import("@/pages/users/Users.tsx"));
export const Roles = lazyPage(() => import("@/pages/users/Roles.tsx"));
export const Documents = lazyPage(() => import("@/pages/general/Documents.tsx"));
export const ICProCalendar = lazyPage(() => import("@/pages/general/ICProCalendar.tsx"));
export const Suggestions = lazyPage(() => import("@/pages/general/Suggestions.tsx"));
export const LessonLearnt = lazyPage(() => import("@/pages/general/LessonLearnt.tsx"));
export const ProjectConfiguration = lazyPage(() => import("@/pages/ProjectConfiguration.tsx"));
export const PhaseConfiguration = lazyPage(() => import("@/pages/PhaseConfiguration.tsx"));
export const TimeSheet = lazyPage(() => import("@/pages/timesheet/TimeSheet.tsx"));
export const TimesheetLogs = lazyPage(() => import("@/pages/timesheet/TimesheetLogs.tsx"));
export const TimesheetAnalysis = lazyPage(() => import("@/pages/timesheet/TimesheetAnalysis.tsx"));

const pagesByPath: Record<string, { preload: () => Promise<PageModule> }> = {
  "/Home": Landing,
  "/Home/Dashboard": Dashboard,
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
 