import { useEffect, useRef, useState, type ComponentProps, type ComponentType, type ElementType, type ReactNode } from "react";
import { Box, Paper } from "@mui/material";
import { animate, AnimatePresence, motion, useAnimate, useReducedMotion, type HTMLMotionProps } from "motion/react";
import {
  collapseVariants,
  DURATION,
  EASE_OUT,
  fadeIn,
  fadeUp,
  riseFromBottom,
  slideFromLeft,
  staggerContainer,
  STAGGER,
} from "@/animations/presets";

/**
 * MUI `Box` with Motion props, so an existing `<Box sx={...}>` can become an
 * animated element one-for-one without an extra wrapper changing the layout.
 */
const BaseMotionBox = motion.create(Box);

/** Motion props plus Box's `component` (e.g. render the container as a form). */
type MotionBoxProps = ComponentProps<typeof BaseMotionBox> & { component?: ElementType };

/** Motion Box declaration used across the frontend. */
export const MotionBox = BaseMotionBox as ComponentType<MotionBoxProps>;

/** MUI `Paper` with Motion props (tables, panels, chart cards). */
export const MotionPaper = motion.create(Paper);

/** Fades its content in once on mount. */
export function FadeIn({ children, ...props }: MotionBoxProps) {
  return (
    <MotionBox variants={fadeIn} initial="hidden" animate="visible" {...props}>
      {children}
    </MotionBox>
  );
}

type SlideDirection = "left" | "up";

/**
 * Orchestrates a staggered entrance. Children opt in by being a
 * `StaggerItem` (or any motion element with `hidden`/`visible` variants).
 */
export function StaggerContainer({
  stagger = STAGGER,
  delay = 0,
  children,
  ...props
}: MotionBoxProps & { stagger?: number; delay?: number }) {
  return (
    <MotionBox
      variants={staggerContainer(stagger, delay)}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </MotionBox>
  );
}

/** One step of a `StaggerContainer` sequence; rises by default. */
export function StaggerItem({
  from,
  children,
  ...props
}: MotionBoxProps & { from?: SlideDirection | "fade" }) {
  const variants =
    from === "left" ? slideFromLeft : from === "fade" ? fadeIn : from === "up" ? riseFromBottom : fadeUp;
  return (
    <MotionBox variants={variants} {...props}>
      {children}
    </MotionBox>
  );
}

/**
 * List entry that animates in when added and out when removed (cards on a
 * board, filtered results). Wrap the list in `<AnimatePresence initial={false}>`
 * so items already present on first render don't animate.
 */
export function PresenceItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16 } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Animates content in and out by height and opacity — validation messages,
 * alerts and conditional fields — without a layout jump.
 */
export function AnimatedCollapse({
  show,
  children,
  ...props
}: { show: boolean; children: ReactNode } & HTMLMotionProps<"div">) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          variants={collapseVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{ overflow: "hidden" }}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Replays a light fade/rise whenever `swapKey` changes (active tab, page of
 * results, view mode) without remounting the children, so table state,
 * search text and scroll positions survive the switch.
 */
export function ContentSwap({
  swapKey,
  appear = false,
  children,
  ...props
}: MotionBoxProps & {
  swapKey: unknown;
  /** Also fade/rise in on mount (e.g. keyed by view so it remounts per view). */
  appear?: boolean;
}) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const previous = useRef(swapKey);
  useEffect(() => {
    if (Object.is(previous.current, swapKey) || !scope.current) return;
    previous.current = swapKey;
    void animate(
      scope.current,
      { opacity: [0, 1], y: [10, 0] },
      { duration: DURATION.page, ease: EASE_OUT },
    );
  }, [swapKey, animate, scope]);
  return (
    <MotionBox
      ref={scope}
      {...(appear && {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: DURATION.page * 0.7, ease: EASE_OUT },
      })}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

/** Content of a tab that mounts when its tab is selected: fades and rises in. */
export function TabContent({ children, ...props }: MotionBoxProps) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DURATION.page, ease: EASE_OUT }}
      {...props}
    >
      {children}
    </MotionBox>
  );
}

/**
 * Swaps one icon for another with a short spin: the old glyph turns and
 * shrinks away while the new one turns in (theme toggles, state icons).
 */
export function IconSwap({ swapKey, children }: { swapKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={swapKey}
        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } }}
        exit={{ rotate: 90, scale: 0.4, opacity: 0, transition: { duration: 0.2 } }}
        style={{ display: "inline-flex" }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}

/**
 * A number that pops (quick scale) whenever its value changes — badge
 * counts, totals. Renders inline so it fits inside badges and text.
 */
