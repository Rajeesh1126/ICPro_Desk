import { insetSx } from "../../styles/tokens";
import { Box, Paper, Skeleton, Stack } from "@mui/material";

/**
 * Shared route-loading state. It mirrors the page header, summary and content
 * shapes without inventing page-specific loading spinners.
 */
export default function PageLoadingSkeleton() {
  return (
    <Box
      aria-label="Loading page"
      aria-busy="true"
      role="status"
      sx={{
        display: "flex",
        flex: 1,
        minHeight: 0,
        flexDirection: "column",
        gap: { xs: 1.25, sm: 2 },
        ...insetSx,
      }}
    >
      <Stack direction="row" justifyContent="space-between" gap={2}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="min(52%, 280px)" height={38} />
          <Skeleton variant="text" width="min(72%, 460px)" height={22} />
        </Box>
        <Skeleton
          variant="rounded"
          width={112}
          height={44}
          sx={{ display: { xs: "none", sm: "block" } }}
        />
      </Stack>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
          gap: 1,
        }}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Paper key={index} variant="outlined" sx={{ ...insetSx }}>
            <Skeleton variant="text" width="58%" />
            <Skeleton variant="text" width="38%" height={34} />
            <Skeleton variant="text" width="72%" />
          </Paper>
        ))}
      </Box>

      <Paper
        variant="outlined"
        sx={{ display: "flex", flex: 1, minHeight: 280, flexDirection: "column", ...insetSx }}
      >
        <Stack direction="row" justifyContent="space-between" gap={2} mb={1.5}>
          <Skeleton variant="text" width="min(46%, 220px)" height={30} />
          <Skeleton variant="rounded" width="min(42%, 260px)" height={40} />
        </Stack>
        <Skeleton variant="rounded" width="100%" height={44} />
        <Stack spacing={1} mt={1}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" width="100%" height={48} />
          ))}
        </Stack>
      </Paper>
      <Box component="span" sx={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Loading page
      </Box>
    </Box>
  );
}
