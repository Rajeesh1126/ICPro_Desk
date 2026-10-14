import type React from "react";
import { INSET_X, INSET_Y, insetSx } from "../../styles/tokens";
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
  useMediaQuery,
  type GridProps,
  type SxProps,
} from "@mui/material";
import { useTheme, type Theme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmptyTableState from "./EmptyTableState";
import { formatIfDate } from "../../utils/dateRange";
import TableLoadingState from "./TableLoadingState";
import type { ColumnData } from "./TableView";
import { getColumnSearchText } from "./tableSearch";
import {
  detailLabelSx,
  detailValueSx,
  formatStatusLabel,
  stickyTableCellSx,
  tableHeaderCellSx,
  tableHeadSx,
  tableHeaderBarSx,
  tableBodyAreaSx,
  tableHeaderCellForColumnSx,
  tableBodyCellForColumnSx,
  tablePanelSx,
  tableViewTableWithMinWidth,
  tableSearchFieldSx,
  tableViewTitleGroupSx,
} from "../../styles/common";

export type ExpandedColumnData<T> = ColumnData<T> & {
  size?: GridProps["size"];
};

export interface CollapsibleTableViewProps<T> {
  columns: ColumnData<T>[];
  expandedColumns?: ExpandedColumnData<T>[];
  /** Ordered fields for card layouts. Defaults to visible columns followed by details. */
  mobileColumns?: ColumnData<T>[];
  rows: T[];
  tableHead?: string;
  tableHeadSub?: React.ReactNode;
  height?: string;
  tableMinWidth?: number | string;
  expandColumnWidth?: number;
  getRowId: (row: T) => Key;
  renderRowDetails?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  /** True until the first response resolves; shows a skeleton instead of the empty state. */
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
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
      tableBodyCellForColumnSx({
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
      tableHeaderCellForColumnSx({
        column,
        index,
        tableHeaderCellSx,
        stickyFirstColumn: false,
      }) as (theme: Theme) => Record<string, unknown>
    )(theme),
    ...alignedTableCellSx,
  });

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value)) return value.length ? value.map(formatValue).join(", ") : "—";
  if (typeof value === "object") {
    return "name" in value ? String(value.name) : JSON.stringify(value);
  }
  if (typeof value === "string") return String(formatIfDate(value));
  return String(value);
}

function CollapsibleRow<T extends object>({
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
        tabIndex={onRowClick ? 0 : undefined}
        onKeyDown={
          onRowClick
            ? (event: React.KeyboardEvent) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onRowClick(row);
            }
          }
            : undefined
        }
        sx={{ cursor: onRowClick ? "pointer" : "default" }}
      >
        <TableCell sx={expandCellSx(expandColumnWidth)}>
          <IconButton
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
              <Box sx={{ ...insetSx }}>
                {details ?? (
                  <Grid container spacing={1.25}>
                    {expandedColumns?.map((column) => (
                      <Grid
                        key={column.label}
                        size={column.size ?? { xs: 12, sm: 6, md: 3 }}
                      >
                        <Box
                          sx={(theme) => ({
                            px: INSET_X,
                            py: INSET_Y,
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
export function CollapsibleTableView<T extends object>({
  columns,
  expandedColumns,
  mobileColumns,
  rows,
  tableHead = "Data",
  tableHeadSub,
  height = "100%",
  tableMinWidth,
  expandColumnWidth = defaultExpandColumnWidth,
  getRowId,
  renderRowDetails,
  onRowClick,
  loading = false,
  emptyTitle,
  emptyDescription,
}: CollapsibleTableViewProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const resolvedMobileColumns = mobileColumns ?? [...columns, ...(expandedColumns ?? [])];
  const [searchText, setSearchText] = useState("");
  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const searchableColumns = [...columns, ...(expandedColumns ?? [])];
    return query
      ? rows.filter((row, index) =>
          searchableColumns.some((column) =>
            getColumnSearchText(column, row, index).toLowerCase().includes(query),
          ),
        )
      : rows;
  }, [columns, expandedColumns, rows, searchText]);

  const isFiltered = searchText.trim() !== "" && rows.length > 0;
  const emptyState = isFiltered ? (
    <EmptyTableState
      title="No matching records"
      description={`Nothing in ${tableHead} matches "${searchText.trim()}". Clear or change the search.`}
    />
  ) : (
    <EmptyTableState title={emptyTitle} description={emptyDescription} />
  );

  const resolvedTableMinWidth =
    tableMinWidth ??
    columns.reduce(
      (total, column) =>
        total +
        (typeof column.width === "number" ? column.width : defaultColumnWidth),
      expandColumnWidth,
    );

  return (
    <Paper elevation={0} sx={tablePanelSx({ height })}>
      <Box sx={tableHeaderBarSx}>
        <Box sx={tableViewTitleGroupSx}>
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
          placeholder="Search..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          sx={tableSearchFieldSx}
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
      {loading ? (
        <TableLoadingState
          variant={isMobile ? "cards" : "table"}
          label={`Loading ${tableHead}`}
        />
      ) : isMobile ? (
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
          {filteredRows.length ? (
            filteredRows.map((row, index) => (
              <Paper
                key={getRowId(row)}
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
                sx={{ ...insetSx, borderLeft: "3px solid", borderLeftColor: "primary.main" }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "minmax(90px, 0.8fr) minmax(0, 1.6fr)",
                    gap: 1,
                    alignItems: "start",
                  }}
                >
                  {resolvedMobileColumns.map((column) => (
                    <Fragment key={column.label}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700}>
                        {column.label}
                      </Typography>
                      <Box sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                        {column.render
                          ? column.render(row, index)
                          : column.dataKey
                            ? column.label === "Status"
                              ? formatStatusLabel(row[column.dataKey])
                              : formatValue(row[column.dataKey])
                            : null}
                      </Box>
                    </Fragment>
                  ))}
                </Box>
              </Paper>
            ))
          ) : (
            <Box sx={{ display: "grid", flex: 1, minHeight: 220, placeItems: "center", textAlign: "center" }}>
              {emptyState}
            </Box>
          )}
        </Box>
      ) : (
      <Box sx={tableBodyAreaSx}>
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
                    sx={{ p: 0, height: 220 }}
                >
                    <Box
                      sx={{
                        minHeight: 220,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                      }}
                    >
                      {emptyState}
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      )}
    </Paper>
  );
}

export default CollapsibleTableView;
