import { useState, type ReactNode } from "react";
import { Box, Button, Collapse, Paper, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { columnFormat, type CellFormat } from "@/components/common/tableCell";
import {
  mobileRowCardFieldPairSx,
  mobileRowCardFieldsSx,
  mobileRowCardFooterSx,
  mobileRowCardHeaderSx,
  mobileRowCardLabelSx,
  mobileRowCardMoreSx,
  mobileRowCardSx,
  mobileRowCardValueSx,
} from "@/styles/common";

type CardColumn<T> = {
  label: string;
  dataKey?: keyof T;
  format?: CellFormat;
  render?: (row: T, index: number) => ReactNode;
  mobileOrder?: number;
};

/** Fields shown before "Show more"; the rest stay one tap away. */
const VISIBLE_FIELDS = 3;

/**
 * One table row as a phone card: the key value (first real column) and the
 * status pill as the header, a few fields, the rest behind "Show more", and
 * the row actions in the footer.
 */
export default function MobileRowCard<T>({
  row,
  index,
  columns,
  renderValue,
  accent = "primary.main",
  onClick,
}: {
  row: T;
  index: number;
  columns: CardColumn<T>[];
  renderValue: (column: CardColumn<T>, row: T, index: number) => ReactNode;
  accent?: string;
  onClick?: (row: T) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const content = columns;
  const actions = content.find((column) => column.label === "Actions");
  const status = content.find((column) => columnFormat(column) === "status");
  const [primary, ...rest] = content.filter(
    (column) => column !== actions && column !== status,
  );
  // Pages can name their summary fields (e.g. due date and priority first);
  // otherwise the first few columns are the summary.
  const ordered = rest
    .filter((column) => column.mobileOrder !== undefined)
    .sort((a, b) => (a.mobileOrder ?? 0) - (b.mobileOrder ?? 0));
  const visible = ordered.length ? ordered : rest.slice(0, VISIBLE_FIELDS);
  const hidden = ordered.length
    ? rest.filter((column) => column.mobileOrder === undefined)
    : rest.slice(VISIBLE_FIELDS);

  const fields = (list: CardColumn<T>[]) => (
    <Box sx={mobileRowCardFieldsSx}>
      {list.map((column) => (
        <Box key={column.label} sx={mobileRowCardFieldPairSx}>
          <Typography component="div" sx={mobileRowCardLabelSx}>
            {column.label || "Details"}
          </Typography>
          <Box sx={mobileRowCardValueSx}>{renderValue(column, row, index)}</Box>
        </Box>
      ))}
    </Box>
  );

  return (
    <Paper
      component="article"
      variant="outlined"
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(row)}
      onKeyDown={(event) => {
        if (onClick && event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick(row);
        }
      }}
      sx={mobileRowCardSx({ accent, clickable: Boolean(onClick) })}
    >
      {(primary || status) && (
        <Box sx={mobileRowCardHeaderSx}>
          <Box>{primary ? renderValue(primary, row, index) : null}</Box>
          {status && renderValue(status, row, index)}
        </Box>
      )}

      {visible.length > 0 && fields(visible)}

      {hidden.length > 0 && (
        <Collapse in={expanded} unmountOnExit>
          {fields(hidden)}
        </Collapse>
      )}

      {(hidden.length > 0 || actions) && (
        <Box sx={mobileRowCardFooterSx}>
          {hidden.length > 0 ? (
            <Button
              aria-expanded={expanded}
              endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((open) => !open);
              }}
              sx={mobileRowCardMoreSx}
            >
              {expanded ? "Show less" : `Show ${hidden.length} more`}
            </Button>
          ) : (
            <span />
          )}
          {actions && (
            <Box onClick={(event) => event.stopPropagation()}>
              {renderValue(actions, row, index)}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
