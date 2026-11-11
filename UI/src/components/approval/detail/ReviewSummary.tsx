import type { ReactNode } from "react";
import { Box, Skeleton, Tooltip, Typography } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HourglassEmptyOutlinedIcon from "@mui/icons-material/HourglassEmptyOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HighlightOffOutlinedIcon from "@mui/icons-material/HighlightOffOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import { formatHoursMinutes } from "@/utils/hoursMinutes";
import type { getReviewSummary } from "@/components/approval/detail/approvalData";
import {
  reviewProgressSx,
  reviewProgressTrackSx,
  reviewStatSx,
  reviewStatsSx,
  reviewSummarySx,
  reviewTotalSx,
  type ReviewStatTone,
} from "@/styles/approvalReview";

type Summary = ReturnType<typeof getReviewSummary>;

/**
 * The week in one line: total hours, small stats, and the review progress as
 * a segmented bar. Wraps on phones.
 */
export default function ReviewSummary({
  summary,
  dayCount,
  loading,
}: {
  summary: Summary;
  dayCount: number;
  loading: boolean;
}) {
  if (loading) {
    return <Skeleton variant="rounded" height={36} sx={{ flexShrink: 0 }} />;
  }

  const reviewed = summary.accepted + summary.rejected;
  const stats: { icon: ReactNode; value: string; label: string; tone: ReviewStatTone }[] = [
    { icon: <CalendarMonthOutlinedIcon />, value: `${summary.daysLogged}/${dayCount}`, label: "days logged", tone: "default" },
    { icon: <HourglassEmptyOutlinedIcon />, value: String(summary.awaiting), label: "awaiting", tone: summary.awaiting ? "primary" : "default" },
    { icon: <CheckCircleOutlineOutlinedIcon />, value: String(summary.accepted), label: "accepted", tone: summary.accepted ? "success" : "default" },
    { icon: <HighlightOffOutlinedIcon />, value: String(summary.rejected), label: "rejected", tone: summary.rejected ? "error" : "default" },
    ...(summary.draft
      ? [{ icon: <EditNoteOutlinedIcon />, value: String(summary.draft), label: "in draft", tone: "default" as const }]
      : []),
  ];
  // Segments in review order: accepted, rejected, awaiting, then draft.
  const segments = [
    { key: "accepted", count: summary.accepted, tone: "success" as const },
    { key: "rejected", count: summary.rejected, tone: "error" as const },
    { key: "awaiting", count: summary.awaiting, tone: "primary" as const },
    { key: "draft", count: summary.draft, tone: "default" as const },
  ].filter((segment) => segment.count > 0);

  return (
    <Box component="section" aria-label="Week summary" sx={reviewSummarySx}>
      <Box sx={reviewTotalSx}>
        <Typography component="span">Total hours</Typography>
        <Typography component="strong">{formatHoursMinutes(summary.totalSeconds)} h</Typography>
        <Typography component="span">
          {summary.taskCount} task{summary.taskCount === 1 ? "" : "s"} · {summary.jobCount} job
          {summary.jobCount === 1 ? "" : "s"}
        </Typography>
      </Box>

      <Box sx={reviewStatsSx} role="list">
        {stats.map((stat) => (
          <Box key={stat.label} role="listitem" sx={reviewStatSx(stat.tone)}>
            {stat.icon}
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </Box>
        ))}
      </Box>

      <Box sx={reviewProgressSx}>
        <Typography component="span">
          Review progress <strong>{reviewed} of {summary.taskCount}</strong>
        </Typography>
        <Box
          sx={reviewProgressTrackSx}
          role="img"
          aria-label={`${reviewed} of ${summary.taskCount} tasks reviewed`}
        >
          {segments.map((segment) => (
            <Tooltip key={segment.key} title={`${segment.count} ${segment.key}`}>
              <Box className={`segment ${segment.tone}`} sx={{ flexGrow: segment.count }} />
            </Tooltip>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
