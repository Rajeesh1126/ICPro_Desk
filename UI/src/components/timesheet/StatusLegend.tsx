import { useId, useState } from "react";
import { Box, ButtonBase, Collapse, Stack, Tooltip, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { INSET_X, INSET_Y } from "../../styles/tokens";

export type StatusLegendItem = {
  key: string;
  icon: SvgIconComponent;
  /** Theme palette path, e.g. "success.main". */
  color: string;
  label: string;
  /** Plain-language meaning, shown in the tooltip and the expanded key. */
  description: string;
  /** How many cells in the current view have this status. */
  count?: number;
};

const STORAGE_KEY = "timesheetLogs.statusKeyExpanded";

const readExpanded = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

/** Resolve "success.main" style paths against the palette for tinting. */
function usePaletteColor() {
  const theme = useTheme();
  return (path: string) => {
    const value = path
      .split(".")
      .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], theme.palette);
    return typeof value === "string" ? value : theme.palette.text.secondary;
  };
}

/**
 * Status key for icon-only tables. Each status is a tinted pill (icon +
 * label + live count) so it reads without relying on colour alone; the
 * plain-language meaning is one click away and the choice is remembered.
 */
export default function StatusLegend({
  items,
  hint,
}: {
  items: StatusLegendItem[];
  /** One-line usage tip, e.g. "Select an icon to see who acted." */
  hint?: string;
}) {
  const resolve = usePaletteColor();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [expanded, setExpanded] = useState(readExpanded);
  const panelId = useId();

  const toggle = () => {
    setExpanded((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Preference is optional; ignore storage failures.
      }
      return next;
    });
  };

  return (
    <Box
      component="section"
      aria-label="Status key"
      sx={{
        px: INSET_X,
        py: INSET_Y,
        mb: 1,
        border: 1,
        borderColor: "divider",
        borderRadius: 1.5,
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={{ xs: 0.75, md: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} aria-hidden="true" />
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: "text.secondary" }}
          >
            Status key
          </Typography>
        </Stack>

        <Stack
          component="ul"
          direction="row"
          useFlexGap
          flexWrap="wrap"
          spacing={0.75}
          sx={{ listStyle: "none", m: 0, p: 0, flex: 1, minWidth: 0 }}
        >
          {items.map(({ key, icon: Icon, color, label, description, count }) => {
            const tone = resolve(color);
            return (
              <Box component="li" key={key}>
                <Tooltip title={description} arrow>
                  <Box
                    tabIndex={0}
                    aria-label={`${label}${count !== undefined ? `, ${count}` : ""}: ${description}`}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 0.6,
                      height: 30,
                      pl: 0.75,
                      pr: count !== undefined ? 0.5 : 1,
                      borderRadius: 999,
                      border: 1,
                      borderColor: alpha(tone, isDark ? 0.4 : 0.32),
                      bgcolor: alpha(tone, isDark ? 0.14 : 0.08),
                      cursor: "help",
                      outline: "none",
                      "&:focus-visible": { boxShadow: `0 0 0 2px ${alpha(tone, 0.6)}` },
                    }}
                  >
                    <Icon aria-hidden="true" sx={{ fontSize: 18, color: tone }} />
                    <Typography component="span" variant="caption" sx={{ fontWeight: 700, color: "text.primary", whiteSpace: "nowrap" }}>
                      {label}
                    </Typography>
                    {count !== undefined && (
                      <Box
                        component="span"
                        aria-hidden="true"
                        sx={{
                          minWidth: 22,
                          height: 20,
                          px: 0.6,
                          display: "inline-grid",
                          placeItems: "center",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          color: "text.primary",
                          bgcolor: alpha(tone, isDark ? 0.24 : 0.16),
                        }}
                      >
                        {count}
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              </Box>
            );
          })}
        </Stack>

        <ButtonBase
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          sx={{
            flexShrink: 0,
            alignSelf: { xs: "flex-start", md: "center" },
            gap: 0.25,
            px: 0.75,
            py: 0.5,
            borderRadius: 1,
            color: "primary.main",
            fontSize: 12,
            fontWeight: 700,
            "&:hover": { bgcolor: "action.hover" },
            "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main" },
          }}
        >
          {expanded ? "Hide meanings" : "What do these mean?"}
          <ExpandMoreOutlinedIcon
            aria-hidden="true"
            sx={{ fontSize: 18, transition: "transform 160ms", transform: expanded ? "rotate(180deg)" : "none" }}
          />
        </ButtonBase>
      </Stack>

      <Collapse in={expanded} id={panelId} unmountOnExit>
        <Box
          component="dl"
          sx={{
            m: 0,
            mt: 1,
            pt: 1,
            borderTop: 1,
            borderColor: "divider",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(3, minmax(0, 1fr))" },
            columnGap: 2,
            rowGap: 1,
          }}
        >
          {items.map(({ key, icon: Icon, color, label, description }) => (
            <Stack key={key} direction="row" spacing={1} alignItems="flex-start">
              <Icon aria-hidden="true" sx={{ fontSize: 18, mt: 0.1, color: resolve(color), flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography component="dt" variant="caption" sx={{ display: "block", fontWeight: 700, color: "text.primary" }}>
                  {label}
                </Typography>
                <Typography component="dd" variant="caption" sx={{ display: "block", m: 0, color: "text.secondary", lineHeight: 1.45 }}>
                  {description}
                </Typography>
              </Box>
            </Stack>
          ))}
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={{ gridColumn: "1 / -1", fontStyle: "italic" }}>
              {hint}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
