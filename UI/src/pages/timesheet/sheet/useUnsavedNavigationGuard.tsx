import { useCallback, useEffect, useState } from "react";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

/**
 * Protects unsaved timesheet hours from being lost by:
 * - closing/reloading the browser tab (native prompt),
 * - clicking any in-app link (sidebar, header) while hours are unsaved,
 * - in-page navigation such as changing week or tab (`requestNavigation`).
 *
 * Render `dialog` once; it asks "Discard unsaved hours?".
 */
export function useUnsavedNavigationGuard(
  hasUnsavedChanges: boolean,
  onDiscard: () => void,
) {
  const navigate = useNavigate();
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requestNavigation = useCallback(
    (action: () => void) => {
      if (!hasUnsavedChanges) {
        action();
        return;
      }
      setPendingAction(() => action);
    },
    [hasUnsavedChanges],
  );

  useBeforeUnload(
    useCallback(
      (event) => {
        if (!hasUnsavedChanges) return;
        event.preventDefault();
        event.returnValue = "";
      },
      [hasUnsavedChanges],
    ),
  );

  // Intercept same-origin link clicks anywhere on the page (sidebar, header).
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const blockDocumentNavigation = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target || link.hasAttribute("download")) return;

      const destinationUrl = new URL(link.href, window.location.href);
      if (destinationUrl.origin !== window.location.origin) return;

      const destination = `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (destination === current) return;

      event.preventDefault();
      event.stopPropagation();
      requestNavigation(() => navigate(destination));
    };

    document.addEventListener("click", blockDocumentNavigation, true);
    return () => document.removeEventListener("click", blockDocumentNavigation, true);
  }, [hasUnsavedChanges, navigate, requestNavigation]);

  const dialog = (
    <ConfirmDialog
      open={Boolean(pendingAction)}
      title="Discard unsaved hours?"
      description="You have edited time sheet hours that have not been saved as a draft. Leave this page without saving?"
      cancelLabel="Stay on timesheet"
      confirmLabel="Leave without saving"
      confirmColor="warning"
      titleIcon={<WarningAmberOutlinedIcon fontSize="small" />}
      confirmIcon={<WarningAmberOutlinedIcon fontSize="small" />}
      onClose={() => setPendingAction(null)}
      onConfirm={() => {
        const action = pendingAction;
        onDiscard();
        setPendingAction(null);
        action?.();
      }}
    />
  );

  return { requestNavigation, dialog };
}
