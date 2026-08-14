import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Box,
    Badge,
    Typography,
    InputAdornment,
} from "@mui/material";

// Corrected Imports for verbatimModuleSyntax
import { TableVirtuoso } from "react-virtuoso";
import type { TableComponents } from "react-virtuoso";
import { TableSortLabel } from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { alternatingRowSx, formatStatusLabel, getStatusColor, stickyTableCellSx, tableHeadSx, tableHeaderCellSx, tableViewBoxSx1, tableViewBoxSx2, tableViewBoxSx3, tableViewBoxSx4, tableViewBoxSx5, tableViewCallbackCallbackSx1, tableViewCallbackCallbackSx2, tableViewCallbackCallbackSx3, tableViewDynamicDynamicBadgeSx1, tableViewDynamicDynamicPaperSx1, tableViewTableChartIconSx1, tableViewTableChartIconSx2, tableViewTableContainerSx1, tableViewTableSx1, tableViewTableVirtuosoStyle1, tableViewTextFieldSx1, tableViewTypographySx1, tableViewTypographySx2 } from "../../styles/common";

export interface ColumnData<T> {
    label: string;
    width?: number | "auto";
    numeric?: boolean;
    dataKey?: keyof T;
    render?: (row: T, index: number) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
    columns: ColumnData<T>[];
    rows: T[];
    height?: string;
    onRowClick?: (row: T) => void;
    tableHead?: string;
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
                    : String(item)
            )
            .join(", ");
    }

    return formatDate(value) as React.ReactNode;
};

export function VirtualizedTable<T extends Record<string, unknown>>({
    columns,
    rows,
    height,
    onRowClick,
    tableHead
}: VirtualizedTableProps<T>) {
    const [sortField, setSortField] = React.useState<keyof T | null>(null);
    const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");
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
                })
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

    const VirtuosoTableComponents: TableComponents<T> = React.useMemo(() => ({
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
                sx={tableViewTableSx1}
            />
        ),
        TableHead: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableHead {...props} ref={ref} sx={tableHeadSx} />
        )),
        TableRow: ({ item, ...props }) => (
            <TableRow
                {...props}
                hover={!!onRowClick}
                onClick={() => onRowClick?.(item)}
                sx={tableViewCallbackCallbackSx1({ alternatingRowSx, onRowClick })}
            />
        ),
        TableBody: React.forwardRef<HTMLTableSectionElement>((props, ref) => (
            <TableBody {...props} ref={ref} />
        )),
    }), [onRowClick]);

    const handleSort = (field?: keyof T) => {
        if (!field) return;

        if (sortField === field) {
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
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
                    sx={tableViewCallbackCallbackSx2({ column, columns, index, tableHeaderCellSx })}
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
                        columns,
                        index,
                        stickyTableCellSx
                    })}
                >
                    {
                        column.render
                            ? column.render(row, rowIndex)
                            : column.dataKey
                                ? column.label === "Status"
                                    ? (
                                        <Box sx={tableViewBoxSx1}>
                                            <Badge
                                                aria-hidden="true"
                                                variant="dot"
                                                sx={tableViewDynamicDynamicBadgeSx1({
                                                    column,
                                                    getStatusColor,
                                                    row
                                                })}
                                            />

                                            <Typography
                                                component="span"
                                                variant="body2"
                                                sx={tableViewTypographySx1}
                                            >
                                                {formatStatusLabel(
                                                    row[column.dataKey]
                                                )}
                                            </Typography>
                                        </Box>
                                    )
                                    : formatCellValue(row[column.dataKey])
                                : null
                    }
                </TableCell>
            ))}
        </React.Fragment>
    );
    return (
        <Paper
            elevation={0}
            sx={tableViewDynamicDynamicPaperSx1({ height })}
        >
            <Box
                sx={tableViewBoxSx2}
            >
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={tableViewTypographySx2}
                >
                    <TableChartIcon color="action" fontSize="small" sx={tableViewTableChartIconSx1} /> {tableHead ? tableHead : "Tickets"}
                </Typography>
                <TextField
                    size="small"
                    // label="Search"
                    placeholder="Search..."
                    variant="outlined"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" color="action" /></InputAdornment> } }}
                    sx={tableViewTextFieldSx1}
                />
            </Box>
            <Box sx={tableViewBoxSx3}>
                <TableVirtuoso
                    style={tableViewTableVirtuosoStyle1}
                    data={processedRows}
                    components={VirtuosoTableComponents}
                    fixedHeaderContent={fixedHeaderContent}
                    itemContent={rowContent}
                />
                {processedRows.length === 0 && (
                    <Box sx={tableViewBoxSx4}>
                        <Box sx={tableViewBoxSx5}>
                            <TableChartIcon sx={tableViewTableChartIconSx2} />
                            <Typography fontWeight={700}>No records found</Typography>
                            <Typography variant="body2">Try changing the search or filters.</Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}
