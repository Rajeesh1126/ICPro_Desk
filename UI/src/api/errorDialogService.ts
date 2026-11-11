// Stores the UI-owned error dialog callback so API code can report failures
// without importing or depending on a React component.
let showErrorCallback:
    | ((message: string, title?: string) => void)
    | null = null;

// Registers the mounted provider's dialog handler for global error reporting.
export const registerErrorHandler = (
    callback: (message: string, title?: string) => void
) => {
    showErrorCallback = callback;
};

// Delivers an error to the registered dialog, if the application has mounted it.
export const showGlobalError = (
    message: string,
    title = "Error"
) => {
    showErrorCallback?.(message, title);
};
