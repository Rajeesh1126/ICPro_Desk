import { Box, IconButton, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { INSET_X, INSET_Y, insetSx, RADIUS_PX } from "@/styles/tokens";
import type { ApprovalRow } from "@/types/dataTypes";
import {
  iconMediumSx,
  noShrinkSx,
} from "@/styles/common";

/** Employee name, overall status and close button. */
export function ApprovalDetailHeader({ employee, onClose }: { employee: ApprovalRow; onClose: () => void }) {
  return (
    <Box
      sx={(theme) => ({
        minHeight: 58,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: INSET_X,
        py: INSET_Y,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Typography
        sx={(theme) => ({
          fontSize: 13,
          fontWeight: 600,
          textWrap: "wrap",
          lineHeight: 1.25,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: theme.palette.text.primary,
        })}
      >
        Project Detailed View of {employee.name}
      </Typography>

      <Typography
        sx={(theme) => ({
          ml: "auto",
          mr: { xs: 0, sm: 1 },
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: "nowrap",
          color: theme.palette.primary.main,
        })}
      >
        {employee.overview === "Accepted" ? "Timesheet is already Accepted" : employee.approval_status}
      </Typography>

      <IconButton
        aria-label="Close dialog"
        onClick={onClose}
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          "&:hover": { backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary },
        })}
      >
        <CloseOutlinedIcon sx={iconMediumSx} />
      </IconButton>
    </Box>
  );
}

/** The employee's submission comments (read-only). */
export function ApprovalComments({ comments }: { comments: string }) {
  if (!comments.trim()) return null;
  return (
    <Box sx={noShrinkSx}>
      <Typography sx={(theme) => ({ fontSize: 12, fontWeight: 500, color: theme.palette.text.secondary, mb: 0.5 })}>
        Comments
      </Typography>
      <Box
        component="textarea"
        value={comments}
        readOnly
        disabled
        aria-label="Submission comments"
        sx={(theme) => ({
          width: "100%",
          minHeight: 65,
          resize: "vertical",
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: RADIUS_PX.md,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          outline: "none",
          ...insetSx,
          fontFamily: "inherit",
          fontSize: 12,
          boxSizing: "border-box",
        })}
      />
    </Box>
  );
}
