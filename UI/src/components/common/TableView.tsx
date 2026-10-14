import { insetSx } from "../../styles/tokens";
import * as React from "react";
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
  Badge,
  Typography,
  InputAdornment,
  Stack,
  useMediaQuery,
  type SxProps,
} from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";

// Corrected Imports for verbatimModuleSyntax
import { TableVirtuoso } from "react-virtuoso";
import type { TableComponents } from "react-virtuoso";
import { TableSortLabel } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmptyTableState from "./EmptyTableState";
import { formatIfDate } from "../../utils/dateRange";
import { getColumnSearchText } from "./tableSearch";
import TableLoadingState from "./TableLoadingState";
import {
  alternatingRowSx,
  formatStatusLabel,
  getStatusColor,
  stickyTableCellSx,
  tableHeadSx,
  tableHeaderCellSx,
  type TableRowStatus,
  tableStatusCellSx,
  tableHeaderBarSx,
  tableBodyAreaSx,
  tableEmptyOverlaySx,
  tableBodyRowSx,
  tableHeaderCellForColumnSx,
  tableBodyCellForColumnSx,
  tableStatusDotSx,
  tablePanelSx,
  tableScrollContainerSx,
  tableViewTableWithMinWidth,
  tableVirtuosoStyle,
  tableSearchFieldSx,
  tableViewTitleGroupSx,
  tableViewTitleStackSx,
  tableSubtitleSx,
  tableStatusTextSx,
  tableTitleSx,
} from "../../styles/common";

type ColumnWidth = number | "auto" | `${number}%`;
type ResponsiveColumnWidth =
  | ColumnWidth
  | Partial<Record<"xs" | "sm" | "md" | "lg" | "xl", ColumnWidth>>;

export interface ColumnData<T> {
  label: string;
  width?: ResponsiveColumnWidth;
  numeric?: boolean;
  dataKey?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  /** Optional plain-text value used by the table-wide search. */
  searchValue?: (row: T, index: number) => unknown;
}

