import React, { type ReactNode } from "react";
import { Stack, TextField, Typography } from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  unlockRequestSummarySx,
} from "@/styles/common";

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
      title="Request timesheet unlock"
      description="Explain why this submitted week needs to be reopened."
      confirmLabel={submitting ? "Requesting..." : "Request Unlock"}
      confirmDisabled={submitting || reason.trim().length === 0}
      confirmIcon={<LockOpenOutlinedIcon fontSize="small" />}
      onClose={onClose}
      onConfirm={onSubmit}
    >
      <Stack direction="row" spacing={1} alignItems="center" sx={unlockRequestSummarySx}>
        <Typography variant="body2" fontWeight={600}>
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
