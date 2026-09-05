import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import ExpandLessOutlinedIcon from "@mui/icons-material/ExpandLessOutlined";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";

import type { SubmissionProject } from "../../types/dataTypes";

export type TimeSheetCostCategory = {
  id: number;
  name: string;
};

export type TimeSheetPhaseMapping = {
  id: number;
  phase: string;
  cost_category: number | null;
  cost_category_name?: string | null;
};

export type TimeSheetCostMaster = {
  id: number;
  name: string;
  cost_category: number | null;
};

type AssignCostMasterTasksModalProps = {
  open: boolean;
  projects: SubmissionProject[];
  phases: TimeSheetPhaseMapping[];
  costCategories: TimeSheetCostCategory[];
  costMasters: TimeSheetCostMaster[];
  loading?: boolean;
  errorMessage?: string;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (selection: Record<number, number[]>) => void | Promise<void>;
};

const phaseOrder = ["Sales", "Execution", "Service"];

const getProjectLabel = (project: SubmissionProject) =>
  [project.code, project.description].filter(Boolean).join(" - ") ||
  `Project ${project.id}`;

const AssignCostMasterTasksModal: React.FC<AssignCostMasterTasksModalProps> = ({
  open,
  projects,
  phases,
  costCategories,
  costMasters,
  loading = false,
  errorMessage,
  submitting = false,
  onClose,
  onSubmit,
}) => {
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedByProject, setSelectedByProject] = useState<
    Record<number, number[]>
  >({});

  // Reset transient state when the dialog closes, adjusting during render
  // (previous-value pattern) instead of in an effect.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) {
      setExpandedKeys([]);
      setSelectedByProject({});
    }
  }

  const categoryById = useMemo(
    () => new Map(costCategories.map((category) => [category.id, category])),
    [costCategories],
  );

  const costMastersByCategory = useMemo(() => {
    const grouped = new Map<number, TimeSheetCostMaster[]>();
    costMasters.forEach((costMaster) => {
      if (costMaster.cost_category === null) {
        return;
      }

      const current = grouped.get(costMaster.cost_category) ?? [];
      current.push(costMaster);
      grouped.set(costMaster.cost_category, current);
    });

    grouped.forEach((items) =>
      items.sort((a, b) => a.name.localeCompare(b.name)),
    );
    return grouped;
  }, [costMasters]);

  const phasesWithCategories = useMemo(
    () =>
      phaseOrder
        .map((phaseName) => ({
          name: phaseName,
          categories: phases
            .filter(
              (phase) =>
                phase.phase === phaseName && phase.cost_category !== null,
            )
            .map((phase) => categoryById.get(phase.cost_category as number))
            .filter((category): category is TimeSheetCostCategory =>
              Boolean(category),
            )
            .filter(
              (category) =>
                (costMastersByCategory.get(category.id)?.length ?? 0) > 0,
            )
            .sort((a, b) => a.name.localeCompare(b.name)),
        }))
        .filter((phase) => phase.categories.length > 0),
    [categoryById, costMastersByCategory, phases],
  );

  const allSelectableIds = useMemo(
    () =>
      phasesWithCategories.flatMap((phase) =>
        phase.categories.flatMap((category) =>
          (costMastersByCategory.get(category.id) ?? []).map(
            (costMaster) => costMaster.id,
          ),
        ),
      ),
    [costMastersByCategory, phasesWithCategories],
  );

  const toggleExpanded = (key: string) => {
    setExpandedKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  const setProjectSelection = (
    projectId: number,
    ids: number[],
    checked: boolean,
  ) => {
    setSelectedByProject((current) => {
      const existing = new Set(current[projectId] ?? []);
      ids.forEach((id) => {
        if (checked) {
          existing.add(id);
        } else {
          existing.delete(id);
        }
      });

      return {
        ...current,
        [projectId]: Array.from(existing),
      };
    });
  };

  const getSelectionState = (projectId: number, ids: number[]) => {
    const selectedIds = selectedByProject[projectId] ?? [];
    const selectedCount = ids.filter((id) => selectedIds.includes(id)).length;

    return {
      checked: ids.length > 0 && selectedCount === ids.length,
      indeterminate: selectedCount > 0 && selectedCount < ids.length,
    };
  };

  const selectedCount = Object.values(selectedByProject).reduce(
    (total, ids) => total + ids.length,
    0,
  );

  const submitSelection = async () => {
    const payload = Object.entries(selectedByProject).reduce<
      Record<number, number[]>
    >((current, [projectId, ids]) => {
      if (ids.length > 0) {
        current[Number(projectId)] = ids;
      }

      return current;
    }, {});

    await onSubmit(payload);
    setSelectedByProject({});
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          Assign Task To Project
          <Tooltip title="Close">
            <IconButton size="small" onClick={onClose}>
              <CloseOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ height: 560, overflow: "auto", p: 2 }}>
        {loading ? (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%" }}
            spacing={1.5}
          >
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading projects and cost masters...
            </Typography>
          </Stack>
        ) : errorMessage ? (
          <Typography color="error">{errorMessage}</Typography>
        ) : projects.length === 0 ? (
          <Typography color="text.secondary">
            No assigned projects found for the selected week.
          </Typography>
        ) : phasesWithCategories.length === 0 ? (
          <Typography color="text.secondary">
            No mapped cost master items found.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {projects.map((project) => {
              const projectKey = `project-${project.id}`;
              const projectState = getSelectionState(
                project.id,
                allSelectableIds,
              );

              return (
                <Box
                  key={project.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={0.5}
                    sx={{ px: 1, py: 0.75 }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(projectKey)}
                    >
                      {expandedKeys.includes(projectKey) ? (
                        <ExpandLessOutlinedIcon />
                      ) : (
                        <ExpandMoreOutlinedIcon />
                      )}
                    </IconButton>
                    <Checkbox
                      size="small"
                      checked={projectState.checked}
                      indeterminate={projectState.indeterminate}
                      onChange={(event) =>
                        setProjectSelection(
                          project.id,
                          allSelectableIds,
                          event.target.checked,
                        )
                      }
                    />
                    <AssignmentOutlinedIcon fontSize="small" color="action" />
                    <Typography fontWeight={600}>
                      {getProjectLabel(project)}
                    </Typography>
                  </Stack>
                  <Collapse
                    in={expandedKeys.includes(projectKey)}
                    timeout="auto"
                    unmountOnExit
                  >
                    <Stack spacing={0.5} sx={{ pb: 1, pl: 4, pr: 1 }}>
                      {phasesWithCategories.map((phase) => {
                        const phaseKey = `${project.id}-${phase.name}`;
                        const phaseIds = phase.categories.flatMap((category) =>
                          (costMastersByCategory.get(category.id) ?? []).map(
                            (costMaster) => costMaster.id,
                          ),
                        );
                        const phaseState = getSelectionState(
                          project.id,
                          phaseIds,
                        );

                        return (
                          <Box key={phaseKey}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              spacing={0.5}
                            >
                              <IconButton
                                size="small"
                                onClick={() => toggleExpanded(phaseKey)}
                              >
                                {expandedKeys.includes(phaseKey) ? (
                                  <ExpandLessOutlinedIcon />
                                ) : (
                                  <ExpandMoreOutlinedIcon />
                                )}
                              </IconButton>
                              <Checkbox
                                size="small"
                                checked={phaseState.checked}
                                indeterminate={phaseState.indeterminate}
                                onChange={(event) =>
                                  setProjectSelection(
                                    project.id,
                                    phaseIds,
                                    event.target.checked,
                                  )
                                }
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {phase.name}
                              </Typography>
                            </Stack>
                            <Collapse
                              in={expandedKeys.includes(phaseKey)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Stack spacing={0.25} sx={{ pl: 4 }}>
                                {phase.categories.map((category) => {
                                  const categoryKey = `${project.id}-${phase.name}-${category.id}`;
                                  const categoryIds = (
                                    costMastersByCategory.get(category.id) ?? []
                                  ).map((costMaster) => costMaster.id);
                                  const categoryState = getSelectionState(
                                    project.id,
                                    categoryIds,
                                  );

                                  return (
                                    <Box key={categoryKey}>
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={0.5}
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            toggleExpanded(categoryKey)
                                          }
                                        >
                                          {expandedKeys.includes(
                                            categoryKey,
                                          ) ? (
                                            <ExpandLessOutlinedIcon />
                                          ) : (
                                            <ExpandMoreOutlinedIcon />
                                          )}
                                        </IconButton>
                                        <Checkbox
                                          size="small"
                                          checked={categoryState.checked}
                                          indeterminate={
                                            categoryState.indeterminate
                                          }
                                          onChange={(event) =>
                                            setProjectSelection(
                                              project.id,
                                              categoryIds,
                                              event.target.checked,
                                            )
                                          }
                                        />
                                        <Typography variant="body2">
                                          {category.name}
                                        </Typography>
                                      </Stack>
                                      <Collapse
                                        in={expandedKeys.includes(categoryKey)}
                                        timeout="auto"
                                        unmountOnExit
                                      >
                                        <Stack sx={{ pl: 5 }}>
                                          {(
                                            costMastersByCategory.get(
                                              category.id,
                                            ) ?? []
                                          ).map((costMaster) => (
                                            <Stack
                                              key={costMaster.id}
                                              direction="row"
                                              alignItems="center"
                                              spacing={0.5}
                                            >
                                              <Checkbox
                                                size="small"
                                                checked={(
                                                  selectedByProject[
                                                    project.id
                                                  ] ?? []
                                                ).includes(costMaster.id)}
                                                onChange={(event) =>
                                                  setProjectSelection(
                                                    project.id,
                                                    [costMaster.id],
                                                    event.target.checked,
                                                  )
                                                }
                                              />
                                              <Typography
                                                variant="body2"
                                                color="text.secondary"
                                              >
                                                {costMaster.name}
                                              </Typography>
                                            </Stack>
                                          ))}
                                        </Stack>
                                      </Collapse>
                                    </Box>
                                  );
                                })}
                              </Stack>
                            </Collapse>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Collapse>
                </Box>
              );
            })}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          startIcon={<CancelOutlinedIcon />}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={<SendOutlinedIcon />}
          disabled={submitting || selectedCount === 0}
          onClick={() => void submitSelection()}
        >
          {submitting ? "Assigning..." : `Assign Selected (${selectedCount})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignCostMasterTasksModal;
