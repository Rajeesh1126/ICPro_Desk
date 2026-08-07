import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

import CommonSnackbar from "../components/common/CommonSnackbar";
import { registerNotificationHandler } from "../api/NotificationService";

interface NotificationContextType {
    showNotification: (
        message: string,
        severity?: "success" | "error" | "warning" | "info"
    ) => void;
}

const NotificationContext = createContext<
    NotificationContextType | undefined
>(undefined);

export const NotificationProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [open, setOpen] = useState(false);

    const [message, setMessage] = useState("");

    const [severity, setSeverity] = useState<
        "success" | "error" | "warning" | "info"
    >("success");

    const showNotification = (
        message: string,
        severity: "success" | "error" | "warning" | "info" = "success"
    ) => {
        setMessage(message);
        setSeverity(severity);
        setOpen(true);
    };

    useEffect(() => {
        registerNotificationHandler(showNotification);
    }, []);

    return (
        <NotificationContext.Provider
            value={{ showNotification }}
        >
            {children}

            <CommonSnackbar
                open={open}
                message={message}
                severity={severity}
                onClose={() => setOpen(false)}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider"
        );
    }

    return context;
};