import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { queryClient } from "@/api/queryClient";

import App from "@/App";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import { ErrorDialogProvider } from "@/context/errorDialogContext";
import { AppThemeProvider } from "@/styles/theme/ThemeModeProvider";

// Inter (variable weight + optical size), bundled so it never depends on a CDN.
import "@fontsource-variable/inter/opsz.css";
import "@/index.css";
import { NotificationProvider } from "@/context/notificationContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    {/* "user": honour the OS reduced-motion setting for every animation. */}
    <MotionConfig reducedMotion="user">
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
    </MotionConfig>
    </QueryClientProvider>
  </React.StrictMode>
);
