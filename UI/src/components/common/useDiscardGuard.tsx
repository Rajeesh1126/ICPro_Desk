import { useCallback, useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

/**
 * Protects a form dialog from losing typed input.
 *
 * - Call `markDirty()` from the form's change handler(s).
 * - Use `requestClose` for every "dismiss" path (backdrop click, Escape, the
 *   header X and Cancel). With unsaved input it asks "Discard changes?";
 *   otherwise it closes straight away.
 * - After a successful save, call your own close function directly; saving
 *   is not discarding.
 * - Pass `dirtyOverride` when the caller can compare the current values with
 *   their opening snapshot. This lets reverted edits become clean again.
 * - Render `dialog` anywhere inside the component.
 */
export function useDiscardGuard(
  open: boolean,
  close: () => void,
  dirtyOverride?: boolean,
) {
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
  const hasUnsavedChanges = dirtyOverride ?? dirty;

  const requestClose = useCallback(() => {
    if (hasUnsavedChanges) setConfirming(true);
    else close();
  }, [close, hasUnsavedChanges]);

  const dialog = (
    <ConfirmDialog
      open={confirming}
      title="Discard changes?"
      description="You have unsaved changes in this form. If you close it now, they will be lost."
      cancelLabel="Keep editing"
      confirmLabel="Discard"
      confirmColor="error"
      onClose={() => setConfirming(false)}
      onConfirm={() => {
        setConfirming(false);
        setDirty(false);
        close();
      }}
    />
  );

  return { dirty: hasUnsavedChanges, markDirty, requestClose, dialog };
}
