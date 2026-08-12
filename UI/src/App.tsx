import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./pages/Login.tsx";
import HomePage from "./pages/HomePage.tsx";
import Landing from "./pages/Landing.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Reports from "./pages/Reports.tsx";
import TicketDashboard from "./pages/Tickets.tsx";
import SelfTickets from "./pages/SelfTickets.tsx";
import Users from "./pages/Users.tsx"
import Roles from "./pages/Roles.tsx"

import TimeSheet from "./pages/timesheet/TimeSheet.tsx";

import ErrorPage, { RoutedErrorPage } from "./pages/ErrorPage.tsx";
import { isTokenExpired } from "./api/axios.ts";

const homeRoutes = [
  { index: true, element: <Landing /> },
  { path: "Dashboard", element: <Dashboard /> },
  { path: "Tickets", element: <TicketDashboard /> },
  { path: "SelfTickets", element: <SelfTickets /> },
  { path: "Reports", element: <Reports /> },
  { path: "TimeSheet", element: <TimeSheet /> },
  { path: "Users", element: <Users /> },
  { path: "Roles", element: <Roles /> },
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
      <Route path="/Home" element={<ProtectedRoute><HomePage /></ProtectedRoute>}>
        {homeRoutes.map((route) =>
          route.index ? (
            <Route key="home-index" index element={route.element} />
          ) : (
            <Route key={route.path} path={route.path} element={route.element} />
          ),
        )}
      </Route>
      <Route path="/error/:code" element={<RoutedErrorPage />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
}

export default App;

 