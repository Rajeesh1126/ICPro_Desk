// Shared spacing token keeps the table surface aligned with page content.
// React supplies state, memoization, contexts, and component typings.
import * as React from "react";
// Material UI primitives build the table surface, toolbar, and responsive states.
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  Box,
  Typography,
  InputAdornment,
  Stack,
  useMediaQuery,
  type SxProps,
} from "@mui/material";
// Theme helpers provide breakpoint detection and theme-aware row styling.
import { useTheme, type Theme } from "@mui/material/styles";

// Virtuoso renders large datasets efficiently while preserving table semantics.
import { TableVirtuoso } from "react-virtuoso";
// Virtuoso component types keep the custom table element mapping type safe.
import type { TableComponents } from "react-virtuoso";
// Sort controls expose the active field and direction in column headers.
import { TableSortLabel } from "@mui/material";
// Down arrow indicates that a collapsible table is currently closed.
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// Up arrow indicates that a collapsible table is currently open.
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
// Search icon identifies the table-wide search field.
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
// EmptyTableState renders the standard no-data and no-results presentation.
import EmptyTableState from "@/components/common/EmptyTableState";
// MobileRowCard converts each record into the responsive card layout.
import MobileRowCard from "@/components/common/MobileRowCard";
// Date formatting keeps recognized date values consistent across cells.
import { formatIfDate } from "@/utils/dateRange";
// Search text extraction normalizes arbitrary column values for filtering.
import { getColumnSearchText } from "@/components/common/tableSearch";
// Cell helpers define rendering, formatting, and alignment behavior.
import {
  columnAlign,
  columnFormat,
  renderTableCell,
  type CellFormat,
  type ColumnAlign,
} from "@/components/common/tableCell";
// TableLoadingState supplies the shared table and card loading skeletons.
import TableLoadingState from "@/components/common/TableLoadingState";
// Shared style objects keep table surfaces, rows, headers, and controls consistent.
import {
  alternatingRowSx,
  stickyTableCellSx,
  tableHeadSx,
  tableHeaderCellSx,
  type TableRowStatus,
  tableHeaderBarSx,
  tableBodyAreaSx,
  tableEmptyOverlaySx,
  tableBodyRowSx,
  tableHeaderCellForColumnSx,
  tableBodyCellForColumnSx,
  tablePanelSx,
  tableScrollContainerSx,
  tableViewTableWithMinWidth,
  tableColumnsTotalWidth,
  resolveTableMinWidth,
  tableVirtuosoStyle,
  tableSearchFieldSx,
  tableViewTitleGroupSx,
  tableViewTitleStackSx,
  tableSubtitleSx,
  tableTitleSx,
  tableTitleCountSx,
  tableSearchPlaceholder,
  tableHeaderToolsSx,
  tableCardListSx,
  tableCardsEmptySx,
  tableExpandButtonSx,
} from "@/styles/common";

/** Width values supported by a table column at a single breakpoint. */
type ColumnWidth = number | "auto" | `${number}%`;
/** A fixed width or a width map that adapts across application breakpoints. */
type ResponsiveColumnWidth =
  | ColumnWidth
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", ColumnWidth>>;

/** Describes how one record field is labeled, sized, searched, and rendered. */
export interface ColumnData<T> {
  /** Human-readable heading displayed for this column. */
  label: string;
  /** Fixed or responsive width allocated to the column. */
  width?: ResponsiveColumnWidth;
  /** Right-aligns raw values when the column contains numbers. */
  numeric?: boolean;
  /** Optional record key used to read and sort the cell value. */
  dataKey?: keyof T;
  /** Optional renderer for values that need richer UI than formatted text. */
  render?: (row: T, index: number) => React.ReactNode;
  /** Optional plain-text value used by the table-wide search. */
  searchValue?: (row: T, index: number) => unknown;
  /** Display style for the raw value; "Status" / "Priority" labels infer it. */
  format?: CellFormat;
  /** Long text: show up to two lines (full text on hover) instead of one. */
  wrap?: boolean;
  /** Header and body cell alignment; defaults to right for numbers, else left. */
  align?: ColumnAlign;
  /**
   * Phone cards: columns with an order are the summary (shown first, in this
   * order); the rest go behind "Show more". Without any, the first few show.
   */
  mobileOrder?: number;
}

