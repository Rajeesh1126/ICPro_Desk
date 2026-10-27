import type { ReactNode } from "react";
import { Box, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import {
  dialogSubtitleSx,
  dialogTitleActionsSx,
  dialogTitleContentSx,
  dialogTitleRowSx,
  dialogTitleTextSx,
  requiredFieldsNoteSx,
  requiredMarkSx,
} from "@/styles/dialog";
import {
  minWidthZero,
} from "@/styles/common";

interface DialogHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  onClose?: () => void;
  /** Disable closing while a save is in flight. */
  closeDisabled?: boolean;
  /** Extra controls rendered before the close button (e.g. status chip). */
  actions?: ReactNode;
  id?: string;
}

/**
 * Shared dialog header: title, optional subtitle, and a consistently placed
 * close button. Titles never carry a leading icon. Use with `aria-labelledby={id}` on the Dialog.
 */
export default function DialogHeader({
  title,
  subtitle,
  onClose,
  closeDisabled,
  actions,
  id,
}: DialogHeaderProps) {
  return (
    <DialogTitle component="div" id={id}>
      <Stack direction="row" sx={dialogTitleRowSx}>
        <Stack direction="row" sx={dialogTitleContentSx}>
          <Box sx={minWidthZero}>
            <Typography variant="h6" component="h2" sx={dialogTitleTextSx}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={dialogSubtitleSx}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" sx={dialogTitleActionsSx}>
          {actions}
          {onClose && (
            <IconButton aria-label="Close dialog" onClick={onClose} disabled={closeDisabled}>
              <CloseOutlinedIcon />
            </IconButton>
          )}
        </Stack>
      </Stack>
    </DialogTitle>
  );
}

/** Footer note for forms that mark required fields with an asterisk. */
export function RequiredFieldsNote() {
  return (
    <Typography variant="caption" color="text.secondary" sx={requiredFieldsNoteSx}>
      Fields marked with <Box component="span" sx={requiredMarkSx}>*</Box> are required.
    </Typography>
  );
}
