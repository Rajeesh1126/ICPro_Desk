// Keeps notification delivery independent from React components and API modules.
let showNotificationCallback:
    | ((
          message: string,
          severity?: "success" | "error" | "warning" | "info"
      ) => void)
    | null = null;

// Connects the global service to the notification provider mounted by the app.
export const registerNotificationHandler = (
    callback: (
        message: string,
        severity?: "success" | "error" | "warning" | "info"
    ) => void
) => {
    showNotificationCallback = callback;
};

// Requests a toast notification without requiring callers to know its UI implementation.
export const showNotification = ({
    message,
    type = "success",
}: {
    message: string;
    type?: "success" | "error" | "warning" | "info";
}) => {
    showNotificationCallback?.(message, type);
};
