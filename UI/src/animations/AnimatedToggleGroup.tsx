import { useLayoutEffect, useRef } from "react";
import { Box, ToggleButtonGroup, type ToggleButtonGroupProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { animate, useReducedMotion } from "motion/react";
import { SPRING_SOFT } from "@/animations/presets";
import { ELEVATION, RADIUS } from "@/styles/tokens";

/**
 * Drop-in `ToggleButtonGroup` whose selected segment is a single raised pill
 * that glides to the newly selected button (and across wrapped rows),
 * instead of the highlight jumping. The pill is measured from the DOM, so
 * buttons keep their own sizes and the group keeps its own `sx`.
 */
export default function AnimatedToggleGroup(props: ToggleButtonGroupProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const placed = useRef(false);
  const reduced = Boolean(useReducedMotion());

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const pill = pillRef.current;
    if (!wrap || !pill) return;

    const target = () => {
      const selected = wrap.querySelector<HTMLElement>(".MuiToggleButton-root.Mui-selected");
      if (!selected) return null;
      const from = wrap.getBoundingClientRect();
      const to = selected.getBoundingClientRect();
      // Rects include ancestor transforms (a dialog's zoom-in scales them
      // while it opens), but the pill is laid out unscaled: undo the scale.
      const scaleX = from.width ? wrap.offsetWidth / from.width : 1;
      const scaleY = from.height ? wrap.offsetHeight / from.height : 1;
      return {
        x: (to.left - from.left) * scaleX,
        y: (to.top - from.top) * scaleY,
        width: to.width * scaleX,
        height: to.height * scaleY,
      };
    };
    const place = () => {
      const next = target();
      pill.style.opacity = next ? "1" : "0";
      if (!next) return;
      // Through Motion (instant) so its x/y stay in sync with later springs.
      animate(pill, next, { duration: 0 });
    };

    const next = target();
    if (!placed.current || reduced || !next) {
      // First paint (or reduced motion): put the pill in place, no travel.
      place();
      placed.current = Boolean(next);
    } else {
      pill.style.opacity = "1";
      animate(pill, { x: next.x, y: next.y, width: next.width, height: next.height }, SPRING_SOFT);
    }

    // Labels with counts change width; keep the pill fitted without travel.
    // A ResizeObserver reports once as soon as it starts observing; skip
    // that one, or it would snap the pill and cut the spring short.
    let initialReport = true;
    const observer = new ResizeObserver(() => {
      if (initialReport) {
        initialReport = false;
        return;
      }
      place();
    });
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [props.value, reduced]);

  return (
    <Box
      ref={wrapRef}
      component="span"
      sx={(theme) => ({
        position: "relative",
        // `fullWidth` stretches the group (and so its segments) across the row.
        display: props.fullWidth ? "flex" : "inline-flex",
        width: props.fullWidth ? "100%" : undefined,
        maxWidth: "100%",
        verticalAlign: "middle",
        // Buttons sit above the pill; the pill draws the selection.
        "& .MuiToggleButton-root": { position: "relative", zIndex: 2 },
        // `&&` doubles the class weight so this beats the theme's grouped
        // selected rule and any per-group sx, whatever order they load in.
        "&& .MuiToggleButton-root.Mui-selected, && .MuiToggleButton-root.Mui-selected:hover": {
          backgroundColor: "transparent",
          boxShadow: "none",
          // Accent text on a tonal pill: selection is a pop, not a fill.
          color:
            theme.palette.mode === "dark"
              ? theme.palette.primary.light
              : theme.palette.primary.main,
          "& .MuiChip-root": {
            color: "inherit",
            backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
          },
        },
        "& > .toggle-pill": {
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          pointerEvents: "none",
          opacity: 0,
          // Same radius as a segment; the theme's track inset shows around it.
          borderRadius: `${RADIUS.sm}px`,
          backgroundColor:
            theme.palette.mode === "dark"
              ? alpha(theme.palette.primary.main, 0.2)
              : theme.palette.background.paper,
          // Light mode: a white pill needs an edge to read on light surfaces.
          border:
            theme.palette.mode === "dark"
              ? "none"
              : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          boxSizing: "border-box",
          boxShadow: ELEVATION[theme.palette.mode].segment,
        },
      })}
    >
      <ToggleButtonGroup {...props} />
      <span ref={pillRef} className="toggle-pill" aria-hidden="true" />
    </Box>
  );
}
