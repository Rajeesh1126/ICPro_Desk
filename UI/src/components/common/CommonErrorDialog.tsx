import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import {
  errorDialogContent,
  errorDialogIcon,
  errorDialogMessage,
  preLineText,
} from "@/styles/common";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

// Presents a consistent, acknowledgement-only dialog for validation and API errors.
export default function CommonErrorDialog({
  open,
  title = "Validation Error",
  message,
  onClose,
}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>

      <DialogContent
        sx={errorDialogContent}
      >
        <Box
          sx={errorDialogMessage}
        >
          <ErrorOutlineOutlinedIcon
            color="error"
            sx={errorDialogIcon}
          />

          <Typography
            variant="body1"
            sx={preLineText}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={onClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
