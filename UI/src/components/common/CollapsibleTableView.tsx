import {
  Fragment,
  useId,
  useMemo,
  useState,
  type Key,
  type ReactNode,
} from "react";
import {
  Box,
  Collapse,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  type GridProps,
  type SxProps,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import type { ColumnData } from "./TableView";
import {
  detailLabelSx,
  detailValueSx,
  formatStatusLabel,
  stickyTableCellSx,
  tableHeaderCellSx,
  tableHeadSx,
  tableViewBoxSx2,
  tableViewBoxSx3,
  tableViewCallbackCallbackSx2,
  tableViewCallbackCallbackSx3,
  tableViewDynamicDynamicPaperSx1,
  tableViewTableWithMinWidth,
  tableViewTextFieldSx1,
  tableViewTitleGroupSx,
} from "../../styles/common";

export type ExpandedColumnData<T> = ColumnData<T> & {
  size?: GridProps["size"];
};

export interface CollapsibleTableViewProps<T> {
  columns: ColumnData<T>[];
  expandedColumns?: ExpandedColumnData<T>[];
  rows: T[];
  tableHead?: string;
  tableHeadSub?: string;
  height?: string;
  tableMinWidth?: number | string;
  expandColumnWidth?: number;
  getRowId: (row: T) => Key;
  renderRowDetails?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
}

const defaultExpandColumnWidth = 28;
const defaultColumnWidth = 140;

const expandCellSx = (width: number | undefined) => ({
  width,
  minWidth: width,
  maxWidth: width,
  px: 0,
  textAlign: "center" as const,
});

const alignedTableCellSx = {
  px: 1,
  textAlign: "left" as const,
};

const bodyCellSx =
  <T,>(column: ColumnData<T>, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableViewCallbackCallbackSx3({
        column,
        index,
        stickyTableCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    ...alignedTableCellSx,
  });

const headerCellSx =
  <T,>(column: ColumnData<T>, index: number): SxProps<Theme> =>
  (theme) => ({
    ...(
      tableViewCallbackCallbackSx2({
        column,
        index,
        tableHeaderCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    ...alignedTableCellSx,
  });

function formatValue(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(formatValue).join(", ");
  if (typeof value === "object") {
    return "name" in value ? String(value.name) : JSON.stringify(value);
  }
  if (typeof value === "string") {
    return value.replace(/^(\d{4})-(\d{2})-(\d{2})(?=$|[ T])/, "$3-$2-$1");
  }
  return String(value);
}

function CollapsibleRow<T extends Record<string, unknown>>({
  row,
  index,
  columns,
  expandedColumns,
  expandColumnWidth,
  renderRowDetails,
  onRowClick,
}: Pick<
  CollapsibleTableViewProps<T>,
  | "columns"
  | "expandedColumns"
  | "expandColumnWidth"
  | "renderRowDetails"
  | "onRowClick"
> & {
  row: T;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const details = renderRowDetails?.(row);

  return (
    <Fragment>
      <TableRow
        hover={!!onRowClick}
        onClick={() => onRowClick?.(row)}
        sx={{ cursor: onRowClick ? "pointer" : "default" }}
      >
        <TableCell sx={expandCellSx(expandColumnWidth)}>
          <IconButton
            size="small"
            aria-label={open ? "Collapse row" : "Expand row"}
            sx={{ width: 28, height: 28 }}
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={(event) => {
              event.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.label}
            align="left"
            sx={bodyCellSx(column, columnIndex)}
          >
            {column.render
              ? column.render(row, index)
              : column.dataKey
                ? column.label === "Status"
                  ? formatStatusLabel(row[column.dataKey])
                  : formatValue(row[column.dataKey])
                : null}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={columns.length + 1}
          sx={{ py: 0, borderBottom: open ? undefined : 0 }}
        >
          <Box id={detailsId}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ p: 2 }}>
                {details ?? (
                  <Grid container spacing={1.25}>
                    {expandedColumns?.map((column) => (
                      <Grid
                        key={column.label}
                        size={column.size ?? { xs: 12, sm: 6, md: 3 }}
                      >
                        <Box
                          sx={(theme) => ({
                            px: 1.25,
                            py: 0.5,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 1,
                            bgcolor: theme.palette.background.paper,
                            minWidth: 0,
                            height: "100%",
                          })}
                        >
                          <Typography sx={detailLabelSx}>
                            {column.label}
                          </Typography>
                          <Typography sx={detailValueSx}>
                            {column.render
                              ? column.render(row, index)
                              : column.dataKey
                                ? column.label === "Status"
                                  ? formatStatusLabel(row[column.dataKey])
                                  : formatValue(row[column.dataKey])
                                : null}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Collapse>
          </Box>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

/** Reuses TableView columns; callers supply stable row IDs and expanded content. */
export function CollapsibleTableView<T extends Record<string, unknown>>({
  columns,
  expandedColumns,
  rows,
  tableHead = "Data",
  tableHeadSub,
  height = "100%",
  tableMinWidth,
  expandColumnWidth = defaultExpandColumnWidth,
  getRowId,
  renderRowDetails,
  onRowClick,
}: CollapsibleTableViewProps<T>) {
  const [searchText, setSearchText] = useState("");
  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const searchableColumns = [...columns, ...(expandedColumns ?? [])];
    return query
      ? rows.filter((row) =>
          searchableColumns.some((column) => {
            if (!column.dataKey) return false;
            const value = row[column.dataKey];
            return `${formatValue(value)} ${String(value ?? "")}`
              .toLowerCase()
              .includes(query);
          }),
        )
      : rows;
  }, [columns, expandedColumns, rows, searchText]);

  const resolvedTableMinWidth =
    tableMinWidth ??
    columns.reduce(
      (total, column) =>
        total +
        (typeof column.width === "number" ? column.width : defaultColumnWidth),
      expandColumnWidth,
    );

  return (
    <Paper elevation={0} sx={tableViewDynamicDynamicPaperSx1({ height })}>
      <Box sx={tableViewBoxSx2}>
        <Box sx={tableViewTitleGroupSx}>
          <TableChartOutlinedIcon color="action" fontSize="small" />
          <Stack spacing={0.5}>
            <Typography variant="subtitle1" fontWeight={700}>
              {tableHead}
            </Typography>
            {tableHeadSub && (
              <Typography variant="caption" color="text.secondary">
                {tableHeadSub}
              </Typography>
            )}
          </Stack>
        </Box>
        <TextField
          size="small"
          placeholder="Search..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          sx={tableViewTextFieldSx1}
          slotProps={{
            htmlInput: { "aria-label": `Search ${tableHead}` },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlinedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box sx={tableViewBoxSx3}>
        <TableContainer
          sx={{
            overflow: "auto",
            minHeight: 0,
            height: "100%",
            width: "100%",
            scrollbarGutter: "stable",
          }}
        >
          <Table
            stickyHeader
            size="small"
            aria-label={tableHead}
            sx={tableViewTableWithMinWidth(resolvedTableMinWidth)}
          >
            <colgroup>
              <col
                style={{
                  width: expandColumnWidth,
                  minWidth: expandColumnWidth,
                  maxWidth: expandColumnWidth,
                }}
              />
              {columns.map((column) => (
                <col
                  key={column.label}
                  style={
                    typeof column.width === "number"
                      ? { width: column.width }
                      : undefined
                  }
                />
              ))}
            </colgroup>
            <TableHead sx={tableHeadSx}>
              <TableRow>
                <TableCell
                  sx={[tableHeaderCellSx, expandCellSx(expandColumnWidth)]}
                  aria-label="Expand row"
                />
                {columns.map((column, columnIndex) => (
                  <TableCell
                    key={column.label}
                    align="left"
                    sx={headerCellSx(column, columnIndex)}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row, index) => (
                <CollapsibleRow
                  key={getRowId(row)}
                  row={row}
                  index={index}
                  columns={columns}
                  expandedColumns={expandedColumns}
                  expandColumnWidth={expandColumnWidth}
                  renderRowDetails={renderRowDetails}
                  onRowClick={onRowClick}
                />
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography fontWeight={700}>No records found</Typography>
                    <Typography variant="body2">
                      Try changing the search or filters.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Paper>
  );
}

export default CollapsibleTableView;
