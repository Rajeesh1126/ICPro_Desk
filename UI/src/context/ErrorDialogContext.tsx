import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

import CommonErrorDialog from "../components/common/CommonErrorDialog";
import { registerErrorHandler } from "../api/ErrorDialogService";

interface ErrorContextType {
    showError: (message: string, title?: string) => void;
}

const ErrorDialogContext = createContext<ErrorContextType | undefined>(
    undefined
);

export const ErrorDialogProvider = ({
    children,
}: {
    children: ReactNode;
}) => {

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("Error");
    const [message, setMessage] = useState("");

    const showError = (message: string, title = "Error") => {
        console.log("showError()", message);

        setTitle(title);
        setMessage(message);
        setOpen(true);
    };

    // useEffect belongs INSIDE the component
    useEffect(() => {
        console.log("Registering error handler");
        registerErrorHandler(showError);
    }, []);

    return (
        <ErrorDialogContext.Provider value={{ showError }}>
            {children}

            <CommonErrorDialog
                open={open}
                title={title}
                message={message}
                onClose={() => setOpen(false)}
            />
        </ErrorDialogContext.Provider>
    );
};

export const useErrorDialog = () => {
    const context = useContext(ErrorDialogContext);

    if (!context) {
        throw new Error(
            "useErrorDialog must be used inside ErrorDialogProvider"
        );
    }

    return context;
};