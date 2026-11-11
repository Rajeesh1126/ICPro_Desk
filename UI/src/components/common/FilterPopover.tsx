import { useId, type ReactElement, type ReactNode } from "react";
import {
  Button,
  Chip,
  DialogActions,
  DialogContent,
  Popover,
  Stack,
  Typography,
} from "@mui/material";
import {
  activeFilterBarSx,
  activeFilterLabelSx,
  filterDialogContentSx,
  filterResetButtonSx,
} from "@/styles/common";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import DialogHeader from "@/components/common/DialogHeader";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCollapse } from "@/animations/MotionPrimitives";

const WIDTHS = { xs: 420, sm: 560, md: 720 } as const;

interface FilterPopoverProps {
  open: boolean;
  /** The Filters button the panel drops down from. */
  anchorEl: HTMLElement | null;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  /** Primary action label, e.g. "Show 24 tickets". Defaults to "Apply filters". */
  applyLabel?: string;
  onApply?: () => void;
  onReset?: () => void;
  maxWidth?: keyof typeof WIDTHS;
}

/**
 * One filter pattern for every page: a panel that drops down from the page's
 * Filters button, right-aligned to it. If the button is not on screen (e.g.
 * opened from another control), it drops from the top-right of the page.
 */
export default function FilterPopover({
  open,
  anchorEl,
  onClose,
  title = "Filters",
  children,
  applyLabel = "Apply filters",
  onApply,
  onReset,
  maxWidth = "xs",
}: FilterPopoverProps) {
  const titleId = useId();
  const anchored = Boolean(anchorEl?.isConnected && anchorEl.getClientRects().length);

  return (
    <Popover
      open={open}
      onClose={onClose}
      {...(anchored
        ? {
            anchorEl,
            anchorOrigin: { vertical: "bottom", horizontal: "right" } as const,
          }
        : {
            anchorReference: "anchorPosition" as const,
            anchorPosition: { top: 72, left: window.innerWidth - 16 },
          })}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-labelledby": titleId,
          sx: {
            mt: anchored ? 1 : 0,
            width: WIDTHS[maxWidth],
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "calc(100dvh - 32px)",
            display: "flex",
            flexDirection: "column",
          },
        },
      }}
    >
      <DialogHeader
        id={titleId}
        title={title}
        onClose={onClose}
      />
      <DialogContent sx={filterDialogContentSx}>
        {children}
      </DialogContent>
      <DialogActions>
        {onReset && (
          <Button
            variant="text"
            startIcon={<RestartAltOutlinedIcon />}
            onClick={onReset}
            sx={filterResetButtonSx}
          >
            Reset
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<FilterAltOutlinedIcon />}
          onClick={onApply ?? onClose}
          fullWidth={!onReset}
        >
          {applyLabel}
        </Button>
      </DialogActions>
    </Popover>
  );
}

/** Active Filter declaration used across the frontend. */
export interface ActiveFilter {
  key: string;
  label: ReactNode;
  icon?: ReactElement;
  onRemove?: () => void;
}

/** Keeps applied filters visible after the panel closes. */
export function ActiveFilterChips({
  filters,
  onClearAll,
}: {
  filters: ActiveFilter[];
  onClearAll?: () => void;
}) {
  return (
    // The bar opens when the first filter is applied and folds away when the
    // last is removed; chips pop in/out and the rest slide to close the gap.
    <AnimatedCollapse show={filters.length > 0}>
    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
      aria-label="Applied filters"
      sx={activeFilterBarSx}
    >
      <Typography component="span" sx={activeFilterLabelSx}>
        Showing
      </Typography>
      <AnimatePresence mode="popLayout" initial={false}>
        {filters.map((filter) => (
          <motion.span
            key={filter.key}
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 34 }}
            style={{ display: "inline-flex" }}
          >
            <Chip
              variant="outlined"
              label={filter.label}
              icon={filter.icon}
              onDelete={filter.onRemove}
            />
          </motion.span>
        ))}
        {onClearAll && filters.length > 1 && (
          <motion.span
            key="clear-all"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "inline-flex" }}
          >
            <Button onClick={onClearAll}>
              Clear all
            </Button>
          </motion.span>
        )}
      </AnimatePresence>
    </Stack>
    </AnimatedCollapse>
  );
}
