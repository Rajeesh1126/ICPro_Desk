import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import { isTicketEditDisabled } from "@/utils/ticketEdit";
import { useMemo, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, Grid } from "@mui/material";
import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { showNotification } from "@/api/notificationService";
import type { TicketData, UserSummary } from "@/types/dataTypes";
import {
  buildStatusChangePayload,
  getAvailableActionGroups,
  STATUS_MESSAGES,
  type StatusChangeExtras,
  type TicketActionId,
} from "@/components/tickets/detail/ticketActions";
import {
  TicketActivityTimeline,
  TicketAttachments,
  TicketDetailHeader,
  TicketSummaryPanel,
} from "@/components/tickets/detail/TicketDetailSections";
import TicketActionButtons from "@/components/tickets/detail/TicketActionButtons";
import TicketActionDialogs from "@/components/tickets/detail/TicketActionDialogs";

const readStoredJson = (key: string) => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
};

/**
 * Ticket detail dialog: summary, activity and attachments on the left/right,
 * workflow actions at the bottom. Which actions appear and what they send is
 * defined in ./detail/ticketActions.
 */
export default function TicketDetailModal({
  open,
  onClose,
  data,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  data: TicketData;
  onEdit?: (ticket: TicketData) => void;
}) {
  const userId = readStoredJson("user") as number | null;
  // The login stores the profile under "currentUser"; there is no separate
  // "full_name" key, so build the name the status-change payload records.
  const currentUser = readStoredJson("currentUser") as { first_name?: string; last_name?: string } | null;
  const userName =
    [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(" ") ||
    (localStorage.getItem("first_name") ?? null);

  // Shared, cached user list for reassignment (fetched only while open).
  const usersQuery = useApiQuery<UserSummary[]>("/users/", undefined, { enabled: open });
  const users = useMemo(() => asArray<UserSummary>(usersQuery.data), [usersQuery.data]);

  // One confirmation at a time. `dialogKey` remounts the dialog per opening
  // so its fields start empty; the action is kept while it animates closed.
  const [dialog, setDialog] = useState<{ action: TicketActionId | null; open: boolean; key: number }>({
    action: null,
    open: false,
    key: 0,
  });
  const openAction = (action: TicketActionId) =>
    setDialog((current) => ({ action, open: true, key: current.key + 1 }));
  const closeAction = () => setDialog((current) => ({ ...current, open: false }));

  const changeStatus = async (status: string, extras: StatusChangeExtras = {}) => {
    try {
      const response = await api.patch(
        `/tickets/${data.id}/`,
        buildStatusChangePayload(data, status, extras, userName ?? ""),
      );
      if (response.status === 200) {
        onClose();
        showNotification({
          type: "success",
          message: STATUS_MESSAGES[status] ?? "Ticket updated successfully.",
        });
      }
    } catch {
      // The shared request error UI handles failures.
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
        <TicketDetailHeader ticket={data} onClose={onClose} />

        <DialogContent>
          <Grid container spacing={2.5} alignItems="stretch">
            <Grid size={{ xs: 12, md: 8 }}>
              <TicketSummaryPanel ticket={data} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TicketActivityTimeline logs={data.logs} currentUserId={userId} />
            </Grid>
          </Grid>
          <TicketAttachments files={data.files} />
        </DialogContent>

        <DialogActions>
          {onEdit && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditOutlinedIcon />}
              disabled={isTicketEditDisabled(data, userId)}
              onClick={() => {
                if (isTicketEditDisabled(data, userId)) return;
                onClose();
                onEdit(data);
              }}
            >
              Edit
            </Button>
          )}
          <TicketActionButtons
            groups={getAvailableActionGroups(data, userId)}
            onAction={openAction}
          />
        </DialogActions>
      </Dialog>

      <TicketActionDialogs
        key={dialog.key}
        action={dialog.action}
        open={dialog.open}
        onClose={closeAction}
        ticket={data}
        users={users}
        onStatusChange={changeStatus}
      />
    </>
  );
}