/** Configuration accepted by the shared desktop table and mobile card view. */
interface VirtualizedTableProps<T> {
  /** Column definitions that control table presentation and behavior. */
  columns: ColumnData<T>[];
  /** Records displayed by the table. */
  rows: T[];
  /** Height passed to the table panel when a page controls its size. */
  height?: string;
  /** Minimum desktop table width before horizontal scrolling begins. */
  tableMinWidth?: number | string;
  /** Opens or selects a record when its row is activated. */
  onRowClick?: (row: T) => void;
  /** Maps a record to the semantic status used for row accents. */
  getRowStatus?: (row: T) => TableRowStatus | undefined;
  /** Adds record-specific styling to a desktop row. */
  getRowSx?: (row: T) => SxProps<Theme> | undefined;
  /** Main title displayed in the table header. */
  tableHead?: string;
  /** Supporting text displayed below the table title. */
  tableHeadSub?: React.ReactNode;
  /** Creates an optional fixed footer from the currently displayed rows. */
  fixedFooterContent?: (rows: T[]) => React.ReactNode;
  /** Keeps the first column visible during horizontal scrolling. */
  stickyFirstColumn?: boolean;
  /** Allows the table body to be expanded and collapsed. */
  collapsible?: boolean;
  /** Controlled expanded state for a collapsible table. */
  expanded?: boolean;
  /** Reports changes to the controlled expanded state. */
  onExpandedChange?: (expanded: boolean) => void;
  /** True until the first response resolves; shows a skeleton instead of the empty state. */
  loading?: boolean;
  /** Heading used when the table contains no records. */
  emptyTitle?: string;
  /** Supporting copy used when the table contains no records. */
  emptyDescription?: string;
  /** Optional action displayed with the empty state. */
  emptyAction?: React.ReactNode;
  /** Clear, contextual wording for the table's row search. */
  searchPlaceholder?: string;
  /** Accessible label for the search input. */
  searchLabel?: string;
  /** Removes the table search control when a page supplies its own filtering. */
  hideSearch?: boolean;
  /** Section action shown at the right of the title bar, e.g. "+ Add task". */
  headerAction?: React.ReactNode;
  /** Column labels hidden on desktop (a column selector); phones show all. */
  hiddenColumns?: readonly string[];
  /**
   * Desktop: size the panel to its rows (capped at the available height, then
   * it scrolls) instead of always filling the page.
   */
  fitContent?: boolean;
}

/** Fixed header row height, used when the panel is sized to its rows. */
const FIT_HEADER_HEIGHT = 48;
/** Room for the empty state when a fitted table has no rows. */
const FIT_EMPTY_HEIGHT = 240;

/** Converts raw cell values into readable fallback text or formatted dates. */
const formatCellValue = (value: unknown): React.ReactNode => {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
    // Object arrays use their name field while primitive arrays use their text value.
    const formatted = value
      .map((item) =>
        typeof item === "object" && item !== null && "name" in item
          ? String(item.name)
          : String(item),
      )
      .join(", ");
    return formatted || "—";
  }

  return formatIfDate(value) as React.ReactNode;
};

/** Produces native hover text for simple values that may be visually truncated. */
const cellTitle = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(formatCellValue(value))
    : undefined;

/** Resolves a stable row key from common identifiers, with the index as fallback. */
const getRowKey = <T extends object>(row: T, index: number) => {
  if ("id" in row && row.id != null) return String(row.id);
  if ("number" in row && row.number != null) return String(row.number);
  return String(index);
};

/** Row callbacks shared through context so Virtuoso can keep its row component stable. */
type RowHandlers = {
  /** Opens or selects the record represented by a row. */
  onRowClick?: (row: never) => void;
  /** Resolves the row's semantic status for visual accents. */
  getRowStatus?: (row: never) => TableRowStatus | undefined;
  /** Resolves optional page-specific styling for a row. */
  getRowSx?: (row: never) => SxProps<Theme> | undefined;
};

/**
 * The table's latest row handlers. Virtuoso needs a stable row component:
 * if it were recreated whenever a page passed a new inline handler, every
 * row would remount, so keyboard focus would be lost after each action.
 */
