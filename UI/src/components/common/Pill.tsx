import { useEffect, useRef, type ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { useAnimate } from "motion/react";
import { pillSx } from "@/styles/common";

/** Pill Props declaration used across the frontend. */
export interface PillProps {
  /** Text inside the pill. Empty values show "—". */
  value: ReactNode;
  /**
   * Pill colour: a theme palette key ("primary", "success", "warning",
   * "error", "info", "secondary") or any CSS colour ("#0F8A50",
   * `statusColor(row.status)`). The fill is a tint of it.
   */
  color: string;
  /** Leading coloured dot (the status look). Off for priorities and tags. */
  dot?: boolean;
  /** Leading icon, shown instead of the dot. */
  icon?: ReactNode;
  /** Hover text; defaults to the value when it is plain text. */
  title?: string;
  /** Accessible name when the visible text alone is not enough. */
  ariaLabel?: string;
  /** Extra layout styles (margins, max width). The look stays shared. */
  sx?: SxProps<Theme>;
}

/**
 * The app's one pill: a 26px tinted capsule for statuses, priorities and
 * short tags. Callers decide the text and colour (see `pillValues.ts` for
 * the status / priority helpers), so a column or card can show any value.
 */
export default function Pill({
  value,
  color,
  dot = false,
  icon,
  title,
  ariaLabel,
  sx,
}: PillProps) {
  const empty = value === null || value === undefined || value === "";
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const previous = useRef(value);
  // Pulse once when the value changes while on screen. Never on mount:
  // virtualized tables remount pills while scrolling.
  useEffect(() => {
    if (Object.is(previous.current, value) || !scope.current) return;
    previous.current = value;
    void animate(scope.current, { scale: [1, 1.1, 1] }, { duration: 0.4, ease: "easeOut" });
  }, [value, animate, scope]);

  return (
    <Box
      ref={scope}
      component="span"
      title={title ?? (typeof value === "string" ? value : undefined)}
      aria-label={ariaLabel}
      sx={[pillSx(color, dot && !icon), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {icon}
      {empty ? "—" : value}
    </Box>
  );
}
