import { Box } from "@mui/material";
import {
  formatStatusLabel,
  getStatusColor,
  priorityPillSx,
  statusPillSx,
} from "@/styles/common";

/** The app-wide status look: coloured dot + label in a tinted pill. */
export function StatusPill({
  status,
  label,
}: {
  status: unknown;
  label?: string;
}) {
  // Statuses are fixed API values ("open", "in progress"): capitalise the
  // first letter only, so dates inside labels ("Due by …") stay intact.
  const raw = label ?? formatStatusLabel(status);
  const text = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : raw;
  return (
    <Box component="span" title={text} sx={statusPillSx(getStatusColor(status))}>
      {text || "—"}
    </Box>
  );
}

/** The app-wide priority look: tinted pill in the priority colour. */
export function PriorityPill({ priority }: { priority: unknown }) {
  const raw = String(priority ?? "").trim();
  if (!raw) return <>—</>;
  const text = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
  return (
    <Box component="span" sx={priorityPillSx(priority)}>
      {text}
    </Box>
  );
}
