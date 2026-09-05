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
  centeredDialogActions,
  errorDialogContent,
  errorDialogIcon,
  errorDialogMessage,
  errorDialogTitle,
  preLineText,
} from "../../styles/common";

interface Props {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
}

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
      <DialogTitle
        sx={errorDialogTitle}
      >
        <ErrorOutlineOutlinedIcon />
        {title}
      </DialogTitle>

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

      <DialogActions
        sx={centeredDialogActions}
      >
        <Button
          variant="contained"
          color="error"
          onClick={onClose}
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}
