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
  TextField,
  Box,
  Badge,
  Typography,
  InputAdornment,
  Stack,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";

// Corrected Imports for verbatimModuleSyntax
import { TableVirtuoso } from "react-virtuoso";
import type { TableComponents } from "react-virtuoso";
import { TableSortLabel } from "@mui/material";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import {
  alternatingRowSx,
  formatStatusLabel,
  getStatusColor,
  stickyTableCellSx,
  tableHeadSx,
  tableHeaderCellSx,
  type TableRowStatus,
  tableViewBoxSx1,
  tableViewBoxSx2,
  tableViewBoxSx3,
  tableViewBoxSx4,
  tableViewBoxSx5,
  tableViewCallbackCallbackSx1,
  tableViewCallbackCallbackSx2,
  tableViewCallbackCallbackSx3,
  tableViewDynamicDynamicBadgeSx1,
  tableViewDynamicDynamicPaperSx1,
  tableViewTableChartIconSx1,
  tableViewTableChartIconSx2,
  tableViewTableContainerSx1,
  tableViewTableWithMinWidth,
  tableViewTableVirtuosoStyle1,
  tableViewTextFieldSx1,
  tableViewTitleGroupSx,
  tableViewTitleStackSx,
  tableViewTypographySx3,
  tableViewTypographySx1,
  tableViewTypographySx2,
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
  tableHeadSub?: string;
  fixedFooterContent?: (rows: T[]) => React.ReactNode;
  stickyFirstColumn?: boolean;
}

const formatDate = (value: unknown) => {
  if (!value || typeof value !== "string") return value;

  // Match YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${day}-${month}-${year}`;
  }

  // Match YYYY-MM-DD HH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const [date, time] = value.split(" ");
    const [year, month, day] = date.split("-");
    return `${day}-${month}-${year}${time ? ` ${time}` : ""}`;
  }

  return value;
};
const formatCellValue = (value: unknown): React.ReactNode => {
  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "object" && item !== null && "name" in item
          ? String(item.name)
          : String(item),
      )
      .join(", ");
  }

  return formatDate(value) as React.ReactNode;
};

export function VirtualizedTable<T extends Record<string, unknown>>({
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
}: VirtualizedTableProps<T>) {
  const [sortField, setSortField] = React.useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    "asc",
  );
  const [searchText, setSearchText] = React.useState("");
  const processedRows = React.useMemo(() => {
    let filtered = rows;
    if (searchText.trim() !== "") {
      const lower = searchText.toLowerCase();

      filtered = rows.filter((row) =>
        columns.some((column) => {
          if (!column.dataKey) return false;

          const value = row[column.dataKey];
          if (value == null) return false;

          return String(value).toLowerCase().includes(lower);
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

  const virtuosoTableComponents: TableComponents<T> = React.useMemo(
    () => ({
      Scroller: React.forwardRef<HTMLDivElement>((props, ref) => (
        <TableContainer
          component={Paper}
          {...props}
          ref={ref}
          sx={tableViewTableContainerSx1}
        />
      )),
      Table: (props) => (
        <Table
          {...props}
          sx={tableViewTableWithMinWidth(tableMinWidth)}
        />
      ),
      TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableHead {...props} ref={ref} sx={tableHeadSx} />
      )),
      TableFoot: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableFooter {...props} ref={ref} />
      )),
      TableRow: ({ item, ...props }) => (
        <TableRow
          {...props}
          hover={!!onRowClick}
          onClick={() => onRowClick?.(item)}
          data-status={getRowStatus?.(item)}
          sx={(theme) => {
            const baseRowSx = tableViewCallbackCallbackSx1({
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
      ),
      TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
        <TableBody {...props} ref={ref} />
      )),
    }),
    [getRowStatus, getRowSx, onRowClick, tableMinWidth],
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

  const fixedHeaderContent = () => (
    <TableRow>
      {columns.map((column, index) => (
        <TableCell
          key={column.label}
          variant="head"
          align={column.numeric ? "right" : "left"}
          sx={tableViewCallbackCallbackSx2({
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
          align={column.numeric ? "right" : "left"}
          sx={tableViewCallbackCallbackSx3({
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
              <Box sx={tableViewBoxSx1}>
                <Badge
                  aria-hidden="true"
                  variant="dot"
                  sx={tableViewDynamicDynamicBadgeSx1({
                    column,
                    getStatusColor,
                    row,
                  })}
                />

                <Typography
                  component="span"
                  variant="body2"
                  sx={tableViewTypographySx1}
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
  return (
    <Paper elevation={0} sx={tableViewDynamicDynamicPaperSx1({ height })}>
      <Box sx={tableViewBoxSx2}>
        <Box sx={tableViewTitleGroupSx}>
          <TableChartOutlinedIcon
            color="action"
            fontSize="small"
            sx={tableViewTableChartIconSx1}
          />

          <Stack spacing={0} sx={tableViewTitleStackSx}>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={tableViewTypographySx2}
            >
              {tableHead ? tableHead : "Data"}
            </Typography>
            <Typography
              variant="subtitle2"
              fontWeight={100}
              sx={tableViewTypographySx3}
            >
              {tableHeadSub ? tableHeadSub : ""}
            </Typography>
          </Stack>
        </Box>
        <TextField
          size="small"
          // label="Search"
          placeholder="Search..."
          variant="outlined"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={tableViewTextFieldSx1}
        />
      </Box>
      <Box sx={tableViewBoxSx3}>
        <TableVirtuoso
          style={tableViewTableVirtuosoStyle1}
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
        {processedRows.length === 0 && (
          <Box sx={tableViewBoxSx4}>
            <Box sx={tableViewBoxSx5}>
              <TableChartOutlinedIcon sx={tableViewTableChartIconSx2} />
              <Typography fontWeight={700}>No records found</Typography>
              <Typography variant="body2">
                Try changing the search or filters.
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
