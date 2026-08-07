let showErrorCallback:
    | ((message: string, title?: string) => void)
    | null = null;

export const registerErrorHandler = (
    callback: (message: string, title?: string) => void
) => {
    console.log("registerErrorHandler()");
    showErrorCallback = callback;
};

export const showGlobalError = (
    message: string,
    title = "Error"
) => {
    console.log("showGlobalError()", message);
    showErrorCallback?.(message, title);
};