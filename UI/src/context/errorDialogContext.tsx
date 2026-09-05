import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

import CommonErrorDialog from "../components/common/CommonErrorDialog";
import { registerErrorHandler } from "../api/errorDialogService";

/* eslint-disable react-refresh/only-export-components */

interface ErrorContextType {
    showError: (message: string, title?: string) => void;
}

const errorDialogContext = createContext<ErrorContextType | undefined>(
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
        // console.log("showError()", message);
        setTitle(title);
        setMessage(message);
        setOpen(true);
    };

    // useEffect belongs INSIDE the component
    useEffect(() => {
        // console.log("Registering error handler");
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

export const useErrorDialog = () => {
    const context = useContext(errorDialogContext);

    if (!context) {
        throw new Error(
            "useErrorDialog must be used inside ErrorDialogProvider"
        );
    }

    return context;
};
