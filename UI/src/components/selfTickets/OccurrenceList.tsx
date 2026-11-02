import { useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";
import api from "@/api/axios";
import type { SelfTicketData, SelfTicketOccurrence } from "@/types/dataTypes";
import { formatDate } from "@/components/common/formatDate";

export default function OccurrenceList({ task, canComplete, onChange }: {
  task: SelfTicketData;
  canComplete: boolean;
  onChange: (task: SelfTicketData) => void;
}) {
  const [saving, setSaving] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  const occurrences = task.occurrences ?? [];
  const visible = showAll ? occurrences : occurrences.filter((item) => item.current_status === "open").slice(0, 20);
  const complete = async (item: SelfTicketOccurrence, status: "closed" | "cancelled") => {
    setSaving(item.id);
    try {
      const response = await api.post<SelfTicketOccurrence>(`/self-tickets/${task.id}/occurrence-status/`, {
        occurrence_id: item.id, current_status: status,
      });
      const updated = occurrences.map((row) => row.id === item.id ? response.data : row);
      onChange({ ...task, occurrences: updated, alarm: updated.some((row) => row.alarm && row.current_status === "open") });
    } catch { /* Shared request UI displays errors. */ }
    finally { setSaving(null); }
  };
  return <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">Occurrences</Typography>
    {task.is_active === false && <Alert severity="info">Schedule paused. Reminders are paused; existing occurrences remain available.</Alert>}
    <Typography variant="caption" color="text.secondary">Shows the next 12 months and existing history. Missed occurrences remain open.</Typography>
    <Stack spacing={1} sx={{ maxHeight: 320, overflowY: "auto", mt: 1 }}>
      {visible.map((item) => <Stack key={item.id} direction="row" alignItems="center" spacing={1} flexWrap="wrap">
        <Typography sx={{ flex: 1 }}>{formatDate(item.scheduled_date)} · {item.current_status === "closed" ? "Completed" : item.current_status}</Typography>
        {canComplete && item.current_status === "open" && <>
          <Button size="small" color="success" disabled={saving !== null} onClick={() => void complete(item, "closed")}>Complete</Button>
          <Button size="small" color="error" disabled={saving !== null} onClick={() => void complete(item, "cancelled")}>Cancel occurrence</Button>
        </>}
      </Stack>)}
      {!visible.length && <Typography>No open occurrences.</Typography>}
    </Stack>
    <Button size="small" onClick={() => setShowAll((current) => !current)}>{showAll ? "Show next 20 open occurrences" : `Show all (${occurrences.length})`}</Button>
  </Box>;
}
