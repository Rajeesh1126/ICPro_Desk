import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  emptyTableIconSx,
  emptyTableStateSx,
} from "@/styles/common";

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** A consistent, accessible empty state for every application data table. */
export default function EmptyTableState({
  title = "No records available",
  description = "Records for the selected view will appear here.",
  icon,
  action,
}: EmptyTableStateProps) {
  return (
    <Stack
      role="status"
      alignItems="center"
      spacing={1}
      sx={emptyTableStateSx}
    >
      {icon ?? (
        <TableChartOutlinedIcon
          aria-hidden="true"
          sx={emptyTableIconSx}
        />
      )}
      <Typography color="text.primary" fontWeight={600}>
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
      {action}
    </Stack>
  );
}
