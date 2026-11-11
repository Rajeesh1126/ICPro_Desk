import { useMemo } from "react";
import { Box, Paper, Skeleton, Typography } from "@mui/material";
import { statusColor, statusLabel } from "@/components/common/pillValues";
import {
  teamStatusCellSx,
  teamStatusDotSx,
  teamStatusGridSx,
  teamStatusHeadingSx,
  teamStatusLabelRowSx,
  teamStatusLabelSx,
  teamStatusShareFillSx,
  teamStatusShareSx,
  teamStatusStripSx,
  teamStatusSummaryCellSx,
  teamStatusValueSx,
} from "@/styles/common";

const SKELETON_CELLS = 4;

interface WorkStatusOverviewProps {
  /** Work item count keyed by API status, for the whole team. */
  statuses: Record<string, number>;
  loading: boolean;
}

/**
 * Team-wide status strip: the total, then one cell per status with its count
 * and share. Shares use the sum of the shown statuses, so they always add up.
 */
export default function WorkStatusOverview({ statuses, loading }: WorkStatusOverviewProps) {
  const entries = useMemo(
    () =>
      Object.entries(statuses)
        .filter(([, count]) => count > 0)
        .sort(([, a], [, b]) => b - a),
    [statuses],
  );
  const total = entries.reduce((sum, [, count]) => sum + count, 0);

  return (
    <Paper elevation={0} component="section" aria-label="Work status" aria-busy={loading} sx={teamStatusStripSx}>
      <Box component="ul" sx={teamStatusGridSx}>
        <Box component="li" sx={teamStatusSummaryCellSx}>
          <Typography component="h2" sx={teamStatusHeadingSx}>Work status</Typography>
          {loading ? (
            <Skeleton variant="text" width={48} sx={teamStatusValueSx} />
          ) : (
            <Typography sx={teamStatusValueSx}>{total}</Typography>
          )}
          <Typography variant="caption" color="text.secondary">
            team work {total === 1 && !loading ? "item" : "items"}
          </Typography>
        </Box>

        {loading ? (
          Array.from({ length: SKELETON_CELLS }, (_, index) => (
            <Box component="li" key={index} sx={teamStatusCellSx}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width={32} sx={teamStatusValueSx} />
              <Skeleton variant="rounded" height={4} />
            </Box>
          ))
        ) : entries.length ? (
          entries.map(([status, count]) => {
            const color = statusColor(status);
            const share = Math.round((count / total) * 100);
            return (
              <Box component="li" key={status} sx={teamStatusCellSx}>
                <Box sx={teamStatusLabelRowSx}>
                  <Box component="span" aria-hidden="true" sx={teamStatusDotSx(color)} />
                  <Typography noWrap sx={teamStatusLabelSx}>{statusLabel(status)}</Typography>
                  <Typography component="span" variant="caption" color="text.secondary">{share}%</Typography>
                </Box>
                <Typography sx={teamStatusValueSx}>{count}</Typography>
                <Box aria-hidden="true" sx={teamStatusShareSx}>
                  <Box sx={teamStatusShareFillSx(color, share)} />
                </Box>
              </Box>
            );
          })
        ) : (
          <Box component="li" sx={teamStatusCellSx}>
            <Typography variant="body2" color="text.secondary">No work items in this range.</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
