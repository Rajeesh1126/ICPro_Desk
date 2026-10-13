import React, { type ReactNode } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

import ConfirmDialog from "../common/ConfirmDialog";

type TimeSheetUnlockRequestModalProps = {
  open: boolean;
  weekNumber: number;
  weekRange: ReactNode;
  reason: string;
  submitting?: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

const TimeSheetUnlockRequestModal: React.FC<
  TimeSheetUnlockRequestModalProps
> = ({
  open,
  weekNumber,
  weekRange,
  reason,
  submitting = false,
  onReasonChange,
  onClose,
  onSubmit,
}) => {
  return (
    <ConfirmDialog
      open={open}
      title="Unlock Time Sheet Request"
      description="Explain why this submitted week needs to be reopened."
      confirmLabel={submitting ? "Requesting..." : "Request Unlock"}
      confirmDisabled={submitting || reason.trim().length === 0}
      titleIcon={<LockOpenOutlinedIcon fontSize="small" />}
      confirmIcon={<LockOpenOutlinedIcon fontSize="small" />}
      onClose={onClose}
      onConfirm={onSubmit}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="body2" fontWeight={700}>
          Week {weekNumber}
        </Typography>
        {weekRange}
      </Stack>
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Reason"
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
      />
    </ConfirmDialog>
  );
};

export default TimeSheetUnlockRequestModal;
