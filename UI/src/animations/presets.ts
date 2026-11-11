import type { Transition, Variants } from "motion/react";
import { MOTION_EASE, MOTION_MS } from "@/styles/tokens";

/**
 * One motion vocabulary for the whole app. Components import these presets
 * instead of inventing their own durations, so every entrance, hover and
 * dialog moves with the same easing and rhythm.
 */

/** Material "emphasized decelerate": quick start, long soft landing. */
export const EASE_OUT = MOTION_EASE;
/** Exits accelerate away so they never feel sluggish. */
export const EASE_IN = [0.4, 0, 1, 1] as const;

/** DURATION declaration used across the frontend. */
export const DURATION = {
  hover: MOTION_MS.fast / 1000,
  tap: MOTION_MS.instant / 1000,
  field: MOTION_MS.slow / 1000,
  page: MOTION_MS.base / 1000,
  modal: MOTION_MS.base / 1000,
  flip: (MOTION_MS.slow * 2) / 1000,
  sidebar: MOTION_MS.slow / 1000,
} as const;

/** Gap between siblings in a staggered sequence. */
export const STAGGER = 0.03;

/** Gentle spring for layout moves (active indicators, reordering). */
export const SPRING_SOFT: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 38,
  mass: 0.9,
};

/** Livelier spring for small icons that drop in and settle (empty states). */
export const SPRING_POP: Transition = {
  type: "spring",
  stiffness: 420,
  damping: 18,
};

/** Press feedback for cards and other large surfaces. */
export const tapPress = { scale: 0.98, transition: { duration: DURATION.tap } };

/** Fade with a small rise: the default entrance for page content. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.field, ease: EASE_OUT } },
};

/** fade In declaration used across the frontend. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.page, ease: EASE_OUT } },
};

/** Login fields: slide in from the left of the card. */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: DURATION.field, ease: EASE_OUT } },
};

/** Lower form controls: rise into place from below. */
export const riseFromBottom: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: DURATION.field, ease: EASE_OUT } },
};

/** Parent that only orchestrates timing for its `StaggerItem` children. */
export const staggerContainer = (stagger = STAGGER, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Route change inside the app shell. */
export const pageVariants: Variants = {
  initial: { opacity: 0, y: 4 },
  enter: { opacity: 1, y: 0, transition: { duration: DURATION.page, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_IN } },
};

/**
 * 3D card flip between sign-in forms. The outgoing card turns to edge-on
 * (90deg) before the incoming one turns in from the opposite edge, so the
 * back of a card — mirrored text — is never visible.
 * `custom` is the direction: 1 flips forward, -1 flips back.
 */
export const flipVariants: Variants = {
  initial: (direction: number) => ({ rotateY: direction * -90, opacity: 0.4 }),
  enter: {
    rotateY: 0,
    opacity: 1,
    transition: { duration: DURATION.flip / 2, ease: EASE_OUT },
  },
  exit: (direction: number) => ({
    rotateY: direction * 90,
    opacity: 0.4,
    transition: { duration: DURATION.flip / 2, ease: EASE_IN },
  }),
};

/** Expand/collapse of conditional content (alerts, validation, details). */
export const collapseVariants: Variants = {
  hidden: { opacity: 0, height: 0, y: -4 },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: { duration: 0.24, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -4,
    transition: { duration: 0.18, ease: EASE_IN },
  },
};

/** For non-Motion animation engines (ECharts): honour the OS setting. */
export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Shared ECharts entrance: bars/slices grow in with a short cascade, and
 * data changes morph instead of redrawing. Spread into `setOption`.
 */
export const chartMotion = () =>
  prefersReducedMotion()
    ? { animation: false }
    : {
        animationDuration: 400,
        animationEasing: "cubicOut" as const,
        animationDelay: (index: number) => Math.min(index, 12) * 30,
        animationDurationUpdate: 260,
        animationEasingUpdate: "cubicInOut" as const,
      };
