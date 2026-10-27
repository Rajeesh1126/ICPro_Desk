import { Box, Skeleton, Stack } from "@mui/material";
import {
  visuallyHiddenSx,
  tableLoadingCardSx,
} from "@/styles/common";

interface TableLoadingStateProps {
  /** Number of placeholder rows. */
  rows?: number;
  /** Card-shaped placeholders for the small-screen card layout. */
  variant?: "table" | "cards";
  label?: string;
}

/**
 * First-load placeholder for data tables. Shown until the first response
 * resolves so an in-flight request is never mistaken for "No records".
 */
export default function TableLoadingState({
  rows = 6,
  variant = "table",
  label = "Loading records",
}: TableLoadingStateProps) {
  return (
    <Box role="status" aria-busy="true" aria-label={label} sx={{ p: variant === "cards" ? 1 : 1.5 }}>
      {variant === "table" ? (
        <Stack spacing={1}>
          <Skeleton variant="rounded" width="100%" height={40} />
          {Array.from({ length: rows }, (_, index) => (
            <Skeleton key={index} variant="rounded" width="100%" height={44} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={1}>
          {Array.from({ length: Math.min(rows, 4) }, (_, index) => (
            <Box
              key={index}
              sx={tableLoadingCardSx}
            >
              <Skeleton variant="text" width="45%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="65%" />
            </Box>
          ))}
        </Stack>
      )}
      <Box component="span" sx={visuallyHiddenSx}>
        {label}
      </Box>
    </Box>
  );
}

