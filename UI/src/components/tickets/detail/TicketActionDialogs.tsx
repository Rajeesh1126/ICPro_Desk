import { useState } from "react";
import {
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Rating,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import RatingModal from "@/components/tickets/RatingInfoModel";
import type { TicketData, UserSummary } from "@/types/dataTypes";
import { marginTopSectionSx, ratingSelectedLabelSx } from "@/styles/common";
import {
  isReasonAction,
  RATING_LABELS,
  REASON_DIALOGS,
  type StatusChangeExtras,
  type TicketActionId,
} from "@/components/tickets/detail/ticketActions";

interface TicketActionDialogsProps {
  /** The action whose confirmation to show (kept while it animates closed). */
  action: TicketActionId | null;
  open: boolean;
  onClose: () => void;
  ticket: TicketData;
  users: UserSummary[];
  /** Change the ticket's status; resolves once the request finishes. */
  onStatusChange: (status: string, extras?: StatusChangeExtras) => Promise<void>;
}

/**
 * Confirmation dialogs for every ticket action. Reason-based actions share
 * one dialog driven by REASON_DIALOGS. The caller remounts this component
 * for each new action (via `key`), so every dialog opens with empty fields.
 */
export default function TicketActionDialogs({
  action,
  open,
  onClose,
  ticket,
  users,
  onStatusChange,
}: TicketActionDialogsProps) {
  const [reason, setReason] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [ratingGuideOpen, setRatingGuideOpen] = useState(false);
  const [reassignTo, setReassignTo] = useState("");
  const [estimatedHours, setEstimatedHours] = useState<number | null>(null);
  const requiresEstimatedHours = Number(ticket.est_hours) === 0;

  const confirm = (status: string, extras?: StatusChangeExtras) => {
    void onStatusChange(status, extras);
    onClose();
  };

  // ---- Actions that need a written reason ------------------------------------
  if (action && isReasonAction(action)) {
    const config = REASON_DIALOGS[action];
    const ConfirmIcon = config.confirmIcon;
    return (
      <ConfirmDialog
        open={open}
        onClose={onClose}
        onConfirm={() => confirm(config.status, { remarks: reason.trim() })}
        title={config.title}
        description={config.description}
        confirmLabel={config.confirmLabel}
        confirmColor={config.tone}
        confirmIcon={ConfirmIcon ? <ConfirmIcon /> : undefined}
        confirmDisabled={!reason.trim()}
      >
        <TextField
          autoFocus
          required
          multiline
          rows={4}
          fullWidth
          label={config.fieldLabel}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={config.placeholder}
        />
      </ConfirmDialog>
    );
  }

  switch (action) {
    case "rate":
      return (
        <ConfirmDialog
          open={open}
          onClose={onClose}
          // The confirm button stays disabled until a rating is chosen; the
          // hint under the stars says why.
          onConfirm={() => {
            if (rating) confirm("closed", { rating });
          }}
          title="Rate our Service"
          confirmLabel="Confirm & Close"
          confirmColor="primary"
          confirmIcon={<TaskAltOutlinedIcon />}
          confirmDisabled={!rating}
          titleAdornment={
            <IconButton onClick={() => setRatingGuideOpen(true)} aria-label="Open rating guide">
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          }
        >
          <Stack alignItems="center" spacing={2} sx={marginTopSectionSx}>
            <Typography variant="body1">How would you rate the resolution of this Ticket?</Typography>
            <Rating
              size="large"
              value={rating}
              onChange={(_event, value) => setRating(value)}
              slotProps={{ root: { "aria-describedby": "ticket-rating-hint" } }}
            />
            {rating !== null ? (
              <Typography sx={ratingSelectedLabelSx}>{RATING_LABELS[rating]}</Typography>
            ) : (
              <Typography id="ticket-rating-hint" variant="caption" color="text.secondary">
                Select a rating to close this ticket.
              </Typography>
            )}
          </Stack>
          <RatingModal open={ratingGuideOpen} handleClose={() => setRatingGuideOpen(false)} />
        </ConfirmDialog>
      );

    case "accept":
      return (
        <ConfirmDialog
          open={open}
          onClose={onClose}
          onConfirm={() => {
            if (!requiresEstimatedHours) confirm("accepted");
            else if (estimatedHours !== null) confirm("accepted", { est_hours: estimatedHours });
            else onClose();
          }}
          title="Accept Ticket"
          description={
            requiresEstimatedHours
              ? "Please enter estimated hours before accepting this ticket."
              : `Are you sure you want to accept this ticket with ${ticket.est_hours} estimated hours?`
          }
          confirmLabel="Confirm Accept"
          confirmColor="success"
          confirmIcon={<CheckCircleOutlinedIcon />}
          confirmDisabled={requiresEstimatedHours && Number(estimatedHours) <= 0}
        >
          {requiresEstimatedHours && (
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Estimated Hours"
                type="number"
                fullWidth
                value={estimatedHours ?? ""}
                onChange={(event) => setEstimatedHours(Number(event.target.value))}
              />
            </Grid>
          )}
        </ConfirmDialog>
      );

    case "reassign":
      return (
        <ConfirmDialog
          open={open}
          onClose={onClose}
          onConfirm={() => confirm("assigned", reassignTo ? { assigned_to: reassignTo } : undefined)}
          title="Reassign Ticket"
          description="Please select a person for reassignment."
          confirmLabel="Confirm Reassign"
          confirmColor="secondary"
          confirmIcon={<PersonAddAltOutlinedIcon />}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Assign To</InputLabel>
              <Select label="Assign To" value={reassignTo} onChange={(event) => setReassignTo(event.target.value)}>
                {users.map((user) => (
                  <MenuItem key={user.users_id} value={`${user.users_id}|${user.first_name || user.username}`}>
                    {user.first_name || user.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </ConfirmDialog>
      );

    case "complete":
      return (
        <ConfirmDialog
          open={open}
          onClose={onClose}
          onConfirm={async () => {
            await onStatusChange("completed");
            onClose();
          }}
          title="Confirm Completion"
          description="This action will mark the ticket as completed. Do you want to continue?"
          confirmLabel="Confirm"
          confirmColor="success"
          confirmIcon={<TaskAltOutlinedIcon />}
        />
      );

    case "recallClose":
      return (
        <ConfirmDialog
          open={open}
          onClose={onClose}
          onConfirm={async () => {
            await onStatusChange("recall successful");
            onClose();
          }}
          title="Confirm Recall"
          description="This will recall the ticket and move it to the closed state. The ticket will no longer appear as active work."
          confirmLabel="Recall and close ticket"
          confirmColor="warning"
          confirmIcon={<AssignmentTurnedInOutlinedIcon />}
        />
      );

    default:
      return null;
  }
}
