import { Alert, CircularProgress, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import DialogHeader from "@/components/common/DialogHeader";
import { DETAIL_DIALOG_LABEL, DetailDialogHeader, DetailField, DetailTextField } from "@/components/common/DetailDialogParts";
import SelfTicketDetailModel from "@/components/selfTickets/DetailModel";
import TicketDetailModal from "@/components/tickets/DetailModal";
import { assignTaskLoadingSx, workItemSummaryGridSx } from "@/styles/common";
import type { SelfTicketData, TicketData } from "@/types/dataTypes";
import { formatIfDate } from "@/utils/dateRange";

/**
 * Each work type's own model: the list its page loads, the wider list the
 * Executive Overview loads (team items outside the user's own list), and
 * the record endpoint.
 */
const WORK_MODELS = {
  Ticket: {
    listUrl: "/tickets/",
    listParams: { is_internal: false },
    teamParams: { include_executive: true, is_internal: false },
  },
  "Work Let": {
    listUrl: "/tickets/",
    listParams: { is_internal: true },
    teamParams: { include_executive: true, is_internal: true },
  },
  "Do List": {
    listUrl: "/self-tickets/",
    listParams: { do_List: true },
    teamParams: { include_executive: true },
  },
} as const;

/** Work types that can be opened in their page's detail dialog. */
export type WorkItemKind = keyof typeof WORK_MODELS;

/**
 * The summary fields a team view has for one item. Only `number` and `kind`
 * are needed; the rest fill the summary shown when the full record is not
 * available to this user.
 */
export type WorkItemRef = {
  kind: WorkItemKind;
  number: string;
  id?: string | number | null;
  task?: string | null;
  description?: string | null;
  current_status?: string | null;
  priority?: string | null;
  creator_name?: string | null;
  assigned_to_name?: string | null;
  target_date?: string | null;
};

type WorkRecord = TicketData | SelfTicketData;

interface WorkItemRecordDialogProps {
  item: WorkItemRef;
  onClose: () => void;
}

/**
 * Opens a team work item in the same dialog as its Ticket, Work Let or Do List
 * page. Team responses have only summary fields, so the full record comes from
 * that work type's list, matched by work number. Items outside the list fall
 * back to the record endpoint when an id is known (`item.id` may be a string,
 * so the record id is its first number, confirmed by the work number). If the
 * record still cannot be loaded, the known summary fields are shown read-only.
 * Edit stays on the pages.
 */
export default function WorkItemRecordDialog({ item, onClose }: WorkItemRecordDialogProps) {
  const { listUrl, listParams, teamParams } = WORK_MODELS[item.kind];
  const listQuery = useApiQuery<WorkRecord[]>(listUrl, listParams);
  const ownListed = asArray<WorkRecord>(listQuery.data).find((row) => row.number === item.number);
  // Team items are often only in the wider list; load it only when needed.
  const needsTeamList = listQuery.isFetched && !ownListed;
  const teamListQuery = useApiQuery<WorkRecord[]>(listUrl, teamParams, { enabled: needsTeamList });
  const listed =
    ownListed ?? asArray<WorkRecord>(teamListQuery.data).find((row) => row.number === item.number);
  const listsDone = listQuery.isFetched && (Boolean(ownListed) || teamListQuery.isFetched);

  const recordId = item.id == null ? undefined : String(item.id).match(/\d+/)?.[0];
  const needsRecord = listsDone && !listed && Boolean(recordId);
  const recordQuery = useApiQuery<WorkRecord>(`${listUrl}${recordId}/`, listParams, {
    enabled: needsRecord,
    gcTime: 0,
  });
  const fetched = recordQuery.data?.number === item.number ? recordQuery.data : null;
  const record = listed ?? fetched;

  if (record) {
    return item.kind === "Do List" ? (
      <SelfTicketDetailModel open onClose={onClose} data={record as SelfTicketData} />
    ) : (
      <TicketDetailModal open onClose={onClose} data={record as TicketData} />
    );
  }

  const loading =
    listQuery.isPending || (needsTeamList && teamListQuery.isPending) || (needsRecord && recordQuery.isPending);

  if (loading) {
    return (
      <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="work-item-record-title">
        <DialogHeader id="work-item-record-title" title={item.number} subtitle={item.kind} onClose={onClose} />
        <DialogContent>
          <Stack role="status" alignItems="center" spacing={1.5} sx={assignTaskLoadingSx}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">Loading details…</Typography>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  // The full record is out of reach (not in this user's list, or the request
  // failed): show what the team view already knows instead of a dead end.
  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" aria-labelledby={DETAIL_DIALOG_LABEL}>
      <DetailDialogHeader
        eyebrow={item.kind}
        number={item.number}
        priority={item.priority}
        status={item.current_status}
        person={item.assigned_to_name !== undefined ? { label: "Assigned to", name: item.assigned_to_name } : null}
        onClose={onClose}
      />
      <DialogContent>
        <Stack spacing={1.5}>
          <Alert severity="info">
            {listQuery.isError || teamListQuery.isError || recordQuery.isError
              ? `Could not load the full ${item.kind} record. Showing its summary.`
              : `Showing the ${item.kind} summary. Open it from its own page for the full record.`}
          </Alert>
          {item.task && <DetailTextField label="Subject" value={item.task} />}
          <Stack sx={workItemSummaryGridSx}>
            {item.creator_name && <DetailField label="Assigned by" value={item.creator_name} />}
            {item.target_date && <DetailField label="Target date" value={formatIfDate(item.target_date)} />}
          </Stack>
          {item.description && <DetailTextField label="Description" value={item.description} multiline />}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