const RowHandlersContext = React.createContext<RowHandlers>({});

/** Renders a virtualized desktop row with click, keyboard, status, and style behavior. */
function VirtualRow({
  item,
  ...props
}: {
  item: Record<string, unknown>;
} & React.HTMLAttributes<HTMLTableRowElement>) {
  // Read current page callbacks without rebuilding Virtuoso's row component.
  const { onRowClick, getRowStatus, getRowSx } = React.useContext(
    RowHandlersContext,
  ) as {
    onRowClick?: (row: Record<string, unknown>) => void;
    getRowStatus?: (row: Record<string, unknown>) => TableRowStatus | undefined;
    getRowSx?: (row: Record<string, unknown>) => SxProps<Theme> | undefined;
  };
  return (
    <TableRow
      {...props}
      hover={!!onRowClick}
      onClick={() => onRowClick?.(item)}
      // Clickable rows are reachable with Tab and open with Enter/Space.
      tabIndex={onRowClick ? 0 : undefined}
      onKeyDown={
        onRowClick
          ? (event: React.KeyboardEvent) => {
              if (event.target !== event.currentTarget) return;
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onRowClick(item);
              }
            }
          : undefined
      }
      data-status={getRowStatus?.(item)}
      sx={(theme) => {
        // Start with the shared alternating and interactive row styles.
        const baseRowSx = tableBodyRowSx({
          alternatingRowSx,
          onRowClick,
        }) as (theme: Theme) => Record<string, unknown>;
        // Allow the owning page to add styles for this specific record.
        const customRowSx = getRowSx?.(item);

        return {
          ...baseRowSx(theme),
          ...(typeof customRowSx === "function"
            ? customRowSx(theme)
            : customRowSx),
        };
      }}
    />
  );
}

