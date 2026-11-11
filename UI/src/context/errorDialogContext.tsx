import {
    createContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

import CommonErrorDialog from "@/components/common/CommonErrorDialog";
import { registerErrorHandler } from "@/api/errorDialogService";

interface ErrorContextType {
    showError: (message: string, title?: string) => void;
}

// Context exposes the same error dialog used by both React and API service code.
const errorDialogContext = createContext<ErrorContextType | undefined>(
    undefined
);

/** Error Dialog Provider declaration used across the frontend. */
export const ErrorDialogProvider = ({
    children,
}: {
    children: ReactNode;
}) => {

    // Provider-owned state keeps the dialog mounted once while its content changes per error.
    const [open, setOpen] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("Error");
    const [message, setMessage] = useState<string>("");

    // Publishes an error and opens the shared dialog with the requested title.
    const showError = (message: string, title = "Error") => {
        setTitle(title);
        setMessage(message);
        setOpen(true);
    };

    // Bridges the framework-independent service to this provider after mount.
    useEffect(() => {
        registerErrorHandler(showError);
    }, []);

    return (
        <errorDialogContext.Provider value={{ showError }}>
            {children}
            <CommonErrorDialog
                open={open}
                title={title}
                message={message}
                onClose={() => setOpen(false)}
            />
        </errorDialogContext.Provider>
    );
};

