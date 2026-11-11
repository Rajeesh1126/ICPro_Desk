import { Alert, CircularProgress, Dialog, DialogContent, Stack, Typography } from "@mui/material";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import DialogHeader from "@/components/common/DialogHeader";
import SelfTicketDetailModel from "@/components/selfTickets/DetailModel";
import TicketDetailModal from "@/components/tickets/DetailModal";
import type { EmployeeWorkItem } from "@/pages/tickets/teamPerformanceQuery";
import { assignTaskLoadingSx } from "@/styles/common";
import type { SelfTicketData, TicketData } from "@/types/dataTypes";

/** Each work type's own model: the list its page loads and its record endpoint. */
const WORK_MODELS = {
  "Work Let": { listUrl: "/tickets/", listParams: { is_internal: true } },
  "Do List": { listUrl: "/self-tickets/", listParams: { do_List: true } },
} as const;

type WorkRecord = TicketData | SelfTicketData;

interface WorkItemRecordDialogProps {
  item: EmployeeWorkItem;
  onClose: () => void;
}

/**
 * Opens a team work item in the same dialog as its Work Let or Do List page.
 * The team response has only summary fields, so the full record comes from
 * that work type's list, matched by work number. Items outside the list fall
 * back to the record endpoint; `item.id` is a string, so the record id is its
 * first number, confirmed by the work number. Edit stays on the pages.
 */
export default function WorkItemRecordDialog({ item, onClose }: WorkItemRecordDialogProps) {
  const { listUrl, listParams } = WORK_MODELS[item.kind];
  const listQuery = useApiQuery<WorkRecord[]>(listUrl, listParams);
  const listed = asArray<WorkRecord>(listQuery.data).find((row) => row.number === item.number);

  const recordId = String(item.id).match(/\d+/)?.[0];
  const needsRecord = listQuery.isFetched && !listed && Boolean(recordId);
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

  const loading = listQuery.isPending || (needsRecord && recordQuery.isPending);

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs" aria-labelledby="work-item-record-title">
      <DialogHeader id="work-item-record-title" title={item.number} subtitle={item.kind} onClose={onClose} />
      <DialogContent>
        {loading ? (
          <Stack role="status" alignItems="center" spacing={1.5} sx={assignTaskLoadingSx}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">Loading details…</Typography>
          </Stack>
        ) : (
          <Alert severity="error">Could not open this {item.kind} item. Please try again.</Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