/** Displays a reusable searchable table that switches to cards on small screens. */
export function VirtualizedTable<T extends object>({
  columns: allColumns,
  rows,
  height,
  tableMinWidth,
  onRowClick,
  getRowStatus,
  getRowSx,
  tableHead,
  tableHeadSub,
  fixedFooterContent,
  stickyFirstColumn = false,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  loading = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  searchPlaceholder,
  searchLabel,
  hideSearch = false,
  headerAction,
  hiddenColumns,
  fitContent = false,
}: VirtualizedTableProps<T>) {
  // Tracks Virtuoso's measured content height for tables that fit their rows.
  const [listHeight, setListHeight] = React.useState(0);
  // Provides the active application theme to responsive and style helpers.
  const theme = useTheme();
  // Selects the card layout at the application's phone breakpoint.
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  // Phone cards keep every field (secondary ones sit behind "Show more").
  const columns = React.useMemo(
    () =>
      isMobile || !hiddenColumns?.length
        ? allColumns
        : allColumns.filter((column) => !hiddenColumns.includes(column.label)),
    [allColumns, hiddenColumns, isMobile],
  );
  // Plain pixel widths become shares of the table so it fits the screen.
  const columnsTotalWidth = React.useMemo(
    () => tableColumnsTotalWidth(columns),
    [columns],
  );
  // Stores the record field currently used for client-side sorting.
  const [sortField, setSortField] = React.useState<keyof T | null>(null);
  // Stores the direction applied to the active sort field.
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc",
  );
  // Stores the user's table-wide search query.
  const [searchText, setSearchText] = React.useState("");
  // Applies the current search and sort settings without mutating source rows.
  const processedRows = React.useMemo(() => {
    // Begin with the supplied records and replace this list only when filtering.
    let filtered = rows;
    if (searchText.trim() !== "") {
      // Normalize the query once before comparing it with every searchable cell.
      const lower = searchText.toLowerCase();

      filtered = rows.filter((row, index) =>
        columns.some((column) => {
          return getColumnSearchText(column, row, index)
            .toLowerCase()
            .includes(lower);
        }),
      );
    }
    if (sortField) {
      filtered = [...filtered].sort((a, b) => {
        // Read both values from the active field for a stable pairwise comparison.
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue == null) return 1;
        if (bValue == null) return -1;

        if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
        if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [rows, searchText, sortField, sortDirection, columns]);

  // Memoize page callbacks so the context value changes only when a handler changes.
  const rowHandlers = React.useMemo(
    () => ({ onRowClick, getRowStatus, getRowSx }) as RowHandlers,
    [getRowSx, getRowStatus, onRowClick],
  );

  // Maps Virtuoso's structural slots to the application's styled table elements.
  const virtuosoTableComponents: TableComponents<T> = React.useMemo(
    () => ({
      Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer
          component={Paper}
          {...props}
          ref={ref}
          sx={tableScrollContainerSx}
        />
      )),
      Table: (props) => (
        <Table
          {...props}
          sx={tableViewTableWithMinWidth(
            resolveTableMinWidth(tableMinWidth, columnsTotalWidth),
          )}
        />
      ),
      TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableHead {...props} ref={ref} sx={tableHeadSx} />
      )),
      TableFoot: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableFooter {...props} ref={ref} />
      )),
      TableRow: VirtualRow as unknown as TableComponents<T>["TableRow"],
      TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
      )),
    }),
    [tableMinWidth, columnsTotalWidth],
  );

  /** Activates a new sort field or reverses the current field's direction. */
  const handleSort = (field?: keyof T) => {
    if (!field) return;

    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Normalize the optional heading for labels, messages, and accessible text.
  const tableTitle = tableHead ? tableHead : "";
  // Distinguish an empty search result from a table that has no source records.
  const isFiltered = searchText.trim() !== "" && rows.length > 0;
  // Build the contextual empty state shared by desktop and mobile layouts.
  const emptyState = isFiltered ? (
    <EmptyTableState
      title="No matching records"
      description={`Nothing in ${tableTitle} matches "${searchText.trim()}". Clear or change the search.`}
    />
  ) : (
    <EmptyTableState title={emptyTitle} description={emptyDescription} action={emptyAction} />
  );
  // A non-collapsible table is always treated as expanded.
  const isTableExpanded = !collapsible || expanded;
  // Resolve the shared table panel styles once for the supplied height.
  const paperSx = tablePanelSx({ height }) as Record<string, unknown>;

  /** Requests the opposite expanded state when collapsing is enabled. */
  const toggleExpanded = () => {
    if (!collapsible) return;
    onExpandedChange?.(!expanded);
  };

  /** Renders the sticky desktop header and its optional sort controls. */
  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={column.label}
          variant="head"
          align={columnAlign(column)}
          sx={tableHeaderCellForColumnSx({
            column,
            index,
            tableHeaderCellSx,
            stickyFirstColumn,
            totalWidth: columnsTotalWidth,
          })}
        >
          {column.dataKey ? (
            <TableSortLabel
              active={sortField === column.dataKey}
              direction={sortField === column.dataKey ? sortDirection : "asc"}
              onClick={() => handleSort(column.dataKey)}
            >
              {column.label}
            </TableSortLabel>
          ) : (
            column.label
          )}
        </TableCell>
      ))}
    </TableRow>
  );

  /** Renders every cell for one virtualized desktop row. */
  const rowContent = (rowIndex: number, row: T) => (
    <React.Fragment>
      {columns.map((column, index) => (
        <TableCell
          key={column.label}
          align={columnAlign(column)}
          title={
            !column.render && !columnFormat(column) && column.dataKey
              ? cellTitle(row[column.dataKey])
              : undefined
          }
          sx={tableBodyCellForColumnSx({
            column,
            index,
            stickyTableCellSx,
            stickyFirstColumn,
            totalWidth: columnsTotalWidth,
          })}
        >
          {renderTableCell(column, row, rowIndex, formatCellValue)}
        </TableCell>
      ))}
    </React.Fragment>
  );

  /** Adapts the shared cell renderer to MobileRowCard's render callback. */
  const renderColumnValue = (
    column: ColumnData<T>,
    row: T,
    rowIndex: number,
  ) => renderTableCell(column, row, rowIndex, formatCellValue);

  // Assemble the responsive card list and its centered empty state.
  const mobileContent = (
    <Box
      sx={tableCardListSx}
    >
      {processedRows.length ? (
        processedRows.map((row, rowIndex) => (
          <MobileRowCard
            key={getRowKey(row, rowIndex)}
            row={row}
            index={rowIndex}
            columns={columns}
            renderValue={renderColumnValue}
            accent={
              getRowStatus?.(row) ? `${getRowStatus(row)}.main` : undefined
            }
            onClick={onRowClick}
          />
        ))
      ) : (
        <Box
          sx={tableCardsEmptySx}
        >
          {emptyState}
        </Box>
      )}
    </Box>
  );

  // Assemble the virtualized desktop table, footer, and empty-state overlay.
  const tableContent = (
    <Box
      sx={
        fitContent
          ? {
              ...tableBodyAreaSx,
              // Shrink to the panel so Virtuoso owns overflow for long lists.
              flex: "0 1 auto",
              height: processedRows.length
                ? listHeight || FIT_HEADER_HEIGHT
                : FIT_EMPTY_HEIGHT,
            }
          : tableBodyAreaSx
      }
    >
      <RowHandlersContext.Provider value={rowHandlers}>
        <TableVirtuoso
          style={
            fitContent
              ? {
                  ...tableVirtuosoStyle,
                  // Rows' own height; flex lets it shrink to the space left.
                  height: processedRows.length
                    ? listHeight || FIT_HEADER_HEIGHT
                    : FIT_EMPTY_HEIGHT,
                  flex: "0 1 auto",
                  minHeight: 0,
                }
              : tableVirtuosoStyle
          }
          totalListHeightChanged={fitContent ? setListHeight : undefined}
          data={processedRows}
          components={virtuosoTableComponents}
          fixedHeaderContent={fixedHeaderContent}
          fixedFooterContent={
            fixedFooterContent
              ? () => fixedFooterContent(processedRows)
              : undefined
          }
          itemContent={rowContent}
        />
      </RowHandlersContext.Provider>
      {processedRows.length === 0 && (
        <Box sx={tableEmptyOverlaySx}>{emptyState}</Box>
      )}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        ...paperSx,
        ...(collapsible && !isTableExpanded
          ? { height: "auto", flex: "0 0 auto" }
          : null),
        ...(fitContent && !isMobile
          ? { height: "auto", maxHeight: "100%", flex: "0 1 auto" }
          : null),
      }}
    >
      <Box
        role={collapsible ? "button" : undefined}
        tabIndex={collapsible ? 0 : undefined}
        aria-expanded={collapsible ? isTableExpanded : undefined}
        sx={{
          ...tableHeaderBarSx,
          cursor: collapsible ? "pointer" : "default",
        }}
        onClick={toggleExpanded}
        onKeyDown={(event) => {
          if (!collapsible || event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <Box sx={tableViewTitleGroupSx}>
          {collapsible && (
            <IconButton
              aria-label={isTableExpanded ? "Collapse table" : "Expand table"}
              aria-expanded={isTableExpanded}
              onClick={(event) => {
                event.stopPropagation();
                toggleExpanded();
              }}
              sx={tableExpandButtonSx}
            >
              {isTableExpanded ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          )}
          <Stack spacing={0.5} sx={tableViewTitleStackSx}>
            <Typography variant="subtitle1" fontWeight={600} sx={tableTitleSx}>
              {tableTitle}
              {tableTitle && !loading && (
                <Box component="span" sx={tableTitleCountSx}>
                  {rows.length}
                </Box>
              )}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={400}
              sx={tableSubtitleSx}
            >
              {tableHeadSub ? tableHeadSub : ""}
            </Typography>
          </Stack>
        </Box>
        <Box
          sx={tableHeaderToolsSx}
          // Clicks here act on the tools, never toggle a collapsible table.
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
        {headerAction}
        {isTableExpanded && !hideSearch && (
          <TextField
            placeholder={searchPlaceholder ?? tableSearchPlaceholder(tableTitle)}
            variant="outlined"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onClick={(event) => event.stopPropagation()}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              },
              htmlInput: {
                "aria-label": searchLabel ?? `Search rows in ${tableTitle}`,
              },
            }}
            sx={tableSearchFieldSx}
          />
        )}
        </Box>
      </Box>
      {isTableExpanded &&
        (loading ? (
          <TableLoadingState
            variant={isMobile ? "cards" : "table"}
            label={`Loading ${tableTitle}`}
          />
        ) : isMobile ? (
          mobileContent
        ) : (
          tableContent
        ))}
    </Paper>
  );
}
