import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, TextField, Typography } from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import DialogHeader from "@/components/common/DialogHeader";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  rejectTaskNameSx,
  rejectWarningSx,
} from "@/styles/common";

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
      <DialogHeader title="Reject submission?" />

      <DialogContent>
        <Typography sx={rejectTaskNameSx}>{taskName}</Typography>
        <Typography sx={rejectWarningSx}>
          This action cannot be undone. Please provide a rejection reason to confirm.
        </Typography>
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
        <Button startIcon={<CloseOutlinedIcon />} variant="outlined" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={submit}
          disabled={busy}
          startIcon={busy ? undefined : <BlockOutlinedIcon />}
        >
          {busy ? "Rejecting..." : "Reject"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