export function PopNumber({ value }: { value: ReactNode }) {
  return (
    <motion.span
      key={String(value)}
      initial={{ scale: 0.5, opacity: 0.4 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      style={{ display: "inline-block" }}
    >
      {value}
    </motion.span>
  );
}

/**
 * Like `ContentSwap`, but direction-aware: when `order` grows (next week,
 * next month) the content slides in from the right, when it shrinks it
 * slides in from the left. Children are not remounted. The parent should
 * clip overflow so the brief offset never shows a scrollbar.
 */
export function DirectionalSwap({
  order,
  distance = 28,
  children,
  ...props
}: MotionBoxProps & { order: number; distance?: number }) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const previous = useRef(order);
  useEffect(() => {
    if (previous.current === order || !scope.current) return;
    const direction = order > previous.current ? 1 : -1;
    previous.current = order;
    void animate(
      scope.current,
      { opacity: [0, 1], x: [direction * distance, 0] },
      { duration: DURATION.page, ease: EASE_OUT },
    );
  }, [order, distance, animate, scope]);
  return (
    <MotionBox ref={scope} {...props}>
      {children}
    </MotionBox>
  );
}

/**
 * A changing number that rolls like an odometer: an increase rolls up
 * (new value from below), a decrease rolls down. `children` is the
 * formatted text; `value` decides the direction and the key.
 */
export function RollingValue({ value, children }: { value: number; children: ReactNode }) {
  const [state, setState] = useState<{ value: number; direction: number }>({ value, direction: 0 });
  if (state.value !== value) {
    setState({ value, direction: value > state.value ? 1 : -1 });
  }
  const d = state.direction;
  return (
    <span style={{ display: "inline-grid", overflow: "hidden", verticalAlign: "bottom" }}>
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          initial={{ y: `${d * 100}%`, opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={{ y: `${-d * 100}%`, opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE_OUT }}
          style={{ gridArea: "1 / 1", display: "inline-block" }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

const NUMBER_TOKEN = /\d[\d,]*(?:\.\d+)?/g;

/** Scales every number inside `text` by `progress`, keeping its format. */
function scaleNumbers(text: string, progress: number) {
  return text.replace(NUMBER_TOKEN, (token) => {
    const decimals = token.split(".")[1]?.length ?? 0;
    const value = Number(token.replace(/,/g, "")) * progress;
    return value.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: token.includes(","),
    });
  });
}

/**
 * Counts the numbers in a formatted value ("30,663 hrs", "85.5%") up from
 * zero when it first appears. Screen readers get the final text only.
 */
export function CountUpText({ text, duration = 0.4 }: { text: string; duration?: number }) {
  const reduced = Boolean(useReducedMotion());
  const [progress, setProgress] = useState<number>(() => (reduced ? 1 : 0));
  useEffect(() => {
    if (reduced) return;
    const controls = animate(0, 1, { duration, ease: EASE_OUT, onUpdate: setProgress });
    return () => controls.stop();
  }, [duration, reduced]);
  if (progress >= 1) return <>{text}</>;
  return (
    <>
      <span aria-hidden="true">{scaleNumbers(text, progress)}</span>
      <span style={VISUALLY_HIDDEN}>{text}</span>
    </>
  );
}

const VISUALLY_HIDDEN = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
} as const;

/**
 * One chevron that rotates to show open/closed, instead of swapping between
 * an up and a down icon. `from`/`to` are the closed and open angles.
 */
export function RotatingChevron({
  open,
  children,
  from = 0,
  to = 180,
}: {
  open: boolean;
  children: ReactNode;
  from?: number;
  to?: number;
}) {
  return (
    <motion.span
      initial={false}
      animate={{ rotate: open ? to : from }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
      style={{ display: "inline-flex" }}
    >
      {children}
    </motion.span>
  );
}

/**
 * A list row that opens to its height when added and folds away when
 * removed (attachments, editable rows). Place inside
 * `<AnimatePresence initial={false}>` with a stable `key`.
 */
export function CollapseItem({ children, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      variants={collapseVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{ overflow: "hidden" }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shakes its content once each time `trigger` changes (a rejected file, a
 * failed check). Moves left only, so it can never cause a scrollbar.
 */
export function Shake({ trigger, children }: { trigger: unknown; children: ReactNode }) {
  return (
    <motion.span
      key={String(trigger)}
      initial={{ x: 0 }}
      animate={{ x: [0, -6, 0, -4, 0, -2, 0] }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ display: "block" }}
    >
      {children}
    </motion.span>
  );
}
