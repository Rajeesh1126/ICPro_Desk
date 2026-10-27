import { useId, useState } from "react";
import { Box, ButtonBase, Collapse, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { SvgIconComponent } from "@mui/icons-material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import {
  minWidthZero,
  noShrinkSx,
  statusLegendChevronSx,
  statusLegendCountSx,
  statusLegendDefinitionSx,
  statusLegendHintSx,
  statusLegendIconSx,
  statusLegendInfoIconSx,
  statusLegendItemSx,
  statusLegendLabelSx,
  statusLegendListSx,
  statusLegendMeaningIconSx,
  statusLegendMeaningsSx,
  statusLegendSx,
  statusLegendTermSx,
  statusLegendTitleSx,
  statusLegendToggleSx,
} from "@/styles/common";

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
  activeKey,
  onSelectStatus,
}: {
  items: StatusLegendItem[];
  /** One-line usage tip, e.g. "Select an icon to see who acted." */
  hint?: string;
  activeKey?: string | null;
  onSelectStatus?: (key: string) => void;
}) {
  const resolve = usePaletteColor();
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
      sx={statusLegendSx}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={{ xs: 0.75, md: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={noShrinkSx}>
          <InfoOutlinedIcon sx={statusLegendInfoIconSx} aria-hidden="true" />
          <Typography
            variant="caption"
            sx={statusLegendTitleSx}
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
          sx={statusLegendListSx}
        >
          {items.map(({ key, icon: Icon, color, label, description, count }) => {
            const tone = resolve(color);
            return (
              <Box component="li" key={key}>
                <Tooltip title={description} arrow>
                  <ButtonBase
                    component="button"
                    type="button"
                    onClick={() => onSelectStatus?.(key)}
                    aria-pressed={activeKey === key}
                    aria-label={`${label}${count !== undefined ? `, ${count}` : ""}: ${description}`}
                    sx={statusLegendItemSx({
                      tone,
                      active: activeKey === key,
                      selectable: Boolean(onSelectStatus),
                    })}
                  >
                    <Icon aria-hidden="true" sx={statusLegendIconSx(tone)} />
                    <Typography component="span" variant="caption" sx={statusLegendLabelSx}>
                      {label}
                    </Typography>
                    {count !== undefined && (
                      <Box
                        component="span"
                        aria-hidden="true"
                        sx={statusLegendCountSx(tone)}
                      >
                        {count}
                      </Box>
                    )}
                  </ButtonBase>
                </Tooltip>
              </Box>
            );
          })}
        </Stack>

        <ButtonBase
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          sx={statusLegendToggleSx}
        >
          {expanded ? "Hide meanings" : "What do these mean?"}
          <ExpandMoreOutlinedIcon
            aria-hidden="true"
            sx={statusLegendChevronSx(expanded)}
          />
        </ButtonBase>
      </Stack>

      <Collapse in={expanded} id={panelId} unmountOnExit>
        <Box
          component="dl"
          sx={statusLegendMeaningsSx}
        >
          {items.map(({ key, icon: Icon, color, label, description }) => (
            <Stack key={key} direction="row" spacing={1} alignItems="flex-start">
              <Icon aria-hidden="true" sx={statusLegendMeaningIconSx(resolve(color))} />
              <Box sx={minWidthZero}>
                <Typography component="dt" variant="caption" sx={statusLegendTermSx}>
                  {label}
                </Typography>
                <Typography component="dd" variant="caption" sx={statusLegendDefinitionSx}>
                  {description}
                </Typography>
              </Box>
            </Stack>
          ))}
          {hint && (
            <Typography variant="caption" color="text.secondary" sx={statusLegendHintSx}>
              {hint}
            </Typography>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
