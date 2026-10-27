import type { ReactNode } from "react";
import { PriorityPill, StatusPill } from "@/components/common/StatusPill";
import { Box } from "@mui/material";
import { formatDecimalHours } from "@/utils/hoursMinutes";
import { twoLineClampSx } from "@/styles/common";

/**
 * How a table column shows its raw value:
 * - "status": the shared status pill
 * - "priority": the shared priority pill
 * - "label": a fixed API value ("action", "TEMPLATE") in sentence case
 * - "hours": decimal hours as "2 h 30 m", right-aligned
 * Anything else is shown exactly as stored (no forced capitalisation).
 */
export type CellFormat = "status" | "priority" | "label" | "hours";

export type ColumnAlign = "left" | "center" | "right";

type FormattableColumn<T> = {
  label: string;
  numeric?: boolean;
  /** Explicit alignment for the header and body cells; wins over inference. */
  align?: ColumnAlign;
  dataKey?: keyof T;
  format?: CellFormat;
  /** Long text: show up to two lines (full text on hover) instead of one. */
  wrap?: boolean;
  render?: (row: T, index: number) => ReactNode;
};

/** Explicit `format`, else inferred from the common "Status" / "Priority" labels. */
export function columnFormat<T>(column: FormattableColumn<T>): CellFormat | undefined {
  if (column.format) return column.format;
  if (column.label === "Status") return "status";
  if (column.label === "Priority") return "priority";
  return undefined;
}

/**
 * Cell alignment: the column's own `align` when set, otherwise numbers (and
 * hours) on the right and everything else on the left.
 */
export function columnAlign<T>(column: FormattableColumn<T>): ColumnAlign {
  if (column.label === "Actions") return "center";
  if (column.align) return column.align;
  return column.numeric || columnFormat(column) === "hours" ? "right" : "left";
}

export const sentenceCase = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";
};

/** Renders one cell the same way in every table (desktop rows and phone cards). */
export function renderTableCell<T>(
  column: FormattableColumn<T>,
  row: T,
  index: number,
  formatPlain: (value: unknown) => ReactNode,
): ReactNode {
  if (column.render) return column.render(row, index);
  if (!column.dataKey) return null;
  const value = row[column.dataKey];
  switch (columnFormat(column)) {
    case "status":
      return <StatusPill status={value} />;
    case "priority":
      return <PriorityPill priority={value} />;
    case "label":
      return sentenceCase(value) || formatPlain(value);
    case "hours":
      return formatDecimalHours(value);
    default:
      if (column.wrap && value != null && value !== "") {
        return (
          <Box component="span" title={String(value)} sx={twoLineClampSx}>
            {formatPlain(value)}
          </Box>
        );
      }
      return formatPlain(value);
  }
}
