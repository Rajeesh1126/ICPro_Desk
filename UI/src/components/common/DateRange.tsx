import { Box, type SxProps, type Theme } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import {
  formatDateRange,
  formatFullDateRange,
  formatRangeLength,
  isoDate,
} from "../../utils/dateRange";

type DateInput = Parameters<typeof formatDateRange>[0];

interface DateRangeProps {
  start: DateInput;
  end: DateInput;
  /** Use full DD MMM YYYY dates at both ends of the range. */
  format?: "compact" | "full";
  /** Show the inclusive range length, such as "· 7 days". */
  showLength?: boolean;
  /** Layout-only overrides (margins, alignment). Keep the look itself unchanged. */
  sx?: SxProps<Theme>;
}

/**
 * The one way to display a date range in the app. Every page renders the
 * same thing, whatever surrounds it (page subtitle, table header, filter
 * chip, dialog): a calendar icon, the compact range ("5 – 11 Oct 2026") in
 * semibold, and the muted inclusive length ("· 7 days"). It has a fixed
 * size so it looks identical everywhere, never wraps mid-date, and exposes
 * the range to assistive tech via `<time>`.
 */
export default function DateRange({
  start,
  end,
  format = "compact",
  showLength = true,
  sx,
}: DateRangeProps) {
  const label = format === "full" ? formatFullDateRange(start, end) : formatDateRange(start, end);
  const length = formatRangeLength(start, end);
  const startIso = isoDate(start);
  const endIso = isoDate(end);

  return (
    <Box
      component="span"
      sx={[
        {
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          maxWidth: "100%",
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          fontSize: "0.8125rem",
          lineHeight: 1.4,
          letterSpacing: 0,
          textTransform: "none",
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <CalendarMonthOutlinedIcon
        aria-hidden="true"
        sx={{ fontSize: "1rem", color: "primary.main", flexShrink: 0 }}
      />
      <Box
        component="time"
        dateTime={startIso && endIso ? `${startIso}/${endIso}` : (startIso ?? endIso)}
        sx={{
          color: "text.primary",
          fontWeight: 650,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {label}
      </Box>
      {showLength && length && (
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 500 }}>
          · {length}
        </Box>
      )}
    </Box>
  );
}
