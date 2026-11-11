import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Suspense, type ReactNode } from "react";
import PageLoadingSkeleton from "@/components/common/PageLoadingSkeleton";
import { buildLoginPath, clearSession, hasActiveSession } from "@/api/session.ts";
import ErrorPage, { RoutedErrorPage } from "@/pages/ErrorPage.tsx";
import AuthLayout from "@/components/common/AuthLayout";
import { getStoredPermissions } from "@/utils/permissions";

// Sign-in forms are imported directly: as lazy chunks, each one suspended
// for a moment when the card flipped to it, leaving no card on screen.
import Login from "@/pages/Login.tsx";
import ForgotPassword from "@/pages/users/ForgotPassword.tsx";
import ResetPassword from "@/pages/users/ResetPassword.tsx";

import {
  Dashboard,
  TeamAnalysis,
  Documents,
  HomePage,
  ICProCalendar,
  InternalTickets,
  Landing,
  LessonLearnt,
  PhaseConfiguration,
  ProjectConfiguration,
  Reports,
  Roles,
  SelfTickets,
  Suggestions,
  Tickets as TicketDashboard,
  TimeSheet,
  TimesheetAnalysis,
  TimesheetLogs,
  Users,
} from "@/routes/lazyPages";
function PageSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoadingSkeleton />}>{children}</Suspense>;
}

function PageAccessRoute({
  children,
  permission,
}: {
  children: ReactNode;
  permission?: string;
}) {
  if (!permission) {
    return children;
  }

  return getStoredPermissions().has(permission)
    ? children
    : <Navigate to="/error/403" replace />;
}

const homeRoutes = [
  { path: "/Home", element: <Landing /> },
  { path: "/Home/Dashboard", element: <Dashboard />, permission: "access_team_analysis" },
  { path: "/Home/Tickets", element: <TicketDashboard />, permission: "access_tickets" },
  { path: "/Home/InternalTickets", element: <InternalTickets />, permission: "access_tickets" },
  { path: "/Home/SelfTickets", element: <SelfTickets />, permission: "access_self_tickets" },
  { path: "/Home/Reports", element: <Reports />, permission: "access_executive_overview" },
  { path: "/Home/TeamAnalysis", element: <TeamAnalysis />, permission: "access_team_analysis" },
  { path: "/Home/TimeSheet", element: <TimeSheet />, permission: "access_timesheet" },
  { path: "/Home/TimesheetLogs", element: <TimesheetLogs />, permission: "access_timesheet_log" },
  { path: "/Home/TimesheetAnalysis", element: <TimesheetAnalysis />, permission: "access_timesheet" },
  { path: "/Home/Documents", element: <Documents />, permission: "access_document_template" },
  { path: "/Home/ICProCalendar", element: <ICProCalendar />, permission: "view_calendarentry" },
  { path: "/Home/Suggestions", element: <Suggestions />, permission: "access_system_suggetions" },
  { path: "/Home/LessonLearnt", element: <LessonLearnt />, permission: "access_lesson_learnt" },
  { path: "/Home/Users", element: <Users />, permission: "access_user_management" },
  { path: "/Home/Roles", element: <Roles />, permission: "access_role_management" },
  { path: "/Home/ProjectConfiguration", element: <ProjectConfiguration />, permission: "access_project_configuration" },
  { path: "/Home/PhaseConfiguration", element: <PhaseConfiguration />, permission: "access_phase_configuration" },
];

function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const token = localStorage.getItem("accessToken");

  const destination = `${location.pathname}${location.search}${location.hash}`;

  if (!token && !localStorage.getItem("refreshToken")) {
    return <Navigate to={buildLoginPath(destination)} replace />;
  }

  if (!hasActiveSession()) {
    clearSession();
    return <Navigate to={buildLoginPath(destination, true)} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Sign-in pages share one backdrop and flip between each other. */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>
      <Route
        element={
          <ProtectedRoute>
            <PageSuspense><HomePage /></PageSuspense>
          </ProtectedRoute>
        }
      >
        {homeRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <PageAccessRoute permission={route.permission}>
                {route.element}
              </PageAccessRoute>
            }
          />
        ))}
        <Route path="/error/:code" element={<RoutedErrorPage />} />
        <Route path="*" element={<ErrorPage code={404} />} />
      </Route>
    </Routes>
  );
}

export default App;
