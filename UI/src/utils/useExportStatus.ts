import { useCallback, useState } from "react";
import { showNotification } from "@/api/notificationService";

/**
 * The spreadsheet library is large, so it is fetched only when a user actually
 * exports instead of being bundled into every report page's chunk.
 */
export const loadXlsx = () => import("xlsx");

/**
 * Wraps a workbook export with visible progress and completion feedback. The
 * work is deferred one frame so the "Exporting…" state paints before the
 * library downloads or a large sheet blocks the main thread.
 */
export function useExportStatus() {
  const [exporting, setExporting] = useState(false);

  const runExport = useCallback(
    (build: () => string | void | Promise<string | void>) => {
      setExporting(true);
      window.setTimeout(async () => {
        try {
          const fileName = await build();
          showNotification({
            type: "success",
            message: fileName ? `Export complete: ${fileName}` : "Export complete.",
          });
        } catch {
          showNotification({ type: "error", message: "Export failed. Try again." });
        } finally {
          setExporting(false);
        }
      }, 50);
    },
    [],
  );

  return { exporting, runExport };
}
