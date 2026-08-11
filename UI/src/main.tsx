import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ErrorDialogProvider } from "./context/ErrorDialogContext";
import { AppThemeProvider } from "./styles/theme/ThemeModeProvider";

import "./index.css";
import { NotificationProvider } from "./context/NotificationContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
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
  </React.StrictMode>
);