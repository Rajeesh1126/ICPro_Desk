import { useEffect, useState } from "react";

/**
 * False on the first paint, true one frame later. Feeding a progress value
 * through it (`revealed ? value : 0`) lets the indicator's own CSS
 * transition grow it from zero instead of appearing already filled.
 */
export function useRevealed(active = true) {
  const [revealed, setRevealed] = useState<boolean>(false);
  useEffect(() => {
    if (!active) return;
    const id = requestAnimationFrame(() => setRevealed(true));
    return () => cancelAnimationFrame(id);
  }, [active]);
  return revealed;
}
