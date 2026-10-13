import type { ReactNode } from "react";
import { Box, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

interface DialogHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  /** Disable closing while a save is in flight. */
  closeDisabled?: boolean;
  /** Extra controls rendered before the close button (e.g. status chip). */
  actions?: ReactNode;
  id?: string;
}

/**
 * Shared dialog header: title, optional subtitle/icon, and a consistently
 * placed close button. Use with `aria-labelledby={id}` on the Dialog.
 */
export default function DialogHeader({
  title,
  subtitle,
  icon,
  onClose,
  closeDisabled,
  actions,
  id,
}: DialogHeaderProps) {
  return (
    <DialogTitle component="div" id={id}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1.5}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          {icon && (
            <Box aria-hidden="true" sx={{ display: "flex", color: "primary.main" }}>
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2" sx={{ overflowWrap: "anywhere" }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexShrink: 0 }}>
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
    <Typography variant="caption" color="text.secondary" sx={{ mr: "auto", pl: 1 }}>
      Fields marked with <Box component="span" sx={{ fontWeight: 700 }}>*</Box> are required.
    </Typography>
  );
}
