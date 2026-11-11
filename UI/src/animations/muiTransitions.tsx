import {
  cloneElement,
  forwardRef,
  useLayoutEffect,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";
import {
  animate,
  stagger,
  motion,
  useReducedMotion,
  type AnimationPlaybackControls,
  type HTMLMotionProps,
  type MotionStyle,
} from "motion/react";
import type { TransitionProps } from "@mui/material/transitions";
import { useForkRef } from "@mui/material/utils";
import { styled } from "@mui/material/styles";
import { DURATION, EASE_IN, EASE_OUT, SPRING_SOFT } from "@/animations/presets";

type MotionTransitionProps = TransitionProps & {
  children: ReactElement<{ ref?: Ref<HTMLElement> }>;
};

const TRANSITION_ONLY_PROPS = [
  "appear",
  "timeout",
  "addEndListener",
  "easing",
  "mountOnEnter",
  "unmountOnExit",
  "direction",
  "enter",
  "exit",
  "nodeRef",
] as const;

type Phase =(node: HTMLElement, reduced: boolean) => AnimationPlaybackControls[];

/**
 * Builds a MUI transition component (the `slots.transition` contract that
 * Dialog, Snackbar and friends expect) driven by Motion instead of
 * react-transition-group. It reports the same lifecycle callbacks, so
 * MUI's focus trap, scroll lock and unmount-after-exit keep working.
 */
function createMotionTransition(name: string, enter: Phase, exit: Phase) {
  const Transition = forwardRef<HTMLElement, MotionTransitionProps>(
    function MotionTransition(props, forwardedRef) {
      const {
        in: open,
        children,
        onEnter,
        onEntering,
        onEntered,
        onExit,
        onExiting,
        onExited,
        ...rest
      } = props;
      // Props meant for react-transition-group never reach the DOM.
      const other: Record<string, unknown> = { ...rest };
      for (const key of TRANSITION_ONLY_PROPS) delete other[key];
      const nodeRef = useRef<HTMLElement>(null);
      const mounted = useRef(false);
      const handleRef = useForkRef(nodeRef, children.props.ref, forwardedRef);
      const reduced = Boolean(useReducedMotion());
      const callbacks = useRef({ onEnter, onEntering, onEntered, onExit, onExiting, onExited });
      useLayoutEffect(() => {
        callbacks.current = { onEnter, onEntering, onEntered, onExit, onExiting, onExited };
      });

      // Layout effect: the first frame is set before paint, so the element
      // never flashes at full opacity before its entrance starts.
      useLayoutEffect(() => {
        const node = nodeRef.current;
        if (!node) return;
        const cb = callbacks.current;
        const firstRun = !mounted.current;
        mounted.current = true;
        if (firstRun && !open) {
          // Mounted closed (keepMounted): start hidden, nothing to animate.
          node.style.opacity = "0";
          node.style.visibility = "hidden";
          return;
        }
        let cancelled = false;
        if (open) {
          node.style.visibility = "";
          cb.onEnter?.(node, true);
          cb.onEntering?.(node, true);
          const controls = enter(node, reduced);
          void Promise.all(controls).then(() => {
            if (!cancelled) callbacks.current.onEntered?.(node, true);
          });
          return () => {
            cancelled = true;
            controls.forEach((c) => c.stop());
          };
        }
        cb.onExit?.(node);
        cb.onExiting?.(node);
        const controls = exit(node, reduced);
        void Promise.all(controls).then(() => {
          if (cancelled) return;
          // Kept-mounted modals (e.g. the mobile drawer) stay hidden.
          node.style.visibility = "hidden";
          callbacks.current.onExited?.(node);
        });
        return () => {
          cancelled = true;
          controls.forEach((c) => c.stop());
        };
      }, [open, reduced]);

      return cloneElement(children, { ...other, ref: handleRef });
    },
  );
  Transition.displayName = name;
  return Transition;
}

const fadeOnly = (node: HTMLElement, to: number) => [
  animate(node, { opacity: to }, { duration: 0.12 }),
];

/** Paper expansion: quick, settles with no visible bounce (~0.35s). */
const DIALOG_SPRING = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const;
const DIALOG_SECTIONS = ".MuiDialogTitle-root, .MuiDialogContent-root, .MuiDialogActions-root";

/**
 * Dialog entrance, picked by the dialog's shape:
 * - Centered dialogs expand from the middle of the screen, then their
 *   title, body and actions follow in a short cascade.
 * - Full-screen dialogs (phones) slide in from the left edge like a page.
 * Exit reverses the motion, faster, so closing never feels sluggish.
 */
export const MotionDialogTransition = createMotionTransition(
  "MotionDialogTransition",
  (node, reduced) => {
    node.style.opacity = "0";
    if (reduced) return fadeOnly(node, 1);
    const paper = node.querySelector<HTMLElement>(".MuiDialog-paper");
    const fade = animate(node, { opacity: [0, 1] }, { duration: 0.2, ease: EASE_OUT });
    if (!paper) return [fade];
    if (paper.classList.contains("MuiDialog-paperFullScreen")) {
      return [
        fade,
        animate(paper, { x: ["-32%", "0%"] }, { duration: DURATION.page, ease: EASE_OUT }),
      ];
    }
    const sections = paper.querySelectorAll<HTMLElement>(DIALOG_SECTIONS);
    return [
      fade,
      animate(paper, { scale: [0.82, 1] }, DIALOG_SPRING),
      ...(sections.length
        ? [
            animate(
              sections,
              // Scale up from slightly smaller, never translate: a downward
              // offset would overflow the paper and flash its scrollbar.
              { opacity: [0, 1], scale: [0.98, 1] },
              { duration: 0.28, ease: EASE_OUT, delay: stagger(0.05, { startDelay: 0.08 }) },
            ),
          ]
        : []),
    ];
  },
  (node, reduced) => {
    if (reduced) return fadeOnly(node, 0);
    const paper = node.querySelector<HTMLElement>(".MuiDialog-paper");
    const fade = animate(node, { opacity: 0 }, { duration: 0.18, ease: EASE_IN });
    if (!paper) return [fade];
    return [
      fade,
      paper.classList.contains("MuiDialog-paperFullScreen")
        ? animate(paper, { x: "-24%" }, { duration: 0.18, ease: EASE_IN })
        : animate(paper, { scale: 0.9 }, { duration: 0.18, ease: EASE_IN }),
    ];
  },
);

/** Toasts rise in with a small scale and drop away on exit. */
export const MotionToastTransition = createMotionTransition(
  "MotionToastTransition",
  (node, reduced) => {
    node.style.opacity = "0";
    if (reduced) return fadeOnly(node, 1);
    return [
      animate(
        node,
        { opacity: [0, 1], y: [16, 0], scale: [0.96, 1] },
        { type: "spring", stiffness: 520, damping: 34 },
      ),
    ];
  },
  (node, reduced) => {
    if (reduced) return fadeOnly(node, 0);
    return [animate(node, { opacity: 0, y: 10, scale: 0.97 }, { duration: 0.16, ease: EASE_IN })];
  },
);

/**
 * Points the menu paper's transform origin at the centre of the button that
 * opened it. The trigger is found through ARIA: the Menu's `id` is on the
 * popover root and the trigger references it with `aria-controls`.
 * Falls back to the origin MUI's Popover already set from its props.
 */
function originAtTrigger(paper: HTMLElement) {
  const menuId = paper.closest<HTMLElement>(".MuiPopover-root")?.id;
  const trigger = menuId
    ? document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(menuId)}"]`)
    : null;
  if (!trigger) return;
  const from = trigger.getBoundingClientRect();
  // Layout offsets, not getBoundingClientRect: the paper may already be
  // mid-scale, and its rect would include that transform. The popover root
  // is a full-viewport fixed layer, so offsets are viewport coordinates.
  paper.style.transformOrigin = `${from.left + from.width / 2 - paper.offsetLeft}px ${
    from.top + from.height / 2 - paper.offsetTop
  }px`;
}

