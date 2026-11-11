import type { ReactNode } from "react";
import { Stack, Typography } from "@mui/material";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import {
  emptyTableIconSx,
  emptyTableStateSx,
} from "@/styles/common";
import { motion } from "motion/react";
import { StaggerContainer, StaggerItem } from "@/animations/MotionPrimitives";
import { SPRING_POP } from "@/animations/presets";

interface EmptyTableStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/** A consistent, accessible empty state for every application data table. */
export default function EmptyTableState({
  title = "No records available",
  description = "Records for the selected view will appear here.",
  icon,
  action,
}: EmptyTableStateProps) {
  return (
    // Icon drops in and settles, then the text follows. Plays once, then
    // holds still.
    <StaggerContainer stagger={0.03}>
    <Stack
      role="status"
      alignItems="center"
      spacing={1}
      sx={emptyTableStateSx}
    >
      <motion.span
        variants={{
          hidden: { opacity: 0, y: -8, scale: 0.9 },
          visible: { opacity: 1, y: 0, scale: 1, transition: SPRING_POP },
        }}
        style={{ display: "inline-flex" }}
      >
        {icon ?? (
          <TableChartOutlinedIcon
            aria-hidden="true"
            sx={emptyTableIconSx}
          />
        )}
      </motion.span>
      <StaggerItem>
        <Typography color="text.primary" fontWeight={600}>
          {title}
        </Typography>
      </StaggerItem>
      <StaggerItem>
        <Typography color="text.secondary" variant="body2">
          {description}
        </Typography>
      </StaggerItem>
      {action && <StaggerItem>{action}</StaggerItem>}
    </Stack>
    </StaggerContainer>
  );
}
