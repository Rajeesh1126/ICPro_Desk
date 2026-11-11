import { Alert, Snackbar } from "@mui/material";
import {
  snackbarAlertSx,
} from "@/styles/common";

/** Common Snackbar Props declaration used across the frontend. */
export interface CommonSnackbarProps {
    open: boolean;
    message: string;
    severity?: "success" | "error" | "warning" | "info";
    autoHideDuration?: number;
    onClose: () => void;
}

// Displays short-lived feedback while ignoring Snackbar's clickaway close event.
export default function CommonSnackbar({
    open,
    message,
    severity = "success",
    // Longer for problems: there is more to read and act on.
    autoHideDuration = severity === "error" || severity === "warning" ? 8000 : 4000,
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
