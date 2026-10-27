import { Alert, Snackbar } from "@mui/material";
import {
  snackbarAlertSx,
} from "@/styles/common";

export interface CommonSnackbarProps {
    open: boolean;
    message: string;
    severity?: "success" | "error" | "warning" | "info";
    autoHideDuration?: number;
    onClose: () => void;
}

export default function CommonSnackbar({
    open,
    message,
    severity = "success",
    autoHideDuration = 3000,
    onClose,
}: CommonSnackbarProps) {
    return (
        <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={(_, reason) => {
                if (reason === "clickaway") return;
                onClose();
            }}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={snackbarAlertSx}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}