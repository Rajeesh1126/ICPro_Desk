import { Alert, Snackbar } from "@mui/material";

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
                vertical: "top",
                horizontal: "right",
            }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{
                    width: "100%",
                    minWidth: 350,
                    borderRadius: "4px",
                    alignItems: "center",
                    fontSize: "0.95rem",
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
}