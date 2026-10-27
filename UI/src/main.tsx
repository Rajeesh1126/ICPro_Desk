import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/queryClient";

import App from "@/App";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ErrorDialogProvider } from "@/context/errorDialogContext";
import { AppThemeProvider } from "@/styles/theme/ThemeModeProvider";

import "@/index.css";
import { NotificationProvider } from "@/context/notificationContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <AppThemeProvider>
      <BrowserRouter basename="/">
        <ErrorDialogProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </NotificationProvider>
        </ErrorDialogProvider>
      </BrowserRouter>
    </AppThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>
);