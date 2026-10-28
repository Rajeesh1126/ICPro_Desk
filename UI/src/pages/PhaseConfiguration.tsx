import {
  type ReactElement,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";

import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import { queryClient } from "@/api/queryClient";
import { showNotification } from "@/api/notificationService";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import {
  compactCheckbox,
  countChip,
  dashedMutedChip,
  footerSurface,
  helperText,
  mappedTagChip,
  metaChip,
  minWidthZero,
  page,
  pageContent,
  primarySaveButton,
  scrollableContent,
  sectionInset,
  segmentedControl,
  stepLabel,
  strongInlineText,
  tablePanelFill,
  tableSection,
  warningOutlineChip,
  fullWidthSx,
  pushRightSx,
  smUpFlexSx,
  topSpacingSx,
} from "@/styles/common";
import PageHeader from "@/components/common/PageHeader";

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

type CostCategoryRow = {
  id: number;
  name: string;
  selected: boolean;
  mappedPhases: string;
};

type MappingFilter = "all" | "selected" | "unmapped";

const phaseOptions = ["Sales", "Execution", "Service"];

const phaseMeta: Record<string, { icon: ReactElement }> = {
  Sales: { icon: <SellOutlinedIcon fontSize="small" /> },
  Execution: { icon: <EngineeringOutlinedIcon fontSize="small" /> },
  Service: { icon: <HandymanOutlinedIcon fontSize="small" /> },
};

export default function PhaseConfiguration() {
  const [selectedPhase, setSelectedPhase] = useState(phaseOptions[0]);
  const [saving, setSaving] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<string | null>(null);
  const [mappingFilter, setMappingFilter] = useState<MappingFilter>("all");
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

  // Categories and mappings are cached and load independently: the category
  // table renders as soon as its own data arrives.
  const categoriesQuery = useApiQuery<CostCategory[]>("/erp/cost-categories/");
  const mappingsQuery = useApiQuery<PhaseMapping[]>("/phases/");
  const costCategories = useMemo(
    () => asArray<CostCategory>(categoriesQuery.data),
    [categoriesQuery.data],
  );
  const phaseMappings = useMemo(
    () => asArray<PhaseMapping>(mappingsQuery.data),
    [mappingsQuery.data],
  );
  const loading = categoriesQuery.isFetching || mappingsQuery.isFetching;

  // Ticks are a draft over the saved mappings for the selected phase, so a
  // background refresh never wipes unsaved changes.
  const [draft, setDraft] = useState<{ phase: string; ids: number[] } | null>(null);
  const savedCategoryIds = useMemo(
    () =>
      phaseMappings
        .filter(
          (mapping) =>
            mapping.phase === selectedPhase && mapping.cost_category !== null,
        )
        .map((mapping) => mapping.cost_category as number),
    [phaseMappings, selectedPhase],
  );
  const selectedCategoryIds =
    draft?.phase === selectedPhase ? draft.ids : savedCategoryIds;

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

  const changedMappingCount = useMemo(() => {
    const savedIds = new Set(
      currentPhaseMappings.map((mapping) => mapping.cost_category as number),
    );
    const selectedIds = new Set(selectedCategoryIds);
    return (
      selectedCategoryIds.filter((id) => !savedIds.has(id)).length +
      [...savedIds].filter((id) => !selectedIds.has(id)).length
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
  const visibleRows = useMemo(() => {
    if (mappingFilter === "selected") return rows.filter((row) => row.selected);
    if (mappingFilter === "unmapped") {
      return rows.filter((row) => row.mappedPhases === "Unmapped");
    }
    return rows;
  }, [mappingFilter, rows]);

  // Switching phases resets the ticked categories, so confirm before losing edits.
  const requestPhaseChange = (next: string | null) => {
    if (!next || next === selectedPhase) return;
    if (hasUnsavedChanges) {
      setPendingPhase(next);
      return;
    }
    setSelectedPhase(next);
  };

  const toggleCategory = useCallback((categoryId: number, checked: boolean) => {
    const current = selectedCategoryIds;
    const ids = checked
      ? current.includes(categoryId)
        ? current
        : [...current, categoryId]
      : current.filter((id) => id !== categoryId);
    setDraft({ phase: selectedPhase, ids });
  }, [selectedCategoryIds, selectedPhase]);

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
      // Wait for the refreshed mappings before dropping the draft, so the
      // ticks never flash back to the old state.
      await queryClient.invalidateQueries({ queryKey: ["/phases/"] });
      setDraft(null);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSaving(false);
    }
  };

  const columns = useMemo<ColumnData<CostCategoryRow>[]>(() => [
    {
      label: "Map",
      width: { xs: "14%", sm: 70 },
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
    {
      label: "Cost Category",
      dataKey: "name",
      width: { xs: "46%", sm: "auto" },
    },
    {
      label: "Mapped Phases",
      width: { xs: "40%", sm: 260 },
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {row.mappedPhases === "Unmapped" ? (
            <Chip
              label="Unmapped"
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
                  variant={phase === selectedPhase ? "filled" : "outlined"}
                  sx={mappedTagChip(phase, phase === selectedPhase)}
                />
              ))
          )}
        </Stack>
      ),
    },
  ], [selectedPhase, toggleCategory]);

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Phase Configuration"
          subtitle="Map each ERP cost category to the phase or phases it belongs to."
          actions={[
            loading && {
              key: "loading",
              priority: "high",
              node: <CircularProgress size={22} />,
            },
            {
              key: "total",
              priority: "high",
              node: (
                <Chip
                  icon={<CategoryOutlinedIcon />}
                  label={`${phaseMappings.length} total mappings`}
                  variant="outlined"
                  sx={metaChip}
                />
              ),
              // Phones: just the count, with the full wording for screen readers.
              mobileNode: (
                <Chip
                  icon={<CategoryOutlinedIcon />}
                  label={phaseMappings.length}
                  aria-label={`${phaseMappings.length} total mappings`}
                  variant="outlined"
                  sx={metaChip}
                />
              ),
            },
          ]}
        />

        <Box sx={scrollableContent}>
          <Box sx={sectionInset}>
            <Typography component="h2" variant="h6" sx={stepLabel}>Step 1 · Choose phase</Typography>
            <Typography sx={helperText}>
              Pick the phase you want to configure.
            </Typography>
            {isPhone ? (
              <FormControl fullWidth sx={topSpacingSx}>
                <InputLabel id="phase-select-label">Phase</InputLabel>
                <Select
                  labelId="phase-select-label"
                  label="Phase"
                  value={selectedPhase}
                  onChange={(event) => requestPhaseChange(event.target.value)}
                >
                  {phaseOptions.map((phase) => (
                    <MenuItem key={phase} value={phase}>
                      <Stack direction="row" spacing={1} alignItems="center" sx={fullWidthSx}>
                        {phaseMeta[phase]?.icon}
                        <span>{phase}</span>
                        <Typography variant="caption" color="text.secondary" sx={pushRightSx}>
                          {mappedCountByPhase[phase] ?? 0} mapped
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
            <ToggleButtonGroup
              exclusive
              value={selectedPhase}
              onChange={(_event, value) => requestPhaseChange(value)}
              aria-label="Phase"
              sx={segmentedControl}
            >
              {phaseOptions.map((phase) => (
                <ToggleButton key={phase} value={phase}>
                  <Box
                    alignItems='center'
                    sx={smUpFlexSx}
                  >
                    {phaseMeta[phase]?.icon}
                  </Box>
                  {phase}
                  <Chip
                    label={mappedCountByPhase[phase] ?? 0}
                    sx={countChip(selectedPhase === phase)}
                  />
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            )}
          </Box>

          <Box sx={tableSection}>
            <Box>
              <Typography component="h2" variant="h6" sx={stepLabel}>
                Step 2 · Select cost categories
              </Typography>
              <Typography sx={helperText}>
                Tick every cost category that belongs to {selectedPhase}. A
                category can belong to several phases.
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={mappingFilter}
                onChange={(_event, next: MappingFilter | null) =>
                  next && setMappingFilter(next)
                }
                aria-label="Filter cost categories"
                sx={topSpacingSx}
              >
                <ToggleButton value="all">All ({rows.length})</ToggleButton>
                <ToggleButton value="selected">
                  Selected ({rows.filter((row) => row.selected).length})
                </ToggleButton>
                <ToggleButton value="unmapped">
                  Unmapped ({rows.filter((row) => row.mappedPhases === "Unmapped").length})
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={tablePanelFill}>
              <VirtualizedTable
                tableHead={`Cost categories for ${selectedPhase}`}
                height="100%"
                columns={columns}
                rows={visibleRows}
                tableMinWidth="100%"
                loading={loading && costCategories.length === 0}
                emptyTitle={mappingFilter === "all" ? "No cost categories" : "No matching cost categories"}
                emptyDescription={
                  mappingFilter === "all"
                    ? "Cost categories from the ERP will appear here."
                    : "Choose another filter to see more cost categories."
                }
                onRowClick={(row) => toggleCategory(row.id, !row.selected)}
              />
            </Box>
          </Box>

          <Box sx={footerSurface}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              rowGap={1.5}
              flexWrap="wrap"
              alignItems={{ xs: "stretch", sm: "center" }}
              justifyContent="space-between"
            >
              <Box sx={minWidthZero}>
                <Typography component="h2" variant="h6" sx={stepLabel}>Step 3 · Save changes</Typography>
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
                  {hasUnsavedChanges ? (
                    <Chip
                      label={`${changedMappingCount} unsaved change${changedMappingCount === 1 ? "" : "s"}`}
                      variant="outlined"
                      sx={warningOutlineChip}
                    />
                  ) : (
                    <Chip label="All changes saved" color="success" variant="outlined" />
                  )}
                </Stack>
              </Box>

              <Button
                variant="contained"
                startIcon={<SaveOutlinedIcon />}
                disabled={saving || !hasUnsavedChanges}
                onClick={() => void saveMappings()}
                sx={primarySaveButton}
              >
                {saving ? "Saving..." : "Save Mapping"}
              </Button>
            </Stack>
          </Box>
        </Box>
        <ConfirmDialog
          open={pendingPhase !== null}
          onClose={() => setPendingPhase(null)}
          title="Discard unsaved changes?"
          description={`You changed the categories for ${selectedPhase} but did not save. Switching to ${pendingPhase ?? ""} will discard those changes.`}
          cancelLabel={`Stay on ${selectedPhase}`}
          confirmLabel="Discard and switch"
          confirmColor="warning"
          onConfirm={() => {
            if (pendingPhase) setSelectedPhase(pendingPhase);
            setPendingPhase(null);
          }}
        />
      </Box>
    </Box>
  );
}
