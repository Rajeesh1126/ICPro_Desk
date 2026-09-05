let showNotificationCallback:
    | ((
          message: string,
          severity?: "success" | "error" | "warning" | "info"
      ) => void)
    | null = null;

export const registerNotificationHandler = (
    callback: (
        message: string,
        severity?: "success" | "error" | "warning" | "info"
    ) => void
) => {
    showNotificationCallback = callback;
};

export const showNotification = ({
    message,
    type = "success",
}: {
    message: string;
    type?: "success" | "error" | "warning" | "info";
}) => {
    showNotificationCallback?.(message, type);
};