import {
    createContext,
    useContext,
    useState,
    useEffect,
} from "react";

import type { ReactNode } from "react";

import CommonSnackbar from "../components/common/CommonSnackbar";
import { registerNotificationHandler } from "../api/notificationService";

interface notificationContextType {
    showNotification: (
        message: string,
        severity?: "success" | "error" | "warning" | "info"
    ) => void;
}

const notificationContext = createContext<
    notificationContextType | undefined
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
        <notificationContext.Provider
            value={{ showNotification }}
        >
            {children}

            <CommonSnackbar
                open={open}
                message={message}
                severity={severity}
                onClose={() => setOpen(false)}
            />
        </notificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(notificationContext);

    if (!context) {
        throw new Error(
            "useNotification must be used within NotificationProvider"
        );
    }

    return context;
};