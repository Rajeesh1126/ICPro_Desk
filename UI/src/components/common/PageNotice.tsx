import type { ReactNode } from "react";
import { type SxProps, type Theme } from "@mui/material";
import { MotionBox } from "@/animations/MotionPrimitives";
import { EASE_OUT } from "@/animations/presets";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { pageNoticeSx } from "@/styles/common";

/** Info notice shown under a page's tabs (same inset as the tabs bar). */
export default function PageNotice({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    // Notices ease in instead of popping into the layout.
    <MotionBox
      role="note"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      sx={[pageNoticeSx, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      <InfoOutlinedIcon />
      {children}
    </MotionBox>
  );
}
