import type React from "react";
import { insetSx } from "@/styles/tokens";
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
  Tooltip,
  Typography,
  useMediaQuery,
  type GridProps,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EmptyTableState from "@/components/common/EmptyTableState";
import { formatIfDate } from "@/utils/dateRange";
import TableLoadingState from "@/components/common/TableLoadingState";
import type { ColumnData } from "@/components/common/TableView";
import { columnAlign, renderTableCell } from "@/components/common/tableCell";
import MobileRowCard from "@/components/common/MobileRowCard";
import { getColumnSearchText } from "@/components/common/tableSearch";
import {
  detailLabelSx,
  detailValueSx,
  tableHeaderCellSx,
  tableHeadSx,
  tableHeaderBarSx,
  tableBodyAreaSx,
  collapsibleTableScrollSx,
  tablePanelSx,
  tableViewTableWithMinWidth,
  tableSearchFieldSx,
  tableViewTitleGroupSx,
  tableTitleSx,
  tableTitleCountSx,
  tableSearchPlaceholder,
  collapsibleBodyCellSx,
  collapsibleCardListSx,
  collapsibleCardsEmptySx,
  collapsibleDetailFieldSx,
  collapsibleDetailRowCellSx,
  collapsibleEmptyCellSx,
  collapsibleEmptyStateSx,
  collapsibleExpandButtonSx,
  collapsibleExpandCellSx,
  collapsibleHeaderCellSx,
  collapsibleRowSx,
} from "@/styles/common";

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

function formatValue(value: unknown): string {
  if (value == null || value === "") return "—";
  if (Array.isArray(value))
    return value.length ? value.map(formatValue).join(", ") : "—";
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
        sx={collapsibleRowSx(Boolean(onRowClick))}
      >
        <TableCell sx={collapsibleExpandCellSx(expandColumnWidth)}>
          <Tooltip title={open ? "Hide details" : "View details"}>
            <IconButton
              aria-label={open ? "Hide row details" : "View row details"}
              sx={collapsibleExpandButtonSx}
              aria-expanded={open}
              aria-controls={detailsId}
              onClick={(event) => {
                event.stopPropagation();
                setOpen(!open);
              }}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </Tooltip>
        </TableCell>
        {columns.map((column, columnIndex) => (
          <TableCell
            key={column.label}
            align={columnAlign(column)}
            sx={collapsibleBodyCellSx(column, columnIndex)}
          >
            {renderTableCell(column, row, index, formatValue)}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell
          colSpan={columns.length + 1}
          sx={collapsibleDetailRowCellSx(open)}
        >
          <Box id={detailsId}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={insetSx}>
                {details ?? (
                  <Grid container spacing={1.25}>
                    {expandedColumns?.map((column) => (
                      <Grid
                        key={column.label}
                        size={column.size ?? { xs: 12, sm: 6, md: 3 }}
                      >
                        <Box
                          sx={collapsibleDetailFieldSx}
                        >
                          <Typography sx={detailLabelSx}>
                            {column.label}
                          </Typography>
                          <Typography sx={detailValueSx}>
                            {renderTableCell(column, row, index, formatValue)}
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
  const resolvedMobileColumns = mobileColumns ?? [
    ...columns,
    ...(expandedColumns ?? []),
  ];
  const [searchText, setSearchText] = useState("");
  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const searchableColumns = [...columns, ...(expandedColumns ?? [])];
    return query
      ? rows.filter((row, index) =>
          searchableColumns.some((column) =>
            getColumnSearchText(column, row, index)
              .toLowerCase()
              .includes(query),
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
            <Typography variant="subtitle1" fontWeight={600} sx={tableTitleSx}>
              {tableHead}
              {!loading && (
                <Box component="span" sx={tableTitleCountSx}>
                  {rows.length}
                </Box>
              )}
            </Typography>
            {tableHeadSub && (
              <Typography variant="caption" color="text.secondary">
                {tableHeadSub}
              </Typography>
            )}
          </Stack>
        </Box>
        <TextField
          placeholder={tableSearchPlaceholder(tableHead)}
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
          sx={collapsibleCardListSx}
        >
          {filteredRows.length ? (
            filteredRows.map((row, index) => (
              <MobileRowCard
                key={getRowId(row)}
                row={row}
                index={index}
                columns={resolvedMobileColumns}
                renderValue={(column, cardRow, cardIndex) =>
                  renderTableCell(column, cardRow, cardIndex, formatValue)
                }
                onClick={onRowClick}
              />
            ))
          ) : (
            <Box
              sx={collapsibleCardsEmptySx}
            >
              {emptyState}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={tableBodyAreaSx}>
          <TableContainer sx={collapsibleTableScrollSx}>
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
                    sx={[tableHeaderCellSx, collapsibleExpandCellSx(expandColumnWidth)]}
                    aria-label="Expand row"
                  />
                  {columns.map((column, columnIndex) => (
                    <TableCell
                      key={column.label}
                      align={columnAlign(column)}
                      sx={collapsibleHeaderCellSx(column, columnIndex)}
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
                      sx={collapsibleEmptyCellSx}
                    >
                      <Box
                        sx={collapsibleEmptyStateSx}
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
