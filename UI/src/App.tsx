import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./pages/Login.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import HomePage from "./pages/HomePage.tsx";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/tickets/Dashboard.tsx";
import Reports from "./pages/tickets/Reports.tsx";
import TicketDashboard from "./pages/tickets/Tickets.tsx";
import SelfTickets from "./pages/tickets/SelfTickets.tsx";
import Users from "./pages/Users.tsx"
import Roles from "./pages/Roles.tsx"
import Documents from "./pages/Documents.tsx";
import Suggestions from "./pages/Suggestions.tsx";
import LessonLearnt from "./pages/LessonLearnt.tsx";
import ProjectConfiguration from "./pages/ProjectConfiguration.tsx";
import PhaseConfiguration from "./pages/PhaseConfiguration.tsx";

import TimeSheet from "./pages/timesheet/TimeSheet.tsx";
import TimesheetLogs from "./pages/timesheet/TimesheetLogs.tsx";

import ErrorPage, { RoutedErrorPage } from "./pages/ErrorPage.tsx";
import { isTokenExpired } from "./api/axios.ts";

function getStoredPermissions(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem("permissions") ?? "[]");
    return Array.isArray(value)
      ? value.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
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

  return getStoredPermissions().includes(permission)
    ? children
    : <Navigate to="/error/403" replace />;
}

const homeRoutes = [
  { index: true, element: <Landing /> },
  { path: "Dashboard", element: <Dashboard />, permission: "access_team_analysis" },
  { path: "Tickets", element: <TicketDashboard />, permission: "access_tickets" },
  { path: "SelfTickets", element: <SelfTickets />, permission: "access_self_tickets" },
  { path: "Reports", element: <Reports />, permission: "access_executive_overview" },
  { path: "TimeSheet", element: <TimeSheet />, permission: "access_timesheet" },
  { path: "TimesheetLogs", element: <TimesheetLogs />, permission: "access_timesheet" },
  { path: "Documents", element: <Documents /> },
  { path: "Suggestions", element: <Suggestions /> },
  { path: "LessonLearnt", element: <LessonLearnt /> },
  { path: "Users", element: <Users />, permission: "access_user_management" },
  { path: "Roles", element: <Roles />, permission: "access_role_management" },
  { path: "ProjectConfiguration", element: <ProjectConfiguration />, permission: "access_project_configuration" },
  { path: "PhaseConfiguration", element: <PhaseConfiguration />, permission: "access_phase_configuration" },
];

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("accessToken");

  if (!token || isTokenExpired(token)) {
    localStorage.clear();
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/Home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
        {homeRoutes.map((route) =>
          route.index ? (
            <Route key="home-index" index element={route.element} />
          ) : (
            <Route
              key={route.path}
              path={route.path}
              element={
                <PageAccessRoute permission={route.permission}>
                  {route.element}
                </PageAccessRoute>
              }
            />
          ),
        )}
      </Route>
      <Route path="/error/:code" element={<RoutedErrorPage />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
}

export default App;
