import {
  type ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Stack,
  type SxProps,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha, type Theme } from "@mui/material/styles";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import api from "../api/axios";
import { showNotification } from "../api/notificationService";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import { appPageSx } from "../styles/common";

type CostCategory = {
  id: number;
  name: string | null;
};

type PhaseMapping = {
  id: number;
  phase: string;
  cost_category: number | null;
  cost_category_name?: string | null;
};

type CostCategoryRow = Record<string, unknown> & {
  id: number;
  name: string;
  selected: boolean;
  mappedPhases: string;
};

const phaseOptions = ["Sales", "Execution", "Service"];

const phaseMeta: Record<string, { icon: ReactElement }> = {
  Sales: { icon: <SellOutlinedIcon fontSize="small" /> },
  Execution: { icon: <EngineeringOutlinedIcon fontSize="small" /> },
  Service: { icon: <HandymanOutlinedIcon fontSize="small" /> },
};

const phasePageSx: SxProps<Theme> = {
  ...appPageSx,
  bgcolor: "background.default",
  color: "text.primary",
};

const phaseContentSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100%",
  px: { xs: 1.5, sm: 2.5, md: 3 },
  py: { xs: 1.5, sm: 2 },
  gap: { xs: 1.75, md: 2 },
  overflow: "visible",
};

const stepLabelSx = {
  color: "primary.main",
  display: "block",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 0,
  lineHeight: 1.3,
  textTransform: "uppercase",
} satisfies SxProps<Theme>;

const phaseHelperSx = {
  color: "text.secondary",
  fontSize: 12,
  lineHeight: 1.45,
} satisfies SxProps<Theme>;

const phaseToggleSx: SxProps<Theme> = (theme) => ({
  flexWrap: "wrap",
  gap: 0.9,
  "& .MuiToggleButtonGroup-grouped": {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: "8px !important",
    margin: 0,
  },
  "& .MuiToggleButton-root": {
    minHeight: 38,
    gap: 0.75,
    px: 1.35,
    color: "text.primary",
    bgcolor: "background.paper",
    fontSize: 12,
    fontWeight: 900,
    textTransform: "none",
    transition:
      "background-color 0.16s ease, border-color 0.16s ease, color 0.16s ease",
    "& .MuiSvgIcon-root": {
      color: "primary.main",
    },
    "&:hover": {
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.18 : 0.08,
      ),
      borderColor: "primary.main",
    },
    "&.Mui-selected": {
      color: "primary.main",
      bgcolor: alpha(
        theme.palette.primary.main,
        theme.palette.mode === "dark" ? 0.22 : 0.12,
      ),
      borderColor: "primary.main",
      "&:hover": {
        bgcolor: alpha(
          theme.palette.primary.main,
          theme.palette.mode === "dark" ? 0.28 : 0.16,
        ),
      },
      "& .MuiSvgIcon-root": {
        color: "primary.main",
      },
    },
  },
});

const phaseTableShellSx: SxProps<Theme> = (theme) => ({
  flex: "1 1 auto",
  minHeight: { xs: 320, sm: 360 },
  height: { xs: 420, md: "clamp(380px, calc(100vh - 360px), 560px)" },
  "& .MuiPaper-root": {
    bgcolor: "background.paper",
    borderColor: "divider",
    borderRadius: 1.5,
    color: "text.primary",
  },
  "& .MuiTableContainer-root": {
    bgcolor: "background.paper",
  },
  "& .MuiBox-root:has(> .MuiTypography-subtitle1)": {
    px: { xs: 1.25, sm: 1.75 },
    py: 1.35,
    borderBottom: "1px solid",
    borderColor: "divider",
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.12 : 0.06,
    ),
  },
  "& .MuiTypography-subtitle1": {
    color: "text.primary",
    fontSize: 14,
    fontWeight: 900,
  },
  "& .MuiTextField-root": {
    width: { xs: "100%", sm: 256 },
  },
  "& .MuiOutlinedInput-root": {
    color: "text.primary",
    bgcolor: "background.paper",
    borderRadius: 1,
    "& fieldset": {
      borderColor: "divider",
    },
    "&:hover fieldset": {
      borderColor: "primary.main",
    },
    "&.Mui-focused fieldset": {
      borderColor: "primary.main",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: theme.palette.text.secondary,
    opacity: 1,
  },
  "& .MuiSvgIcon-root": {
    color: "primary.main",
  },
  "& .MuiTableCell-head": {
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.18 : 0.1,
    ),
    color: "text.primary",
    borderColor: "divider",
    fontSize: 11,
    fontWeight: 900,
  },
  "& .MuiTableCell-body": {
    bgcolor: "background.paper",
    color: "text.primary",
    borderColor: "divider",
    fontSize: 12,
  },
  "& .MuiTableRow-root:hover .MuiTableCell-body": {
    bgcolor: alpha(
      theme.palette.primary.main,
      theme.palette.mode === "dark" ? 0.14 : 0.05,
    ),
  },
});

