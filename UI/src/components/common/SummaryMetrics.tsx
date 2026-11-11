import { Skeleton, Tooltip, Typography } from "@mui/material";
import { CountUpText, MotionBox } from "@/animations/MotionPrimitives";
import { fadeUp, staggerContainer } from "@/animations/presets";
import {
  summaryMetricCellSx,
  summaryMetricHelperSx,
  summaryMetricLabelSx,
  summaryMetricSkeletonHelperSx,
  summaryMetricSkeletonValueSx,
  summaryMetricValueSx,
  summaryMetricsStripSx,
} from "@/styles/common";

/** Summary Metric declaration used across the frontend. */
export type SummaryMetric = {
  label: string;
  value: string;
  helper: string;
  /** Colours the value by meaning, e.g. "error" for overdue / over budget. */
  tone?: "error" | "success";
  /** Optional explanation shown on hover of the helper line. */
  helperTooltip?: string;
  onClick?: () => void;
};

/**
 * The KPI strip used at the top of summary pages (Home, Executive Overview):
 * one rounded surface split into equal segments by hairline dividers.
 */
export default function SummaryMetrics({
  metrics,
  loading = false,
}: {
  metrics: SummaryMetric[];
  loading?: boolean;
}) {
  return (
    // Inherits "hidden"/"visible" from the page's StaggerContainer and
    // staggers its own cells; outside one it renders statically.
    <MotionBox variants={staggerContainer(0.06)} sx={summaryMetricsStripSx(metrics.length)}>
      {metrics.map((metric) => {
        const helper = (
          <Typography
            component="span"
            sx={summaryMetricHelperSx(Boolean(metric.helperTooltip))}
          >
            {metric.helper}
          </Typography>
        );
        return (
          <MotionBox
            key={metric.label}
            variants={fadeUp}
            onClick={metric.onClick}
            onKeyDown={
              metric.onClick
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      metric.onClick?.();
                    }
                  }
                : undefined
            }
            role={metric.onClick ? "button" : undefined}
            tabIndex={metric.onClick ? 0 : undefined}
            aria-label={
              metric.onClick
                ? `${metric.label}: ${metric.value}. ${metric.helper}`
                : undefined
            }
            aria-busy={loading}
            sx={summaryMetricCellSx(Boolean(metric.onClick))}
          >
            <Typography sx={summaryMetricLabelSx(loading ? undefined : metric.tone)}>
              {metric.label}
            </Typography>
            {loading ? (
              <>
                <Skeleton variant="text" sx={summaryMetricSkeletonValueSx} />
                <Skeleton variant="text" sx={summaryMetricSkeletonHelperSx} />
              </>
            ) : (
              <>
                <Typography sx={summaryMetricValueSx(metric.tone)}>
                  {/* Counts up once when the loaded value first appears. */}
                  <CountUpText text={metric.value} />
                </Typography>
                {metric.helperTooltip ? (
                  <Tooltip title={metric.helperTooltip}>{helper}</Tooltip>
                ) : (
                  helper
                )}
              </>
            )}
          </MotionBox>
        );
      })}
    </MotionBox>
  );
}
