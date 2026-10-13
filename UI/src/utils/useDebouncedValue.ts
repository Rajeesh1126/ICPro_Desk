import { useEffect, useState } from "react";

/**
 * Returns `value` once it has stopped changing for `delay` ms, so a burst of
 * filter changes (e.g. picking From and To weeks) sends one request, not several.
 */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
