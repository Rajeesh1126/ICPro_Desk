import type { ReactNode } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import type { ButtonProps } from "@mui/material/Button";
import {
  confirmDialogActionsSx,
  confirmDialogRootSx,
  confirmationMessageSx,
} from "@/styles/common";
import {
  dialogActionsRowSx,
  dialogTitleContentSx,
  dialogTitleRowSx,
} from "@/styles/dialog";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  titleAdornment?: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  confirmColor?: ButtonProps["color"];
  confirmIcon?: ReactNode;
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  titleAdornment,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmColor = "primary",
  confirmIcon,
  confirmDisabled = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      sx={confirmDialogRootSx}
    >
      <DialogTitle component="div">
        <Box sx={dialogTitleRowSx}>
          <Box sx={dialogTitleContentSx}>
            <Typography variant="h6" component="h2">
              {title}
            </Typography>
          </Box>
          {titleAdornment}
        </Box>
      </DialogTitle>
      <DialogContent>
        {description && (
          <Typography variant="body2" sx={confirmationMessageSx}>
            {description}
          </Typography>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={[dialogActionsRowSx, confirmDialogActionsSx]}>
        <Button startIcon={<CloseOutlinedIcon />}
          onClick={onClose}
          variant="outlined"
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          startIcon={confirmIcon}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
