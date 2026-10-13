import { useMemo, useState } from "react";
import { Dialog, DialogActions, DialogContent, Grid } from "@mui/material";
import api from "../../api/axios";
import { asArray, useApiQuery } from "../../api/useApiQuery";
import { showNotification } from "../../api/notificationService";
import type { TicketData, UserSummary } from "../../types/dataTypes";
import {
  buildStatusChangePayload,
  getAvailableActionGroups,
  STATUS_MESSAGES,
  type StatusChangeExtras,
  type TicketActionId,
} from "./detail/ticketActions";
import {
  TicketActivityTimeline,
  TicketAttachments,
  TicketDetailHeader,
  TicketSummaryPanel,
} from "./detail/TicketDetailSections";
import TicketActionButtons from "./detail/TicketActionButtons";
import TicketActionDialogs from "./detail/TicketActionDialogs";

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
}: {
  open: boolean;
  onClose: () => void;
  data: TicketData;
}) {
  const userId = readStoredJson("user") as number | null;
  const userName = readStoredJson("full_name") as string | null;

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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TicketSummaryPanel ticket={data} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TicketActivityTimeline logs={data.logs} />
            </Grid>
          </Grid>
          <TicketAttachments files={data.files} />
        </DialogContent>

        <DialogActions>
          <TicketActionButtons groups={getAvailableActionGroups(data, userId)} onAction={openAction} />
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
