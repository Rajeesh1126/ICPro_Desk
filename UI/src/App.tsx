import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Reports from "./pages/Reports.tsx";
import TicketDashboard from "./pages/Tickets.tsx";
import SelfTickets from "./pages/SelfTickets.tsx";
import ErrorPage, { RoutedErrorPage } from "./pages/ErrorPage.tsx";
import { isTokenExpired } from "./api/axios.ts";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem("accessToken");

  if (!token || isTokenExpired(token)) {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("permissionList");
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/Tickets" element={<ProtectedRoute><TicketDashboard /></ProtectedRoute>} />
      <Route path="/SelfTickets" element={<ProtectedRoute><SelfTickets /></ProtectedRoute>} />
      <Route path="/Reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      <Route path="/error/:code" element={<RoutedErrorPage />} />
      <Route path="*" element={<ErrorPage code={404} />} />
    </Routes>
  );
}

export default App;
