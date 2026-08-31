import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";

import api from "../api/axios";
import { showNotification } from "../api/NotificationService";
import { VirtualizedTable, type ColumnData } from "../components/common/TableView";
import { modalPrimaryActionButtonSx, pageHeaderSx } from "../styles/common";

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

      setCostCategories(Array.isArray(categoryResponse.data) ? categoryResponse.data : []);
      setPhaseMappings(Array.isArray(phaseResponse.data) ? phaseResponse.data : []);
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
        .filter((mapping) => mapping.phase === selectedPhase && mapping.cost_category !== null)
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
        (mapping) => mapping.phase === selectedPhase && mapping.cost_category !== null,
      ),
    [phaseMappings, selectedPhase],
  );

  const rows = useMemo<CostCategoryRow[]>(
    () =>
      costCategories.map((category) => ({
        id: category.id,
        name: category.name ?? `Cost Category ${category.id}`,
        selected: selectedCategoryIds.includes(category.id),
        mappedPhases: mappedPhaseNamesByCategory.get(category.id)?.join(", ") ?? "Unmapped",
      })),
    [costCategories, mappedPhaseNamesByCategory, selectedCategoryIds],
  );

  const toggleCategory = (categoryId: number, checked: boolean) => {
    setSelectedCategoryIds((current) => {
      if (checked) {
        return current.includes(categoryId) ? current : [...current, categoryId];
      }

      return current.filter((id) => id !== categoryId);
    });
  };

  const saveMappings = async () => {
    const currentIds = new Set(currentPhaseMappings.map((mapping) => mapping.cost_category as number));
    const selectedIds = new Set(selectedCategoryIds);
    const mappingsToDelete = currentPhaseMappings.filter(
      (mapping) => mapping.cost_category !== null && !selectedIds.has(mapping.cost_category),
    );
    const categoryIdsToCreate = selectedCategoryIds.filter((categoryId) => !currentIds.has(categoryId));

    setSaving(true);
    try {
      await Promise.all([
        ...mappingsToDelete.map((mapping) => api.delete(`/phases/${mapping.id}/`)),
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
      label: "",
      width: 70,
      render: (row) => (
        <Checkbox
          checked={row.selected}
          onChange={(event) => toggleCategory(row.id, event.target.checked)}
          onClick={(event) => event.stopPropagation()}
          inputProps={{ "aria-label": `Map ${row.name} to ${selectedPhase}` }}
        />
      ),
    },
    { label: "CostCategory", dataKey: "name" },
    {
      label: "Mapped Phases",
      width: 260,
      render: (row) => (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {row.mappedPhases === "Unmapped" ? (
            <Chip label="Unmapped" size="small" variant="outlined" />
          ) : (
            row.mappedPhases.split(", ").map((phase) => (
              <Chip key={phase} label={phase} size="small" color="primary" variant="outlined" />
            ))
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={pageHeaderSx}>
        <Box>
          <Typography variant="h5">Phase Configuration</Typography>
          <Typography variant="body2" color="text.secondary">
            Map ERP CostCategory records into one or more phases.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {loading && <CircularProgress size={22} />}
          <Chip label={`${phaseMappings.length} mappings`} size="small" />
        </Stack>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "minmax(460px, 1fr) 360px" },
          gap: 2,
          p: 2,
        }}
      >
        <VirtualizedTable
          tableHead="ERP CostCategory"
          height="calc(100vh - 220px)"
          columns={columns}
          rows={rows}
          onRowClick={(row) => toggleCategory(row.id, !row.selected)}
        />

        <Paper sx={{ p: 2, borderRadius: 1, alignSelf: "start" }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Phase Mapping</Typography>
              <Typography variant="body2" color="text.secondary">
                Choose a phase, then select all CostCategory records that belong to it.
              </Typography>
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel>Phase</InputLabel>
              <Select
                label="Phase"
                value={selectedPhase}
                onChange={(event) => setSelectedPhase(event.target.value)}
              >
                {phaseOptions.map((phase) => (
                  <MenuItem key={phase} value={phase}>
                    {phase}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Selected CostCategory
              </Typography>
              <Typography variant="h6">{selectedCategoryIds.length}</Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              disabled={saving}
              onClick={() => void saveMappings()}
              sx={modalPrimaryActionButtonSx}
            >
              Save Mapping
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
