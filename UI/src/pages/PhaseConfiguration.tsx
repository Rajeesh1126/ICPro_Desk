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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
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
import {
  compactCheckbox,
  countChip,
  dashedMutedChip,
  footerSurface,
  helperText,
  helperTextSpaced,
  mappedTagChip,
  metaChip,
  minWidthZero,
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  primarySaveButton,
  scrollableContent,
  sectionInset,
  segmentedControl,
  stepLabel,
  strongInlineText,
  tablePanelFill,
  tableSection,
  warningOutlineChip,
} from "../styles/common";

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
          sx={compactCheckbox}
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
              sx={dashedMutedChip}
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
                  sx={mappedTagChip(phase === selectedPhase)}
                />
              ))
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={page}>
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h4" sx={pageTitle}>
              Phase Configuration
            </Typography>
            <Typography sx={pageSubtitle}>
              Map each ERP cost category to the phase or phases it belongs to.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={pageHeaderActions}>
            {loading && <CircularProgress size={22} />}
            <Chip
              icon={<CategoryOutlinedIcon />}
              label={`${phaseMappings.length} total mappings`}
              size="small"
              variant="outlined"
              sx={metaChip}
            />
          </Stack>
        </Box>

        <Box sx={scrollableContent}>
          <Box sx={sectionInset}>
            <Typography sx={stepLabel}>Step 1 - Choose Phase</Typography>
            <Typography sx={helperTextSpaced}>
              Pick the phase you want to configure.
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={selectedPhase}
              onChange={(_event, value) => value && setSelectedPhase(value)}
              sx={segmentedControl}
            >
              {phaseOptions.map((phase) => (
                <ToggleButton key={phase} value={phase}>
                  {phaseMeta[phase]?.icon}
                  {phase}
                  <Chip
                    label={mappedCountByPhase[phase] ?? 0}
                    size="small"
                    sx={countChip(selectedPhase === phase)}
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          <Box sx={tableSection}>
            <Box>
              <Typography sx={stepLabel}>
                Step 2 - Select Cost Categories
              </Typography>
              <Typography sx={helperText}>
                Tick every cost category that belongs to {selectedPhase}. A
                category can belong to several phases.
              </Typography>
            </Box>
            <Box sx={tablePanelFill}>
              <VirtualizedTable
                tableHead={`Cost categories for ${selectedPhase}`}
                height="100%"
                columns={columns}
                rows={rows}
                onRowClick={(row) => toggleCategory(row.id, !row.selected)}
              />
            </Box>
          </Box>

          <Box sx={footerSurface}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              rowGap={1.5}
              flexWrap="wrap"
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Box sx={minWidthZero}>
                <Typography sx={stepLabel}>Step 3 - Save</Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                  rowGap={0.5}
                >
                  <Typography sx={helperText}>
                    Save applies the{" "}
                    <Box component="span" sx={strongInlineText}>
                      {selectedCategoryIds.length}
                    </Box>{" "}
                    of {costCategories.length} ticked categories to{" "}
                    <Box component="span" sx={strongInlineText}>
                      {selectedPhase}
                    </Box>
                    .
                  </Typography>
                  {hasUnsavedChanges && (
                    <Chip
                      label="Unsaved changes"
                      variant="outlined"
                      size="small"
                      sx={warningOutlineChip}
                    />
                  )}
                </Stack>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={saving}
                onClick={() => void saveMappings()}
                sx={primarySaveButton}
              >
                {saving ? "Saving..." : "Save Mapping"}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