const phaseFooterSx: SxProps<Theme> = {
  p: { xs: 1.25, sm: 1.5 },
  bgcolor: "background.paper",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 1.5,
};

const saveButtonSx: SxProps<Theme> = (theme) => ({
  minWidth: { xs: "100%", sm: 150 },
  minHeight: 38,
  borderRadius: 1,
  fontSize: 13,
  fontWeight: 900,
  textTransform: "none",
  boxShadow:
    theme.palette.mode === "dark"
      ? `0 12px 28px ${alpha(theme.palette.primary.main, 0.2)}`
      : `0 12px 28px ${alpha(theme.palette.primary.main, 0.16)}`,
  "&:hover": {
    boxShadow:
      theme.palette.mode === "dark"
        ? `0 14px 30px ${alpha(theme.palette.primary.main, 0.26)}`
        : `0 14px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
});

const phaseHeaderSx: SxProps<Theme> = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 2,
};

const phaseTitleSx: SxProps<Theme> = {
  color: "text.primary",
  fontSize: { xs: 30, sm: 34 },
  fontWeight: 900,
  lineHeight: 1,
};

const phaseTableSectionSx: SxProps<Theme> = {
  flex: "1 1 auto",
  minHeight: 0,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

const phaseCountChipSx =
  (selected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 22,
    minWidth: 24,
    ml: 0.25,
    bgcolor: selected
      ? theme.palette.primary.main
      : alpha(
          theme.palette.text.secondary,
          theme.palette.mode === "dark" ? 0.22 : 0.12,
        ),
    color: selected
      ? theme.palette.primary.contrastText
      : theme.palette.text.secondary,
    fontSize: 11,
    fontWeight: 900,
    "& .MuiChip-label": { px: 0.75 },
  });

const phaseMappingsChipSx: SxProps<Theme> = {
  height: 28,
  px: 0.75,
  borderColor: "divider",
  color: "text.primary",
  bgcolor: "background.paper",
  fontSize: 11,
  fontWeight: 900,
  "& .MuiChip-icon": {
    color: "primary.main",
  },
};

const phaseCheckboxSx: SxProps<Theme> = {
  color: "text.secondary",
  p: 0.5,
  "&.Mui-checked": {
    color: "primary.main",
  },
};

const phaseUnmappedChipSx: SxProps<Theme> = {
  height: 22,
  borderColor: "divider",
  color: "text.secondary",
  borderStyle: "dashed",
  fontSize: 11,
  fontWeight: 800,
};

const mappedPhaseChipSx =
  (isSelected: boolean): SxProps<Theme> =>
  (theme) => ({
    height: 24,
    borderRadius: 999,
    bgcolor: isSelected ? "primary.main" : "transparent",
    borderColor: isSelected ? "primary.main" : "warning.main",
    color: isSelected
      ? theme.palette.primary.contrastText
      : theme.palette.warning.main,
    fontSize: 11,
    fontWeight: 900,
    "& .MuiChip-label": { px: 1 },
  });

const strongInlineTextSx: SxProps<Theme> = {
  fontWeight: 900,
  color: "text.primary",
};

const unsavedChipSx: SxProps<Theme> = {
  height: 22,
  borderColor: "warning.main",
  color: "warning.main",
  fontWeight: 900,
};

export default function PhaseConfiguration() {
  const [costCategories, setCostCategories] = useState<CostCategory[]>([]);
  const [phaseMappings, setPhaseMappings] = useState<PhaseMapping[]>([]);
  const [selectedPhase, setSelectedPhase] = useState(phaseOptions[0]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      const [categoryResponse, phaseResponse] = await Promise.all([
        api.get<CostCategory[]>("/erp/cost-categories/"),
        api.get<PhaseMapping[]>("/phases/"),
      ]);

      setCostCategories(
        Array.isArray(categoryResponse.data) ? categoryResponse.data : [],
      );
      setPhaseMappings(
        Array.isArray(phaseResponse.data) ? phaseResponse.data : [],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  useEffect(() => {
    setSelectedCategoryIds(
      phaseMappings
        .filter(
          (mapping) =>
            mapping.phase === selectedPhase && mapping.cost_category !== null,
        )
        .map((mapping) => mapping.cost_category as number),
    );
  }, [phaseMappings, selectedPhase]);

  const mappedPhaseNamesByCategory = useMemo(() => {
    const next = new Map<number, string[]>();

    phaseMappings.forEach((mapping) => {
      if (mapping.cost_category === null) return;

      const existing = next.get(mapping.cost_category) ?? [];
      next.set(mapping.cost_category, [...existing, mapping.phase]);
    });

    return next;
  }, [phaseMappings]);

  const currentPhaseMappings = useMemo(
    () =>
      phaseMappings.filter(
        (mapping) =>
          mapping.phase === selectedPhase && mapping.cost_category !== null,
      ),
    [phaseMappings, selectedPhase],
  );

  const mappedCountByPhase = useMemo(() => {
    const counts: Record<string, number> = {};
    phaseMappings.forEach((mapping) => {
      if (mapping.cost_category === null) return;
      counts[mapping.phase] = (counts[mapping.phase] ?? 0) + 1;
    });
    return counts;
  }, [phaseMappings]);

  const hasUnsavedChanges = useMemo(() => {
    const savedIds = new Set(
      currentPhaseMappings.map((mapping) => mapping.cost_category as number),
    );
    return (
      savedIds.size !== selectedCategoryIds.length ||
      selectedCategoryIds.some((id) => !savedIds.has(id))
    );
  }, [currentPhaseMappings, selectedCategoryIds]);

  const rows = useMemo<CostCategoryRow[]>(
    () =>
      costCategories.map((category) => ({
        id: category.id,
        name: category.name ?? `Cost Category ${category.id}`,
        selected: selectedCategoryIds.includes(category.id),
        mappedPhases:
          mappedPhaseNamesByCategory.get(category.id)?.join(", ") ?? "Unmapped",
      })),
    [costCategories, mappedPhaseNamesByCategory, selectedCategoryIds],
  );

  const toggleCategory = (categoryId: number, checked: boolean) => {
    setSelectedCategoryIds((current) => {
      if (checked) {
        return current.includes(categoryId)
          ? current
          : [...current, categoryId];
      }

      return current.filter((id) => id !== categoryId);
    });
  };

  const saveMappings = async () => {
    const currentIds = new Set(
      currentPhaseMappings.map((mapping) => mapping.cost_category as number),
    );
    const selectedIds = new Set(selectedCategoryIds);
    const mappingsToDelete = currentPhaseMappings.filter(
      (mapping) =>
        mapping.cost_category !== null &&
        !selectedIds.has(mapping.cost_category),
    );
    const categoryIdsToCreate = selectedCategoryIds.filter(
      (categoryId) => !currentIds.has(categoryId),
    );

    setSaving(true);
    try {
      await Promise.all([
        ...mappingsToDelete.map((mapping) =>
          api.delete(`/phases/${mapping.id}/`),
        ),
        ...categoryIdsToCreate.map((categoryId) =>
          api.post("/phases/", {
            phase: selectedPhase,
            cost_category: categoryId,
          }),
        ),
      ]);

      showNotification({
        type: "success",
        message: "Phase mappings saved successfully.",
      });
      await loadConfiguration();
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnData<CostCategoryRow>[] = [
    {
      label: "Map",
      width: 70,
      render: (row) => (
        <Checkbox
          checked={row.selected}
          onChange={(event) => toggleCategory(row.id, event.target.checked)}
          onClick={(event) => event.stopPropagation()}
          inputProps={{ "aria-label": `Map ${row.name} to ${selectedPhase}` }}
          sx={phaseCheckboxSx}
        />
      ),
    },
    { label: "Cost Category", dataKey: "name" },
    {
      label: "Mapped Phases",
      width: 260,
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {row.mappedPhases === "Unmapped" ? (
            <Chip
              label="Unmapped"
              size="small"
              variant="outlined"
              sx={phaseUnmappedChipSx}
            />
          ) : (
            row.mappedPhases
              .split(", ")
              .map((phase) => (
                <Chip
                  key={phase}
                  label={phase}
                  size="small"
                  variant={phase === selectedPhase ? "filled" : "outlined"}
                  sx={mappedPhaseChipSx(phase === selectedPhase)}
                />
              ))
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={phasePageSx}>
      <Box component="main" sx={phaseContentSx}>
        <Box sx={phaseHeaderSx}>
          <Box>
            <Typography sx={[stepLabelSx, { mb: 0.65 }]}>
              Configuration
            </Typography>
            <Typography variant="h4" sx={phaseTitleSx}>
              Phase Configuration
            </Typography>
            <Typography sx={[phaseHelperSx, { mt: 1 }]}>
              Map each ERP cost category to the phase or phases it belongs to.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {loading && <CircularProgress size={22} />}
            <Chip
              icon={<CategoryOutlinedIcon />}
              label={`${phaseMappings.length} total mappings`}
              size="small"
              variant="outlined"
              sx={phaseMappingsChipSx}
            />
          </Stack>
        </Box>

        <Box>
          <Typography sx={stepLabelSx}>Step 1 - Choose Phase</Typography>
          <Typography sx={[phaseHelperSx, { mt: 0.6, mb: 1.25 }]}>
            Pick the phase you want to configure.
          </Typography>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={selectedPhase}
            onChange={(_event, value) => value && setSelectedPhase(value)}
            sx={phaseToggleSx}
          >
            {phaseOptions.map((phase) => (
              <ToggleButton key={phase} value={phase}>
                {phaseMeta[phase]?.icon}
                {phase}
                <Chip
                  label={mappedCountByPhase[phase] ?? 0}
                  size="small"
                  sx={phaseCountChipSx(selectedPhase === phase)}
                />
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>

        <Box sx={phaseTableSectionSx}>
          <Box>
            <Typography sx={stepLabelSx}>
              Step 2 - Select Cost Categories
            </Typography>
            <Typography sx={[phaseHelperSx, { mt: 0.6 }]}>
              Tick every cost category that belongs to {selectedPhase}. A
              category can belong to several phases.
            </Typography>
          </Box>
          <Box sx={phaseTableShellSx}>
            <VirtualizedTable
              tableHead={`Cost categories for ${selectedPhase}`}
              height="100%"
              columns={columns}
              rows={rows}
              onRowClick={(row) => toggleCategory(row.id, !row.selected)}
            />
          </Box>
        </Box>

        <Box sx={phaseFooterSx}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            rowGap={1.5}
            flexWrap="wrap"
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={stepLabelSx}>Step 3 - Save</Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                flexWrap="wrap"
                rowGap={0.5}
              >
                <Typography sx={phaseHelperSx}>
                  Save applies the{" "}
                  <Box component="span" sx={strongInlineTextSx}>
                    {selectedCategoryIds.length}
                  </Box>{" "}
                  of {costCategories.length} ticked categories to{" "}
                  <Box component="span" sx={strongInlineTextSx}>
                    {selectedPhase}
                  </Box>
                  .
                </Typography>
                {hasUnsavedChanges && (
                  <Chip
                    label="Unsaved changes"
                    variant="outlined"
                    size="small"
                    sx={unsavedChipSx}
                  />
                )}
              </Stack>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              disabled={saving}
              onClick={() => void saveMappings()}
              sx={saveButtonSx}
            >
              {saving ? "Saving..." : "Save Mapping"}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
