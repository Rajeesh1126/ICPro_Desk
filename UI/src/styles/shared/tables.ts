/** Shared data tables. */
import {
  type ResponsiveStyleWidth,
  type TableStyleColumn,
  type ThemeStyleCallback,
  columnWidth,
  isActionsColumn,
  justifyFor,
  pinnedRightShadow,
  resolveColumnAlign,
  tableCell,
  tableContainerSx,
  tableRow,
  tableSx,
} from "@/styles/shared/base";
import { type CSSProperties, type SxProps } from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import { FONT, INSET_X, INSET_Y, RADIUS_PX, ROW_HEIGHT, type TableDensity } from "@/styles/tokens";

// components/selfTickets/DetailModel.styles.ts
// components/TableView.callback.styles.ts
export const tableBodyRowSx =
  ({
    alternatingRowSx,
    onRowClick,
  }: {
    alternatingRowSx: ThemeStyleCallback;
    onRowClick?: unknown;
  }): SxProps<Theme> =>
  (theme) => ({
    ...tableRow(Boolean(onRowClick))(theme),
    ...alternatingRowSx(theme),
  });

export const autoColumnMinWidth = 120;

/** How far a proportional table may shrink below its columns' total. */
export const TABLE_MIN_SCALE = 0.8;

/**
 * Sum of the column widths when every column has a plain pixel width (the
 * default is 100), else undefined. Tables use it to size columns as shares
 * of the table instead of fixed pixels.
 */
export const tableColumnsTotalWidth = (
  columns: { label?: string; width?: ResponsiveStyleWidth }[],
): number | undefined => {
  let total = 0;
  for (const column of columns) {
    const width = columnWidth(column);
    if (typeof width !== "number") return undefined;
    total += width;
  }
  return total || undefined;
};

/**
 * Smallest width a proportional table keeps before it scrolls sideways:
 * 80% of its columns' total. An explicit `tableMinWidth` always wins.
 */
export const resolveTableMinWidth = (
  tableMinWidth: number | string | undefined,
  totalWidth: number | undefined,
) =>
  tableMinWidth ?? (totalWidth ? Math.round(totalWidth * TABLE_MIN_SCALE) : undefined);

export const resolveTableColumnWidth = (
  columnWidth: ResponsiveStyleWidth | undefined,
  totalWidth?: number,
): {
  width: ResponsiveStyleWidth;
  minWidth: ResponsiveStyleWidth;
  maxWidth: ResponsiveStyleWidth;
} => {
  const width = columnWidth ?? 100;
  // Proportional: with a fixed table layout, percentage widths let the
  // columns share the available width (down to the table's min-width)
  // instead of forcing a horizontal scroll at 1280–1440px.
  if (totalWidth && typeof width === "number") {
    return {
      width: `${((width / totalWidth) * 100).toFixed(3)}%`,
      minWidth: 0,
      maxWidth: "none",
    };
  }
  const resolveWidthValue = (value: number | string) =>
    value === "auto" ? "auto" : value;
  const resolveMinWidthValue = (value: number | string) =>
    value === "auto" ? autoColumnMinWidth : value;
  const resolveMaxWidthValue = (value: number | string) =>
    value === "auto" ? "none" : value;

  if (width && typeof width === "object" && !Array.isArray(width)) {
    const responsiveWidth = width as Record<string, number | string>;
    const mapResponsiveWidth = (
      resolver: (value: number | string) => number | string,
    ): ResponsiveStyleWidth =>
      Object.fromEntries(
        Object.entries(responsiveWidth).map(([breakpoint, value]) => [
          breakpoint,
          resolver(value),
        ]),
      ) as ResponsiveStyleWidth;

    return {
      width: mapResponsiveWidth(resolveWidthValue),
      minWidth: mapResponsiveWidth(resolveMinWidthValue),
      maxWidth: mapResponsiveWidth(resolveMaxWidthValue),
    };
  }

  const scalarWidth = width as number | string;
  return {
    width: resolveWidthValue(scalarWidth),
    minWidth: resolveMinWidthValue(scalarWidth),
    maxWidth: resolveMaxWidthValue(scalarWidth),
  };
};

