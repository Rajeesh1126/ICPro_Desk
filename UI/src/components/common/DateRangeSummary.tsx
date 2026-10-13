import { Box, Typography } from "@mui/material";
import DateRange from "./DateRange";
import { filterSummaryPanel } from "../../styles/filters";

interface DateRangeSummaryProps {
  start: string;
  end: string;
  label?: string;
}

/** A consistent, compact summary above date-range controls. */
export default function DateRangeSummary({
  start,
  end,
  label = "Date range",
}: DateRangeSummaryProps) {
  return (
    <Box sx={filterSummaryPanel}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {label}
        </Typography>
        <DateRange start={start} end={end} />
      </Box>
    </Box>
  );
}
