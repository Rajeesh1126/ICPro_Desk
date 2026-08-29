import React from "react";
import { TextField } from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

import ConfirmDialog from "../common/ConfirmDialog";

type TimeSheetUnlockRequestModalProps = {
  open: boolean;
  weekNumber: number;
  weekRange: string;
  reason: string;
  submitting?: boolean;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
};

const TimeSheetUnlockRequestModal: React.FC<TimeSheetUnlockRequestModalProps> = ({
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
      description={`Request unlock for Week ${weekNumber} (${weekRange}).`}
      confirmLabel={submitting ? "Requesting..." : "Request Unlock"}
      confirmDisabled={submitting || reason.trim().length === 0}
      titleIcon={<LockOpenOutlinedIcon fontSize="small" />}
      onClose={onClose}
      onConfirm={onSubmit}
    >
      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Reason"
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        size="small"
      />
    </ConfirmDialog>
  );
};

export default TimeSheetUnlockRequestModal;