interface VirtualizedTableProps<T> {
  columns: ColumnData<T>[];
  rows: T[];
  height?: string;
  tableMinWidth?: number | string;
  onRowClick?: (row: T) => void;
  getRowStatus?: (row: T) => TableRowStatus | undefined;
  getRowSx?: (row: T) => SxProps<Theme> | undefined;
  tableHead?: string;
  tableHeadSub?: React.ReactNode;
  fixedFooterContent?: (rows: T[]) => React.ReactNode;
  stickyFirstColumn?: boolean;
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /** True until the first response resolves; shows a skeleton instead of the empty state. */
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const formatCellValue = (value: unknown): React.ReactNode => {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) {
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

const cellTitle = (value: unknown) =>
  typeof value === "string" || typeof value === "number"
    ? String(formatCellValue(value))
    : undefined;

const getRowKey = <T extends object>(row: T, index: number) => {
  if ("id" in row && row.id != null) return String(row.id);
  if ("number" in row && row.number != null) return String(row.number);
  return String(index);
};

type RowHandlers = {
  onRowClick?: (row: never) => void;
  getRowStatus?: (row: never) => TableRowStatus | undefined;
  getRowSx?: (row: never) => SxProps<Theme> | undefined;
};

/**
 * The table's latest row handlers. Virtuoso needs a stable row component:
 * if it were recreated whenever a page passed a new inline handler, every
 * row would remount, so keyboard focus would be lost after each action.
 */
const RowHandlersContext = React.createContext<RowHandlers>({});

function VirtualRow({
  item,
  ...props
}: {
  item: Record<string, unknown>;
} & React.HTMLAttributes<HTMLTableRowElement>) {
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
        const baseRowSx = tableBodyRowSx({
          alternatingRowSx,
          onRowClick,
        }) as (theme: Theme) => Record<string, unknown>;
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

export function VirtualizedTable<T extends object>({
  columns,
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
}: VirtualizedTableProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [sortField, setSortField] = React.useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc",
  );
  const [searchText, setSearchText] = React.useState("");
  const processedRows = React.useMemo(() => {
    let filtered = rows;
    if (searchText.trim() !== "") {
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

  const rowHandlers = React.useMemo(
    () => ({ onRowClick, getRowStatus, getRowSx }) as RowHandlers,
    [getRowSx, getRowStatus, onRowClick],
  );

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
        <Table {...props} sx={tableViewTableWithMinWidth(tableMinWidth)} />
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
    [tableMinWidth],
  );

  const handleSort = (field?: keyof T) => {
    if (!field) return;

    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const tableTitle = tableHead ? tableHead : "";
  const isFiltered = searchText.trim() !== "" && rows.length > 0;
  const emptyState = isFiltered ? (
    <EmptyTableState
      title="No matching records"
      description={`Nothing in ${tableTitle} matches "${searchText.trim()}". Clear or change the search.`}
    />
  ) : (
    <EmptyTableState title={emptyTitle} description={emptyDescription} />
  );
  const isTableExpanded = !collapsible || expanded;
  const paperSx = tablePanelSx({ height }) as Record<string, unknown>;

  const toggleExpanded = () => {
    if (!collapsible) return;
    onExpandedChange?.(!expanded);
  };

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={column.label}
          variant="head"
          align="left"
          sx={tableHeaderCellForColumnSx({
            column,
            index,
            tableHeaderCellSx,
            stickyFirstColumn,
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

  const rowContent = (rowIndex: number, row: T) => (
    <React.Fragment>
      {columns.map((column, index) => (
        <TableCell
          key={column.label}
          align="left"
          title={
            !column.render && column.label !== "Status" && column.dataKey
              ? cellTitle(row[column.dataKey])
              : undefined
          }
          sx={tableBodyCellForColumnSx({
            column,
            index,
            stickyTableCellSx,
            stickyFirstColumn,
          })}
        >
          {column.render ? (
            column.render(row, rowIndex)
          ) : column.dataKey ? (
            column.label === "Status" ? (
              <Box sx={tableStatusCellSx}>
                <Badge
                  aria-hidden="true"
                  variant="dot"
                  sx={tableStatusDotSx({
                    column,
                    getStatusColor,
                    row,
                  })}
                />

                <Typography
                  component="span"
                  variant="body2"
                  sx={tableStatusTextSx}
                >
                  {formatStatusLabel(row[column.dataKey])}
                </Typography>
              </Box>
            ) : (
              formatCellValue(row[column.dataKey])
            )
          ) : null}
        </TableCell>
      ))}
    </React.Fragment>
  );

  const renderColumnValue = (
    column: ColumnData<T>,
    row: T,
    rowIndex: number,
  ) => {
    if (column.render) return column.render(row, rowIndex);
    if (!column.dataKey) return null;

    if (column.label === "Status") {
      return (
        <Box sx={tableStatusCellSx}>
          <Badge
            aria-hidden="true"
            variant="dot"
            sx={tableStatusDotSx({ column, getStatusColor, row })}
          />
          <Typography component="span" variant="body2" sx={tableStatusTextSx}>
            {formatStatusLabel(row[column.dataKey])}
          </Typography>
        </Box>
      );
    }

    return formatCellValue(row[column.dataKey]);
  };

  const mobileContent = (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        flexDirection: "column",
        gap: 1,
        overflowY: "auto",
        ...insetSx,
      }}
    >
      {processedRows.length ? (
        processedRows.map((row, rowIndex) => (
          <Paper
            key={getRowKey(row, rowIndex)}
            component="article"
            role={onRowClick ? "button" : undefined}
            tabIndex={onRowClick ? 0 : undefined}
            variant="outlined"
            onClick={() => onRowClick?.(row)}
            onKeyDown={(event) => {
              if (onRowClick && (event.key === "Enter" || event.key === " ")) {
                event.preventDefault();
                onRowClick(row);
              }
            }}
            sx={{
              appearance: "none",
              width: "100%",
              ...insetSx,
              textAlign: "left",
              color: "text.primary",
              bgcolor: "background.paper",
              borderLeft: "3px solid",
              borderLeftColor: getRowStatus?.(row)
                ? `${getRowStatus?.(row)}.main`
                : "primary.main",
              cursor: onRowClick ? "pointer" : "default",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(88px, 0.8fr) minmax(0, 1.6fr)",
                columnGap: 1.25,
                rowGap: 1,
                alignItems: "start",
              }}
            >
              {columns.map((column) => (
                <React.Fragment key={column.label}>
                  <Typography
                    component="div"
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      lineHeight: 1.35,
                    }}
                  >
                    {column.label || "Details"}
                  </Typography>
                  <Box
                    sx={{
                      minWidth: 0,
                      overflowWrap: "anywhere",
                      "& .MuiIconButton-root": { width: 44, height: 44 },
                    }}
                  >
                    {renderColumnValue(column, row, rowIndex)}
                  </Box>
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        ))
      ) : (
        <Box
          sx={{
            display: "grid",
            flex: 1,
            minHeight: 220,
            placeItems: "center",
          }}
        >
          {emptyState}
        </Box>
      )}
    </Box>
  );

  const tableContent = (
    <Box sx={tableBodyAreaSx}>
      <RowHandlersContext.Provider value={rowHandlers}>
        <TableVirtuoso
          style={tableVirtuosoStyle}
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
              sx={{ width: 30, height: 30, flexShrink: 0 }}
            >
              {isTableExpanded ? (
                <KeyboardArrowUpIcon />
              ) : (
                <KeyboardArrowDownIcon />
              )}
            </IconButton>
          )}
          <Stack spacing={0.5} sx={tableViewTitleStackSx}>
            <Typography variant="subtitle1" fontWeight={700} sx={tableTitleSx}>
              {tableTitle}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={100}
              sx={tableSubtitleSx}
            >
              {tableHeadSub ? tableHeadSub : ""}
            </Typography>
          </Stack>
        </Box>
        {isTableExpanded && (
          <TextField
            placeholder="Search..."
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
                "aria-label": `Search ${tableTitle}`,
              },
            }}
            sx={tableSearchFieldSx}
          />
        )}
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
