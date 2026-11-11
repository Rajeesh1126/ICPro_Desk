/** Expandable table. */
import { type SxProps } from "@mui/material";
import { type Theme } from "@mui/material/styles";
import { INSET_Y, ROW_HEIGHT, insetSx } from "@/styles/tokens";
import { type TableStyleColumn, stickyTableCellSx, tableHeaderCellSx } from "@/styles/shared/base";
import { tableBodyCellForColumnSx, tableHeaderCellForColumnSx } from "@/styles/shared/tables";

/* -------------------------------------------------------------------------- */
/* CollapsibleTableView                                                        */
/* -------------------------------------------------------------------------- */

/** Shared collapsible expand cell  styles style or helper for the related interface. */
export const collapsibleExpandCellSx = (width: number | undefined) => ({
  width,
  minWidth: width,
  maxWidth: width,
  px: 0,
  textAlign: "center" as const,
});

/** Shared collapsible expand button  styles style or helper for the related interface. */
export const collapsibleExpandButtonSx = { width: 28, height: 28 } satisfies SxProps<Theme>;

/** Shared collapsible row  styles style or helper for the related interface. */
export const collapsibleRowSx = (clickable: boolean) => ({
  cursor: clickable ? "pointer" : "default",
  "& > .MuiTableCell-root": { height: ROW_HEIGHT.standard },
});

/** Shared collapsible body cell  styles style or helper for the related interface. */
export const collapsibleBodyCellSx =
  (column: TableStyleColumn, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableBodyCellForColumnSx({
        column,
        index,
        stickyTableCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    px: 1,
  });

/** Shared collapsible header cell  styles style or helper for the related interface. */
export const collapsibleHeaderCellSx =
  (column: TableStyleColumn, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableHeaderCellForColumnSx({
        column,
        index,
        tableHeaderCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    px: 1,
  });

/** Shared collapsible detail row cell  styles style or helper for the related interface. */
export const collapsibleDetailRowCellSx = (open: boolean) => ({
  py: 0,
  borderBottom: open ? undefined : 0,
  // Closed rows must take no space. The table's row-height rule targets every
  // body cell, so outranking its specificity needs the repeated selector; the
  // cell still grows to fit its content when open.
  "&&&&": { height: 0 },
});

/** Expanded-row field: a plain label/value pair, no framed tile. */
export const collapsibleDetailFieldSx = {
  py: INSET_Y,
  minWidth: 0,
  height: "100%",
} satisfies SxProps<Theme>;

/** Shared collapsible card list  styles style or helper for the related interface. */
export const collapsibleCardListSx = {
  display: "flex",
  flex: 1,
  minHeight: 0,
  flexDirection: "column",
  gap: 1,
  overflowY: "auto",
  ...insetSx,
} satisfies SxProps<Theme>;

/** Shared collapsible cards empty  styles style or helper for the related interface. */
export const collapsibleCardsEmptySx = {
  display: "grid",
  flex: 1,
  minHeight: 220,
  placeItems: "center",
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Shared collapsible empty cell  styles style or helper for the related interface. */
export const collapsibleEmptyCellSx = { p: 0, height: 220 } satisfies SxProps<Theme>;

/** Shared collapsible empty state  styles style or helper for the related interface. */
export const collapsibleEmptyStateSx = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  textAlign: "center",
} satisfies SxProps<Theme>;

/** Screen-reader-only content (data tables behind charts, live labels). */
export const visuallyHiddenSx = {
  position: "absolute",
  width: "1px",
  height: "1px",
  p: 0,
  m: "-1px",
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
} as const;
