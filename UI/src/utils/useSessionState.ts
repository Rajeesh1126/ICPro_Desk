import { useEffect, useState } from "react";

/** Shared view preference for Do List, Tickets and Work Let. */
export const WORK_ITEM_VIEW_SESSION_KEY = "work-items:view";

/** Keeps lightweight page preferences when users navigate away and return. */
export function useSessionState<T extends string | number>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = sessionStorage.getItem(key);
    if (stored === null) return fallback;
    const parsed: unknown = typeof fallback === "number" ? Number(stored) : stored;
    return isValid(parsed) ? parsed : fallback;
  });

  useEffect(() => {
    sessionStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}
