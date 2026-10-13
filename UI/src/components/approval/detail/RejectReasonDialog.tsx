import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

/**
 * Asks for a rejection reason. The caller remounts it (via `key`) per task,
 * so the field starts from that task's previous reason.
 */
export default function RejectReasonDialog({
  open,
  taskName,
  initialReason,
  busy,
  onCancel,
  onSubmit,
  onMissingReason,
}: {
  open: boolean;
  taskName?: string;
  initialReason: string;
  busy: boolean;
  onCancel: () => void;
  /** Called with the trimmed reason; the caller closes the dialog on success. */
  onSubmit: (reason: string) => void;
  onMissingReason: () => void;
}) {
  const [reason, setReason] = useState(initialReason);
  const [error, setError] = useState("");

  const submit = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Rejection reason is required.");
      onMissingReason();
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <Dialog open={open} onClose={busy ? undefined : onCancel} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontSize: 16, fontWeight: 700 }}>Rejection Reason</DialogTitle>

      <DialogContent>
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 1.5 }}>{taskName}</Typography>
        <TextField
          autoFocus
          fullWidth
          multiline
          minRows={4}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            if (error) setError("");
          }}
          error={Boolean(error)}
          helperText={error}
          placeholder="Enter rejection reason..."
          slotProps={{ htmlInput: { "aria-label": "Rejection reason" } }}
        />
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" startIcon={<CancelOutlinedIcon />} onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={submit}
          disabled={busy}
          startIcon={busy ? undefined : <SendOutlinedIcon />}
        >
          {busy ? "Submitting..." : "Submit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
