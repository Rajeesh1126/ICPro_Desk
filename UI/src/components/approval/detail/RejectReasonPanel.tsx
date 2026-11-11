import { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { rejectWarningSx } from "@/styles/common";
import { reviewRejectActionsSx, reviewRejectPanelSx } from "@/styles/approvalReview";

/**
 * Asks for a rejection reason in place, under the task's row, so the reviewer
 * keeps their position in a long week. The caller remounts it per task, so the
 * field starts from that task's previous reason. Escape cancels this panel
 * only; the review dialog stays open.
 */
export default function RejectReasonPanel({
  taskName,
  initialReason,
  busy,
  onCancel,
  onSubmit,
  onMissingReason,
}: {
  taskName: string;
  initialReason: string;
  busy: boolean;
  onCancel: () => void;
  /** Called with the trimmed reason; the caller closes the panel on success. */
  onSubmit: (reason: string) => void;
  onMissingReason: () => void;
}) {
  const [reason, setReason] = useState<string>(initialReason);
  const [error, setError] = useState<string>("");

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
    <Box
      role="group"
      aria-label={`Reject ${taskName}`}
      sx={reviewRejectPanelSx}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.stopPropagation();
        if (!busy) onCancel();
      }}
    >
      <Typography sx={rejectWarningSx}>
        This action cannot be undone. Please provide a rejection reason to confirm.
      </Typography>
      <TextField
        autoFocus
        fullWidth
        multiline
        minRows={2}
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
      <Box sx={reviewRejectActionsSx}>
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
      </Box>
    </Box>
  );
}
