import { useState, type ReactElement, type ReactNode } from "react";
import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { flipVariants, pageVariants } from "@/animations/presets";

/**
 * Holds on to the outlet element it first rendered. During an exit
 * animation the leaving page keeps showing its own route instead of
 * switching to the next one mid-fade.
 */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState<ReactElement | null>(outlet);
  return frozen;
}

/** Fade-and-rise wrapper for one page. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, minHeight: 0 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Route-aware `<Outlet />`: the old page fades out, then the new one rises
 * in. Keyed by pathname only, so query-string changes (filters, tabs) never
 * remount or re-animate a page. `onExitComplete` lets the shell reset its
 * scroll position between pages instead of jumping mid-animation.
 */
export function AnimatedOutlet({
  onExitComplete,
  frame = (page) => page,
}: {
  onExitComplete?: () => void;
  /** Wraps each page inside its transition (e.g. a per-page error boundary). */
  frame?: (page: ReactNode) => ReactNode;
}) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false} onExitComplete={onExitComplete}>
      <PageTransition key={pathname}>{frame(<FrozenOutlet />)}</PageTransition>
    </AnimatePresence>
  );
}

/**
 * 3D card flip between routes (Login ↔ Forgot password ↔ Reset password).
 * `order` ranks the routes so going "deeper" flips forward and going back
 * flips the other way. Only the active card is ever mounted, so keyboard
 * focus and screen readers never reach the hidden form.
 */
export function FlipOutlet({ order }: { order: readonly string[] }) {
  const { pathname } = useLocation();
  const [history, setHistory] = useState<{ current: string; direction: number }>({ current: pathname, direction: 1 });

  // Derive the flip direction while rendering (no effect, no extra paint).
  if (history.current !== pathname) {
    const from = order.indexOf(history.current);
    const to = order.indexOf(pathname);
    setHistory({ current: pathname, direction: to >= from ? 1 : -1 });
  }

  return (
    <div style={{ perspective: 1400, width: "100%", display: "grid", placeItems: "center" }}>
      <AnimatePresence mode="wait" initial={false} custom={history.direction}>
        <motion.div
          key={pathname}
          custom={history.direction}
          variants={flipVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          style={{
            width: "100%",
            display: "grid",
            placeItems: "center",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
          }}
        >
          <FrozenOutlet />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
