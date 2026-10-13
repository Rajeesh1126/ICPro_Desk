let showErrorCallback:
    | ((message: string, title?: string) => void)
    | null = null;

export const registerErrorHandler = (
    callback: (message: string, title?: string) => void
) => {
    showErrorCallback = callback;
};

export const showGlobalError = (
    message: string,
    title = "Error"
) => {
    showErrorCallback?.(message, title);
};