const MENU_ITEMS = ".MuiMenu-list > *";

/**
 * Menu or popover that grows out of the button that opened it and shrinks
 * back into it on close. It is the theme default for every Popover (and so
 * every Menu and Select dropdown). When the trigger sets `aria-controls` to
 * the menu's `id` it grows from the trigger's centre; otherwise from the
 * edge MUI anchored it to.
 */
export const MotionAnchoredMenuTransition = createMotionTransition(
  "MotionAnchoredMenuTransition",
  (node, reduced) => {
    node.style.opacity = "0";
    if (reduced) return fadeOnly(node, 1);
    originAtTrigger(node);
    // Popover re-applies its own origin in an effect right after this one;
    // a microtask lands after that and still before the first paint.
    queueMicrotask(() => originAtTrigger(node));
    // Only the first few items cascade; long dropdowns appear at once below.
    const items = Array.from(node.querySelectorAll<HTMLElement>(MENU_ITEMS)).slice(0, 10);
    return [
      animate(node, { opacity: [0, 1] }, { duration: 0.16, ease: EASE_OUT }),
      animate(node, { scale: [0.5, 1] }, { type: "spring", stiffness: 460, damping: 34, mass: 0.7 }),
      // Opacity only: moving items would overflow the scrollable list.
      ...(items.length
        ? [
            animate(
              items,
              { opacity: [0, 1] },
              { duration: 0.2, ease: EASE_OUT, delay: stagger(0.035, { startDelay: 0.06 }) },
            ),
          ]
        : []),
    ];
  },
  (node, reduced) => {
    if (reduced) return fadeOnly(node, 0);
    originAtTrigger(node);
    return [
      animate(node, { opacity: 0, scale: 0.6 }, { duration: 0.15, ease: EASE_IN }),
    ];
  },
);

type IndicatorProps = HTMLAttributes<HTMLSpanElement> & { ownerState?: unknown };

/**
 * A motion span registered as MUI's Tabs "Indicator" slot, so the theme's
 * `MuiTabs.styleOverrides.indicator` (shape, colour, shadow) still applies.
 */
const IndicatorRoot = styled(motion.span, { name: "MuiTabs", slot: "Indicator" })({
  position: "absolute",
  height: 2,
  bottom: 0,
});

/**
 * Tabs indicator (the raised segment behind the selected tab) driven by a
 * spring: it travels from the previous tab to the newly selected one and
 * resizes to its width on the way. MUI still measures the tabs and passes
 * `left`/`width` in `style`; Motion animates to them.
 */
export const MotionTabIndicator = forwardRef<HTMLSpanElement, IndicatorProps>(
  function MotionTabIndicator({ style, ...props }, ref) {
    const reduced = Boolean(useReducedMotion());
    const { left, width, ...rest } = style ?? {};
    return (
      <IndicatorRoot
        ref={ref}
        {...(props as Omit<HTMLMotionProps<"span">, "style">)}
        style={{ ...(rest as MotionStyle), left: 0 }}
        initial={false}
        animate={{ x: Number(left) || 0, width: Number(width) || 0 }}
        transition={reduced ? { duration: 0 } : SPRING_SOFT}
      />
    );
  },
);
