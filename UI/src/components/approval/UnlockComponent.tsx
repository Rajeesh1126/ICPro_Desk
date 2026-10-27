import { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import {
  compactFieldSx,
  emptyStateSx,
  tableHeaderBarSx,
  tableTitleSx,
  tableViewTitleGroupSx,
  unlockAvatarSx,
  unlockListSx,
  unlockPanelSx,
  wrapAnywhereSx,
} from "@/styles/common";
import { RADIUS_PX } from "@/styles/tokens";
import type { timesheetStatusData } from "@/types/dataTypes";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface UnlockComponentProps {
  unlockRequests: timesheetStatusData[];
  handleUnlockStatus: (id: number, status: string, comments?: string) => Promise<boolean>;
}

const requestName = (request: timesheetStatusData) => request.first_name?.trim() || "Employee";

export default function UnlockComponent({ unlockRequests, handleUnlockStatus }: UnlockComponentProps) {
  const [rejectModelOpen, setRejectModelOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const closeRejectDialog = () => {
    if (updatingId !== null) return;
    setRejectModelOpen(false);
    setRejectRequestId(null);
    setComments("");
  };

  const acceptRequest = async (id: number) => {
    setUpdatingId(id);
    try {
      await handleUnlockStatus(id, "Unlocked");
    } finally {
      setUpdatingId(null);
    }
  };

  const rejectRequest = async () => {
    if (rejectRequestId === null) return;
    setUpdatingId(rejectRequestId);
    try {
      if (await handleUnlockStatus(rejectRequestId, "Unlock Rejected", comments)) {
        setRejectModelOpen(false);
        setRejectRequestId(null);
        setComments("");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Box
      sx={unlockPanelSx}
    >
      <Box sx={tableHeaderBarSx}>
        <Box sx={tableViewTitleGroupSx}>
          <LockOpenOutlinedIcon color="warning" fontSize="small" />
          <Box>
            <Typography variant="subtitle1" sx={tableTitleSx}>
              Unlock Requests
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Review pending timesheet access requests
            </Typography>
          </Box>
        </Box>
        <Chip label={unlockRequests.length} color="warning" variant="outlined" />
      </Box>

      {unlockRequests.length ? (
        <Stack spacing={1} sx={unlockListSx}>
          {unlockRequests.map((request) => {
            const name = requestName(request);
            const isUpdating = updatingId === request.id;

            return (
              <Paper
                key={request.id}
                variant="outlined"
                sx={(theme) => ({
                  p: 1,
                  borderRadius: RADIUS_PX.md,
                  borderColor: theme.palette.divider,
                  bgcolor: theme.palette.background.default,
                })}
              >
                <Stack spacing={1.1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={unlockAvatarSx}>
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box minWidth={0} flex={1}>
                      <Typography noWrap fontWeight={600} fontSize={13}>
                        {name}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      REASON
                    </Typography>
                    <Typography variant="body2" sx={wrapAnywhereSx}>
                      {request.unlock_reason?.trim() || "No reason provided."}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={<HighlightOffOutlinedIcon />}
                      disabled={isUpdating || updatingId !== null}
                      onClick={() => {
                        setRejectRequestId(request.id);
                        setRejectModelOpen(true);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      color="success"
                      variant="contained"
                      startIcon={<CheckCircleOutlinedIcon />}
                      disabled={isUpdating || updatingId !== null}
                      onClick={() => void acceptRequest(request.id)}
                    >
                      {isUpdating ? "Updating..." : "Approve"}
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      ) : (
        <Box sx={emptyStateSx}>
          <Stack spacing={0.5} alignItems="center">
            <LockOpenOutlinedIcon color="disabled" />
            <Typography variant="body2" color="text.secondary">
              No unlock requests pending
            </Typography>
          </Stack>
        </Box>
      )}

      <ConfirmDialog
        open={rejectModelOpen}
        onClose={closeRejectDialog}
        onConfirm={() => void rejectRequest()}
        title="Reject unlock request?"
        description="Provide a clear reason so the employee knows what must be addressed."
        confirmLabel={updatingId !== null ? "Rejecting..." : "Reject"}
        confirmColor="error"
        confirmIcon={<HighlightOffOutlinedIcon />}
        confirmDisabled={!comments.trim() || updatingId !== null}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label="Reason for rejection"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Explain why this request cannot be approved."
          sx={compactFieldSx}
        />
      </ConfirmDialog>
    </Box>
  );
}
