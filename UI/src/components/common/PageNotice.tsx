import type { ReactNode } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { pageNoticeSx } from "@/styles/common";

/** Info notice shown under a page's tabs (same inset as the tabs bar). */
export default function PageNotice({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box role="note" sx={[pageNoticeSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      <InfoOutlinedIcon />
      {children}
    </Box>
  );
}
