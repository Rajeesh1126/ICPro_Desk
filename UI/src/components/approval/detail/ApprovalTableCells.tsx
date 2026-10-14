import { Box, Button, Chip, IconButton, TableCell, TableRow, Typography } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import type { ColumnData } from "../../common/TableView";
import type { TaskRow } from "../../../types/dataTypes";
import { formatHoursMinutes } from "../../../utils/hoursMinutes";
import type { ApprovalAction, ApprovalWeekDay } from "./approvalData";

/* Table cells and totals row for the approval detail dialog. */

export function JobCell({
  row,
  expanded,
  onToggle,
}: {
  row: TaskRow;
  expanded: boolean;
  onToggle: (projectId: number) => void;
}) {
  if (row.rowType !== "project") {
    return (
      <Typography component="span" sx={{ marginLeft: 4, fontSize: 13 }}>
        {row.task}
      </Typography>
    );
  }
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <IconButton
        aria-label={`${expanded ? "Collapse" : "Expand"} ${row.project}`}
        aria-expanded={expanded}
        onClick={() => onToggle(row.projectId)}
        sx={{ p: 0, mr: 0.5 }}
      >
        <KeyboardArrowDownOutlinedIcon
          sx={{
            fontSize: 18,
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        />
      </IconButton>
      <Box minWidth={0}>
        {row.description && (
          <Typography component="div" sx={{ fontSize: 13, fontWeight: 500 }}>
            {row.description}
          </Typography>
        )}
        <Typography component="div" sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
          {row.project}
        </Typography>
      </Box>
    </Box>
  );
}

export function HourCell({ value }: { value: string }) {
  if (!value) return null;
  return (
    <Box
      sx={(theme) => ({
        width: 48,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        borderRadius: 1,
        backgroundColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : theme.palette.grey[100],
        border: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        fontSize: 11.5,
        fontWeight: 500,
        transition: "background-color 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
        },
      })}
    >
      {value}
    </Box>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusColor = (() => {
    switch (status.trim().toLowerCase()) {
      case "submitted":
        return "primary";
      case "accepted":
        return "success";
      case "rejected":
        return "error";
      case "draft":
      default:
        return "secondary";
    }
  })();

  return (
    <Chip label={status} color={statusColor} variant="outlined" />
  );
}

export function ActionButton({
  action,
  busy,
  disabled,
  onClick,
}: {
  action: ApprovalAction;
  busy: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const accept = action === "Accepted";
  const Icon = accept ? CheckCircleOutlinedIcon : HighlightOffOutlinedIcon;
  return (
    <Button
      variant="contained"
      color={accept ? "success" : "error"}
      startIcon={busy ? undefined : <Icon />}
      disabled={disabled}
      onClick={onClick}
      sx={{ textTransform: "none", boxShadow: "none", "& .MuiButton-startIcon": { mr: 0.5 } }}
    >
      {busy ? "..." : accept ? "Accept" : "Reject"}
    </Button>
  );
}

/** Sticky "Total" row: per-day sums in h.mm. */
export function ApprovalTotalsRow({
  columns,
  days,
  totals,
}: {
  columns: ColumnData<TaskRow>[];
  days: ApprovalWeekDay[];
  totals: number[];
}) {
  return (
    <TableRow>
      {columns.map((column, index) => {
        const dayIndex = days.findIndex((day) => day.label === column.label);
        const first = index === 0;
        return (
          <TableCell
            key={column.label}
            align={dayIndex >= 0 ? "center" : "left"}
            sx={(theme) => ({
              width: column.width,
              minWidth: column.width,
              maxWidth: column.width,
              fontSize: 12,
              fontWeight: 700,
              color: theme.palette.text.primary,
              backgroundColor: first
                ? `${theme.palette.background.paper} !important`
                : theme.palette.background.paper,
              backgroundImage: "none",
              borderTop: `1px solid ${theme.palette.divider}`,
              position: first ? "sticky" : "static",
              left: first ? 0 : "auto",
              zIndex: first ? 16 : 1,
              overflow: "hidden",
              boxShadow: first
                ? `1px 0 0 ${theme.palette.divider}, 10px 0 12px -14px ${theme.palette.text.primary}`
                : undefined,
            })}
          >
            {column.label === "Budget Owner"
              ? "Total"
              : dayIndex >= 0
                ? formatHoursMinutes(totals[dayIndex])
                : ""}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
