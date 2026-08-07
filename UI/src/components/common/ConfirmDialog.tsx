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
import CloseIcon from "@mui/icons-material/Close";
import {
  confirmDialogActionsSx,
  confirmDialogContentSx,
  confirmDialogHeaderSx,
  confirmDialogPaperSx,
  confirmDialogRootSx,
  confirmDialogTitleContentSx,
  confirmDialogTitleIconSx,
  confirmDialogTitleRowSx,
  confirmationDialogTitleSx,
  confirmationMessageSx,
  modalActionButtonSx,
  modalPrimaryActionButtonSx,
} from "../../styles/common";
import type { ConfirmDialogTone } from "../../styles/common";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  titleIcon?: ReactNode;
  titleAdornment?: ReactNode;
  confirmLabel: string;
  confirmColor?: ButtonProps["color"];
  confirmIcon?: ReactNode;
  confirmDisabled?: boolean;
  tone?: ConfirmDialogTone;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  title,
  description,
  children,
  titleIcon,
  titleAdornment,
  confirmLabel,
  confirmColor = "primary",
  confirmIcon,
  confirmDisabled = false,
  tone = "default",
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
      PaperProps={{ sx: confirmDialogPaperSx }}
    >
      <DialogTitle component="div" sx={confirmDialogHeaderSx(tone)}>
        <Box sx={confirmDialogTitleRowSx}>
          <Box sx={confirmDialogTitleContentSx}>
            {titleIcon && (
              <Box sx={confirmDialogTitleIconSx}>{titleIcon}</Box>
            )}
            <Typography component="h2" sx={confirmationDialogTitleSx}>
              {title}
            </Typography>
          </Box>
          {titleAdornment}
        </Box>
      </DialogTitle>
      <DialogContent sx={{ ...confirmDialogContentSx, mt: 2}}>
        {description && (
          <Typography variant="body2" sx={{ ...confirmationMessageSx , mb:1 }}>
            {description}
          </Typography>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={confirmDialogActionsSx}>
        <Button
          onClick={onClose}
          color="inherit"
          startIcon={<CloseIcon />}
          sx={modalActionButtonSx}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={confirmColor}
          startIcon={confirmIcon}
          disabled={confirmDisabled}
          sx={modalPrimaryActionButtonSx}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
