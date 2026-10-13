import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
}

/** A consistent, accessible empty state for every application data table. */
export default function EmptyTableState({
  title = "No records available",
  description = "Records for the selected view will appear here.",
  icon,
}: EmptyTableStateProps) {
  return (
    <Stack
      role="status"
      alignItems="center"
      spacing={1}
      sx={{ maxWidth: 360, px: 2, textAlign: "center" }}
    >
      {icon ?? (
        <TableChartOutlinedIcon
          aria-hidden="true"
          sx={{ color: "primary.main", fontSize: 42, opacity: 0.72 }}
        />
      )}
      <Typography color="text.primary" fontWeight={700}>
        {title}
      </Typography>
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
    </Stack>
  );
}
