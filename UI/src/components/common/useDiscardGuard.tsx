import { useCallback, useState } from "react";
import DeleteSweepOutlinedIcon from "@mui/icons-material/DeleteSweepOutlined";
import ConfirmDialog from "./ConfirmDialog";

/**
 * Protects a form dialog from losing typed input.
 *
 * - Call `markDirty()` from the form's change handler(s).
 * - Use `requestClose` for every "dismiss" path (backdrop click, Escape, the
 *   header X and Cancel). With unsaved input it asks "Discard changes?";
 *   otherwise it closes straight away.
 * - After a successful save, call your own close function directly; saving
 *   is not discarding.
 * - Render `dialog` anywhere inside the component.
 */
export function useDiscardGuard(open: boolean, close: () => void) {
  const [dirty, setDirty] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Each time the form opens or closes it starts clean.
  if (open !== wasOpen) {
    setWasOpen(open);
    setDirty(false);
    setConfirming(false);
  }

  const markDirty = useCallback(() => setDirty(true), []);

  const requestClose = useCallback(() => {
    if (dirty) setConfirming(true);
    else close();
  }, [close, dirty]);

  const dialog = (
    <ConfirmDialog
      open={confirming}
      title="Discard changes?"
      description="You have unsaved changes in this form. If you close it now, they will be lost."
      titleIcon={<DeleteSweepOutlinedIcon fontSize="small" />}
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      confirmColor="error"
      tone="error"
      onClose={() => setConfirming(false)}
      onConfirm={() => {
        setConfirming(false);
        setDirty(false);
        close();
      }}
    />
  );

  return { dirty, markDirty, requestClose, dialog };
}