/** Shared table header cell for column  styles style or helper for the related interface. */
export const tableHeaderCellForColumnSx =
  ({
    column,
    index,
    tableHeaderCellSx,
    stickyFirstColumn,
    totalWidth,
  }: {
    column: TableStyleColumn;
    index: number;
    tableHeaderCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
    /** From tableColumnsTotalWidth: sizes the column as a share of the table. */
    totalWidth?: number;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const actionColumn = isActionsColumn(column);
    const actionPadding = column.width === 40 ? 0.25 : 0.75;
    const columnWidthSx = resolveTableColumnWidth(
      column.width,
      actionColumn ? undefined : totalWidth,
    );

    const align = actionColumn ? "center" : resolveColumnAlign(column);
    const pinRight = actionColumn;

    return {
      ...columnWidthSx,
      ...tableHeaderCellSx(theme),
      position: "sticky",
      top: 0,
      left: isStickyFirstColumn ? 0 : "auto",
      // Keep the fixed header corner above the horizontally scrolling headers.
      zIndex: isStickyFirstColumn || pinRight ? "30 !important" : 21,
      overflow: "hidden",
      // Long labels wrap onto a second line instead of being cut off.
      whiteSpace: "normal",
      lineHeight: 1.25,
      verticalAlign: "bottom",
      textAlign: align,
      ...(actionColumn
        ? {
            paddingInline: actionPadding,
            "& .MuiButton-root": {
              px: 1,
              whiteSpace: "nowrap",
            },
            "& .MuiIconButton-root": {
              width: 36,
              height: 36,
              p: 0.75,
              flexShrink: 0,
            },
          }
        : {}),
      "& .MuiTableSortLabel-root": {
        color: "inherit",
        fontWeight: 600,
        justifyContent: justifyFor[align],
      },
      ...(pinRight
        ? {
            right: 0,
            boxShadow: pinnedRightShadow(theme),
            backgroundColor: `${theme.palette.background.paper} !important`,
          }
        : {}),
      backgroundColor: isStickyFirstColumn
        ? `${theme.palette.background.paper} !important`
        : theme.palette.background.paper,
      ...(isStickyFirstColumn
        ? {
            // Sticky edge: a single hairline, no cast shadow.
            boxShadow: `1px 0 0 ${theme.palette.divider}`,
          }
        : {}),
    };
  };

/** Shared table body cell for column  styles style or helper for the related interface. */
export const tableBodyCellForColumnSx =
  ({
    column,
    index,
    stickyTableCellSx,
    stickyFirstColumn,
    totalWidth,
  }: {
    column: TableStyleColumn;
    index: number;
    stickyTableCellSx: ThemeStyleCallback;
    stickyFirstColumn: boolean;
    totalWidth?: number;
  }): SxProps<Theme> =>
  (theme) => {
    const isStickyFirstColumn = stickyFirstColumn && index === 0;
    const actionColumn = isActionsColumn(column);
    const actionPadding = column.width === 40 ? 0.25 : 0.75;
    const columnWidthSx = resolveTableColumnWidth(
      column.width,
      actionColumn ? undefined : totalWidth,
    );

    return {
      ...columnWidthSx,
      position: isStickyFirstColumn ? "sticky" : "static",
      left: isStickyFirstColumn ? 0 : "auto",
      zIndex: isStickyFirstColumn ? 15 : 1,
      ...stickyTableCellSx(theme),
      ...(isStickyFirstColumn
        ? { backgroundColor: `${theme.palette.background.paper} !important` }
        : {}),
      backgroundImage: "none",
      ...tableCell,
      // Explicit, so rendered content (icons, pills) follows the column too.
      textAlign: actionColumn ? "center" : resolveColumnAlign(column),
      boxSizing: "border-box",
      ...(actionColumn
        ? {
            paddingInline: actionPadding,
            "& > .MuiStack-root, & > .MuiBox-root": {
              justifyContent: "center",
              width: "100%",
            },
            "& .MuiButton-root": {
              px: 1,
              whiteSpace: "nowrap",
            },
            "& .MuiIconButton-root": {
              width: 36,
              height: 36,
              p: 0.75,
              flexShrink: 0,
            },
          }
        : {}),
      ...(isStickyFirstColumn
        ? {
            // Sticky edge: a single hairline, no cast shadow.
            boxShadow: `1px 0 0 ${theme.palette.divider}`,
          }
        : {}),
      ...(actionColumn
        ? {
            position: "sticky",
            right: 0,
            zIndex: 15,
            boxShadow: pinnedRightShadow(theme),
            // Opaque so scrolled cells never show through the pinned column.
            backgroundColor: `${theme.palette.background.paper} !important`,
          }
        : {}),
    };
  };

// components/TableView.dynamic.styles.ts
export const tablePanelSx = ({
  height,
}: {
  height?: number | string;
}): SxProps<Theme> => ({
  height: height ?? "100%",
  flex: height === "100%" ? "1 1 auto" : "0 0 auto",
  width: "100%",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: RADIUS_PX.lg,
  bgcolor: "background.paper",
});

// components/TableView.styles.ts
export const tableScrollContainerSx: SxProps<Theme> = {
  ...tableContainerSx,
};

export const tableBaseSx: SxProps<Theme> = {
  ...tableSx,
};

/** Shared table with min width  styles style or helper for the related interface. */
export const tableWithMinWidthSx = (
  tableMinWidth?: ResponsiveStyleWidth,
): SxProps<Theme> => ({
  ...tableSx,
  minWidth: tableMinWidth,
});

/** Shared table view table with min width style or helper for the related interface. */
export const tableViewTableWithMinWidth = (
  tableMinWidth?: number | string,
  density: TableDensity = "standard",
): SxProps<Theme> => ({
  ...tableBaseSx,
  minWidth: tableMinWidth,
  "& .MuiTableBody-root .MuiTableCell-root": {
    height: ROW_HEIGHT[density],
    ...(density === "compact" && { "--inset-y": "4px" }),
  },
});

/** Shared table header bar  styles style or helper for the related interface. */
export const tableHeaderBarSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 1.25,
  px: INSET_X,
  py: INSET_Y,
  borderBottom: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  flexWrap: { xs: "wrap", sm: "nowrap" },
  flex: "0 0 auto",
};

