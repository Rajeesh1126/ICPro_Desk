import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

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
      PaperProps={{
        sx: {
          borderRadius: "6px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "error.main",
          color: "white",
          py: 2,
        }}
      >
        <ErrorOutlineIcon />
        {title}
      </DialogTitle>

      <DialogContent
        sx={{
          minHeight: 120,
          display: "flex",
          alignItems: "center",     // Vertical center
          justifyContent: "center", // Horizontal center
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            textAlign: "center",
          }}
        >
          <ErrorOutlineIcon
            color="error"
            sx={{ fontSize: 40, flexShrink: 0 }}
          />

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-line",
            }}
          >
            {message}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "center",
          pb: 2,
          px: 3,
        }}
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