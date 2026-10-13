import { useEffect } from "react";

const APP_NAME = "ICProDesk";

/**
 * Sets the browser-tab title to "Page · ICProDesk" so tabs, history and
 * bookmarks say where they lead. Pass nothing for just the app name.
 */
export function useDocumentTitle(page?: string | null) {
  useEffect(() => {
    document.title = page ? `${page} · ${APP_NAME}` : APP_NAME;
  }, [page]);
}