/** Shared table view title group  styles style or helper for the related interface. */
export const tableViewTitleGroupSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  minWidth: 0,
};

/** Shared table view title stack  styles style or helper for the related interface. */
export const tableViewTitleStackSx: SxProps<Theme> = {
  minWidth: 0,
  justifyContent: "center",
};

/** Shared table title  styles style or helper for the related interface. */
export const tableTitleSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  lineHeight: 1.25,
  minWidth: 0,
};

/** Small text link under a table title (e.g. "How ratings work"). */
export const tableHeaderLinkSx: SxProps<Theme> = {
  p: 0,
  minWidth: 0,
  fontSize: FONT.xs,
  fontWeight: 600,
  textTransform: "none",
  "& .MuiButton-startIcon": { mr: 0.5, "& svg": { fontSize: FONT.md } },
  "&:hover": { bgcolor: "transparent", textDecoration: "underline" },
};

/** Right side of a table title bar: the section action, then search. */
export const tableHeaderToolsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  flexShrink: 0,
  ml: "auto",
  // Phones: the tools (search) take their own full-width row.
  width: { xs: "100%", sm: "auto" },
};

/** The "+ Add …" button in a table section's title bar. */
export const tableHeaderAddButtonSx: SxProps<Theme> = {
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/** File name with a file icon; the full name shows on hover (title). */
export const fileNameCellSx: SxProps<Theme> = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  maxWidth: "100%",
  minWidth: 0,
  "& > .MuiSvgIcon-root": {
    fontSize: FONT.md,
    color: "text.secondary",
    flexShrink: 0,
  },
  "& > span": {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
};

/** Long text in a table cell: up to two lines, full text on hover. */
export const twoLineClampSx: SxProps<Theme> = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  lineHeight: 1.4,
};

/** Row count beside a table title, e.g. "Documents  2". */
export const tableTitleCountSx: SxProps<Theme> = (theme) => ({
  minWidth: 24,
  height: 20,
  px: 0.75,
  borderRadius: RADIUS_PX.pill,
  display: "inline-grid",
  placeItems: "center",
  fontSize: FONT.xs,
  fontWeight: 600,
  color: "text.secondary",
  bgcolor: alpha(
    theme.palette.text.primary,
    theme.palette.mode === "dark" ? 0.08 : 0.07,
  ),
});

/** Search placeholders name the content being searched. */
export const tableSearchPlaceholder = (title?: string) =>
  title
    ? `Search ${title
        .split(" ")
        // Keep acronyms ("ERP") as written; lower-case ordinary words.
        .map((word) => (/^[A-Z0-9]{2,}$/.test(word) ? word : word.toLowerCase()))
        .join(" ")}`
    : "Search";

/** Shared table subtitle  styles style or helper for the related interface. */
export const tableSubtitleSx: SxProps<Theme> = {
  color: "text.secondary",
  fontSize: FONT.xs,
  lineHeight: 1.25,
  minWidth: 0,
};

/** Table search: the standard field surface (from the theme), fixed width. */
export const tableSearchFieldSx: SxProps<Theme> = {
  width: { xs: "100%", sm: 260 },
};

/**
 * Scroll area of CollapsibleTableView. No reserved scrollbar gutter: it left
 * an empty strip on the right whenever the table didn't scroll, unlike
 * VirtualizedTable.
 */
export const collapsibleTableScrollSx: SxProps<Theme> = {
  overflow: "auto",
  minHeight: 0,
  height: "100%",
  width: "100%",
};

/** Shared table body area  styles style or helper for the related interface. */
export const tableBodyAreaSx: SxProps<Theme> = {
  minHeight: 0,
  flexGrow: 1,
  bgcolor: "background.paper",
  position: "relative",
  display: "flex",
  flexDirection: "column",
};

/** Shared table virtuoso style style or helper for the related interface. */
export const tableVirtuosoStyle: CSSProperties = {
  height: "100%",
  borderRadius: 0,
  border: 0,
};

/** Shared table empty overlay  styles style or helper for the related interface. */
export const tableEmptyOverlaySx: SxProps<Theme> = {
  position: "absolute",
  inset: "58px 0 0",
  display: "grid",
  placeItems: "center",
  // The overlay lets clicks reach the table, but its own actions stay usable.
  pointerEvents: "none",
  "& button, & a": { pointerEvents: "auto" },
};
