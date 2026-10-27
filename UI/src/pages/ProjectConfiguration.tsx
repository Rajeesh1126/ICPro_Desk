import { useDiscardGuard } from "@/components/common/useDiscardGuard";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";

import api from "@/api/axios";
import { asArray, useApiQuery } from "@/api/useApiQuery";
import DialogHeader from "@/components/common/DialogHeader";
import ActionDivider from "@/components/common/ActionDivider";
import { showNotification } from "@/api/notificationService";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
  VirtualizedTable,
  type ColumnData,
} from "@/components/common/TableView";
import {
  deleteIconSx,
  tableHeaderAddButtonSx,
  rowDeleteButtonSx,
  editIconSx,
  page,
  pageContent,
  wideFilterField,
  fullHeightSx,
  projectContentSx,
  projectFieldHintSx,
} from "@/styles/common";
import { getStoredPermissions } from "@/utils/permissions";
import PageHeader from "@/components/common/PageHeader";

type ProjectConfig = {
  id: number;
  code: string | null;
  description: string | null;
  quotation_id?: number | null;
};

type MilestoneConfig = {
  id: number;
  project: number;
  category: number | null;
  name: string;
};

type TaskConfig = {
  id: number;
  project: number;
  milestone: number | null;
  cost: number | null;
  name: string;
  description: string | null;
};

type DialogMode = "create" | "edit";
type DialogType = "project" | "milestone" | "task";
type ConfigTableType = "projects" | "milestones" | "tasks";
type FormErrors = Record<string, string>;

type ConfigTableRow = {
  id: number;
  name: string;
  description?: string;
  category?: string | number;
  milestone?: string;
  cost?: string | number;
  actions: null;
  onEdit: () => void;
  onDelete: () => void;
};

const emptyProjectForm = {
  code: "",
  description: "",
};

const emptyMilestoneForm = {
  project: "",
  category: "",
  name: "",
};

const emptyTaskForm = {
  project: "",
  milestone: "",
  cost: "",
  name: "",
  description: "",
};

export default function ProjectConfiguration() {
  const permissions = getStoredPermissions();
  const canAddProject = permissions.has("add_project");
  const canChangeProject = permissions.has("change_project");
  const canDeleteProject = permissions.has("delete_project");
  const canAddMilestone = permissions.has("add_milestone");
  const canChangeMilestone = permissions.has("change_milestone");
  const canDeleteMilestone = permissions.has("delete_milestone");
  const canAddTask = permissions.has("add_task");
  const canChangeTask = permissions.has("change_task");
  const canDeleteTask = permissions.has("delete_task");
  // Three independent cached queries: each table renders as soon as its own
  // data arrives instead of waiting for the slowest request.
  const projectsQuery = useApiQuery<ProjectConfig[]>("/projects/");
  const milestonesQuery = useApiQuery<MilestoneConfig[]>("/milestones/");
  const tasksQuery = useApiQuery<TaskConfig[]>("/tasks/");
  const projects = useMemo(
    () => asArray<ProjectConfig>(projectsQuery.data),
    [projectsQuery.data],
  );
  const milestones = useMemo(
    () => asArray<MilestoneConfig>(milestonesQuery.data),
    [milestonesQuery.data],
  );
  const tasks = useMemo(
    () => asArray<TaskConfig>(tasksQuery.data),
    [tasksQuery.data],
  );
  const [pickedProjectId, setSelectedProjectId] = useState<number | "">("");
  // Keep the user's pick while it still exists; otherwise default to the first project.
  const selectedProjectId: number | "" =
    pickedProjectId !== "" &&
    projects.some((project) => project.id === pickedProjectId)
      ? pickedProjectId
      : projects.length
        ? projects[0].id
        : "";
  const [dialogType, setDialogType] = useState<DialogType | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    type: DialogType;
    id: number;
    label: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [expandedConfigTable, setExpandedConfigTable] =
    useState<ConfigTableType | null>(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId) ?? null,
    [projects, selectedProjectId],
  );

  const visibleMilestones = useMemo(
    () =>
      selectedProjectId === ""
        ? milestones
        : milestones.filter(
            (milestone) => milestone.project === selectedProjectId,
          ),
    [milestones, selectedProjectId],
  );

  const visibleTasks = useMemo(
    () =>
      selectedProjectId === ""
        ? tasks
        : tasks.filter((task) => task.project === selectedProjectId),
    [selectedProjectId, tasks],
  );

  const loading =
    projectsQuery.isPending ||
    milestonesQuery.isPending ||
    tasksQuery.isPending;

  const openProjectDialog = (mode: DialogMode, project?: ProjectConfig) => {
    setDialogType("project");
    setDialogMode(mode);
    setEditingId(project?.id ?? null);
    setProjectForm({
      code: project?.code ?? "",
      description: project?.description ?? "",
    });
    setFormErrors({});
  };

  const openMilestoneDialog = (
    mode: DialogMode,
    milestone?: MilestoneConfig,
  ) => {
    setDialogType("milestone");
    setDialogMode(mode);
    setEditingId(milestone?.id ?? null);
    setMilestoneForm({
      project: String(milestone?.project ?? selectedProjectId ?? ""),
      category: milestone?.category == null ? "" : String(milestone.category),
      name: milestone?.name ?? "",
    });
    setFormErrors({});
  };

  const openTaskDialog = (mode: DialogMode, task?: TaskConfig) => {
    const projectId = task?.project ?? selectedProjectId;
    const projectMilestones = milestones.filter(
      (milestone) => milestone.project === projectId,
    );

    setDialogType("task");
    setDialogMode(mode);
    setEditingId(task?.id ?? null);
    setTaskForm({
      project: String(projectId ?? ""),
      milestone:
        task?.milestone == null
          ? String(projectMilestones[0]?.id ?? "")
          : String(task.milestone),
      cost: task?.cost == null ? "" : String(task.cost),
      name: task?.name ?? "",
      description: task?.description ?? "",
    });
    setFormErrors({});
  };

  const closeDialog = () => {
    setDialogType(null);
    setEditingId(null);
    setFormErrors({});
  };

  // Ask before discarding typed input (backdrop, Escape, X, Cancel).
  const discard = useDiscardGuard(dialogType !== null, closeDialog);

  const clearFieldError = (field: string) => {
    setFormErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateProjectForm = () => {
    const errors: FormErrors = {};

    if (!projectForm.code.trim()) {
      errors.code = "Project code is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateMilestoneForm = () => {
    const errors: FormErrors = {};

    if (!milestoneForm.project) {
      errors.project = "Project is required.";
    }

    if (!milestoneForm.name.trim()) {
      errors.name = "Milestone name is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateTaskForm = () => {
    const errors: FormErrors = {};

    if (!taskForm.project) {
      errors.project = "Project is required.";
    }

    if (!taskForm.name.trim()) {
      errors.name = "Task name is required.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isDialogFormValid = () => {
    if (dialogType === "project") {
      return Boolean(projectForm.code.trim());
    }

    if (dialogType === "milestone") {
      return Boolean(milestoneForm.project && milestoneForm.name.trim());
    }

    if (dialogType === "task") {
      return Boolean(taskForm.project && taskForm.name.trim());
    }

    return false;
  };

  const saveProject = async () => {
    const payload = {
      code: projectForm.code.trim(),
      description: projectForm.description.trim() || null,
    };

    if (!validateProjectForm()) return false;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/projects/${editingId}/`, payload);
    } else {
      await api.post("/projects/", payload);
    }

    return true;
  };

  const saveMilestone = async () => {
    const projectId = Number(milestoneForm.project);
    const payload = {
      project: projectId,
      category:
        milestoneForm.category === "" ? null : Number(milestoneForm.category),
      name: milestoneForm.name.trim(),
    };

    if (!validateMilestoneForm()) return false;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/milestones/${editingId}/`, payload);
    } else {
      await api.post("/milestones/", payload);
    }

    return true;
  };

  const saveTask = async () => {
    const projectId = Number(taskForm.project);
    const payload = {
      project: projectId,
      milestone: taskForm.milestone === "" ? null : Number(taskForm.milestone),
      cost: taskForm.cost === "" ? null : Number(taskForm.cost),
      name: taskForm.name.trim(),
      description: taskForm.description.trim() || null,
    };

    if (!validateTaskForm()) return false;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/tasks/${editingId}/`, payload);
    } else {
      await api.post("/tasks/", payload);
    }

    return true;
  };

  const saveDialog = async () => {
    if (!dialogType) return;

    setSaving(true);
    try {
      let saved = false;

      if (dialogType === "project") saved = await saveProject();
      if (dialogType === "milestone") saved = await saveMilestone();
      if (dialogType === "task") saved = await saveTask();

      if (!saved) {
        return;
      }

      showNotification({
        type: "success",
        message: "Project configuration saved successfully.",
      });
      closeDialog();
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setSaving(false);
    }
  };

  const deleteRecord = async () => {
    if (!deleteTarget) return;

    const endpointByType = {
      project: "projects",
      milestone: "milestones",
      task: "tasks",
    };

    setDeleting(true);
    try {
      await api.delete(
        `/${endpointByType[deleteTarget.type]}/${deleteTarget.id}/`,
      );
      showNotification({
        type: "success",
        message: "Project configuration deleted successfully.",
      });
      setDeleteTarget(null);
    } catch {
      // The shared request error dialog explains the failure.
    } finally {
      setDeleting(false);
    }
  };

  const milestoneOptionsForTask = milestones.filter(
    (milestone) => milestone.project === Number(taskForm.project),
  );

  const actionColumn = (
    canChange: boolean,
    canDelete: boolean,
  ): ColumnData<ConfigTableRow> => ({
    label: "Actions",
    width: 90,
    render: (row) => (
      <Stack direction="row" spacing={0}>
        {canChange && (
          <Tooltip title="Edit">
            <IconButton aria-label={`Edit ${row.name}`} onClick={row.onEdit}>
              <EditOutlinedIcon fontSize="small" sx={editIconSx} />
            </IconButton>
          </Tooltip>
        )}

        <ActionDivider />

        {canDelete && (
          <Tooltip title="Delete">
            <IconButton
              sx={rowDeleteButtonSx}
              aria-label={`Delete ${row.name}`}
              onClick={row.onDelete}
            >
              <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    ),
  });

  const projectColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Code", dataKey: "name", width: "auto" },
    { label: "Description", dataKey: "description", width: "auto" },
    actionColumn(canChangeProject, canDeleteProject),
  ];

  const milestoneColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name", width: "auto" },
    { label: "Category", dataKey: "category", width: "auto" },
    actionColumn(canChangeMilestone, canDeleteMilestone),
  ];

  const taskColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name", width: "auto" },
    { label: "Milestone", dataKey: "milestone", width: "auto" },
    {
      label: "Cost",
      dataKey: "cost",
      width: { xs: "20%", sm: "10%" },
      numeric: true,
    },
    { label: "Description", dataKey: "description", width: "auto" },
    actionColumn(canChangeTask, canDeleteTask),
  ];

  const projectRows = projects.map((project) => ({
    id: project.id,
    name: project.code || "",
    description: project.description || "",
    actions: null,
    onEdit: () => openProjectDialog("edit", project),
    onDelete: () =>
      setDeleteTarget({
        type: "project",
        id: project.id,
        label: project.code || `Project ${project.id}`,
      }),
  }));

  const milestoneRows = visibleMilestones.map((milestone) => ({
    id: milestone.id,
    name: milestone.name,
    category: milestone.category ?? "",
    actions: null,
    onEdit: () => openMilestoneDialog("edit", milestone),
    onDelete: () =>
      setDeleteTarget({
        type: "milestone",
        id: milestone.id,
        label: milestone.name,
      }),
  }));

  const taskRows = visibleTasks.map((task) => {
    const milestone = milestones.find((item) => item.id === task.milestone);

    return {
      id: task.id,
      name: task.name,
      milestone: milestone?.name ?? "",
      cost: task.cost ?? "",
      description: task.description ?? "",
      actions: null,
      onEdit: () => openTaskDialog("edit", task),
      onDelete: () =>
        setDeleteTarget({
          type: "task",
          id: task.id,
          label: task.name,
        }),
    };
  });

  return (
    <Box sx={page}>
      <Box sx={pageContent}>
        <PageHeader
          title="Project Configuration"
          subtitle="Configure projects, milestones, and tasks without assigning users."
        />

        <Box sx={projectContentSx}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            alignItems={{ md: "center" }}
          >
            <FormControl sx={wideFilterField}>
              <InputLabel>Project</InputLabel>
              <Select
                label="Project"
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value as number | "");
                  // Picking a project is a request to see its contents.
                  setExpandedConfigTable("milestones");
                }}
              >
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.code}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              {loading
                ? "Loading..."
                : `${visibleMilestones.length} milestones, ${visibleTasks.length} tasks`}
            </Typography>
          </Stack>

          <Stack spacing={1.5} sx={fullHeightSx}>
            <VirtualizedTable
              tableHead="Projects"
              tableHeadSub={`${projects.length} projects · Expand to manage project records`}
              headerAction={
                canAddProject && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    onClick={() => openProjectDialog("create")}
                    sx={tableHeaderAddButtonSx}
                  >
                    Add project
                  </Button>
                )
              }
              loading={loading && projects.length === 0}
              height="100%"
              tableMinWidth="100%"
              columns={projectColumns}
              rows={projectRows}
              collapsible
              expanded={expandedConfigTable === "projects"}
              onExpandedChange={(expanded) =>
                setExpandedConfigTable(expanded ? "projects" : null)
              }
            />

            <VirtualizedTable
              tableHead="Milestones"
              tableHeadSub={
                selectedProject
                  ? `For project ${selectedProject.code}`
                  : "All projects"
              }
              headerAction={
                canAddMilestone && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    disabled={!selectedProject}
                    onClick={() => openMilestoneDialog("create")}
                    sx={tableHeaderAddButtonSx}
                  >
                    Add milestone
                  </Button>
                )
              }
              loading={loading && milestones.length === 0}
              emptyDescription={
                selectedProject
                  ? `No milestones for ${selectedProject.code} yet.`
                  : undefined
              }
              height="100%"
              tableMinWidth="100%"
              columns={milestoneColumns}
              rows={milestoneRows}
              collapsible
              expanded={expandedConfigTable === "milestones"}
              onExpandedChange={(expanded) =>
                setExpandedConfigTable(expanded ? "milestones" : null)
              }
            />

            <VirtualizedTable
              tableHead="Tasks"
              tableHeadSub={
                selectedProject
                  ? `For project ${selectedProject.code}`
                  : "All projects"
              }
              headerAction={
                canAddTask && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddOutlinedIcon />}
                    disabled={!selectedProject}
                    onClick={() => openTaskDialog("create")}
                    sx={tableHeaderAddButtonSx}
                  >
                    Add task
                  </Button>
                )
              }
              loading={loading && tasks.length === 0}
              emptyDescription={
                selectedProject
                  ? `No tasks for ${selectedProject.code} yet.`
                  : undefined
              }
              height="100%"
              tableMinWidth="100%"
              columns={taskColumns}
              rows={taskRows}
              collapsible
              expanded={expandedConfigTable === "tasks"}
              onExpandedChange={(expanded) =>
                setExpandedConfigTable(expanded ? "tasks" : null)
              }
            />
          </Stack>
        </Box>

        <Dialog
          open={dialogType !== null}
          onClose={discard.requestClose}
          onChangeCapture={discard.markDirty}
          fullWidth
          maxWidth="sm"
        >
          <DialogHeader
            title={`${dialogMode === "edit" ? "Edit" : "Create"} ${dialogType ?? ""}`}
            subtitle={
              dialogType !== "project" && selectedProject
                ? `Project ${selectedProject.code}${selectedProject.description ? ` · ${selectedProject.description}` : ""}`
                : undefined
            }
            onClose={discard.requestClose}
            closeDisabled={saving}
          />
          <DialogContent>
            {dialogType === "project" && (
              <Stack spacing={2}>
                <TextField
                  required
                  label="Project Code"
                  value={projectForm.code}
                  onChange={(event) => {
                    discard.markDirty();
                    clearFieldError("code");
                    setProjectForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }));
                  }}
                  error={Boolean(formErrors.code)}
                  helperText={formErrors.code}
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            )}

            {dialogType === "milestone" && (
              <Stack spacing={2}>
                <FormControl
                  required
                  fullWidth
                  error={Boolean(formErrors.project)}
                >
                  <InputLabel>Project</InputLabel>
                  <Select
                    label="Project"
                    value={milestoneForm.project}
                    onChange={(event) => {
                      discard.markDirty();
                      clearFieldError("project");
                      setMilestoneForm((current) => ({
                        ...current,
                        project: event.target.value,
                      }));
                    }}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={String(project.id)}>
                        {project.code}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.project && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={projectFieldHintSx}
                    >
                      {formErrors.project}
                    </Typography>
                  )}
                </FormControl>
                <TextField
                  required
                  label="Milestone Name"
                  value={milestoneForm.name}
                  onChange={(event) => {
                    discard.markDirty();
                    clearFieldError("name");
                    setMilestoneForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                  }}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                  fullWidth
                />
                <TextField
                  label="Category"
                  type="number"
                  value={milestoneForm.category}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Stack>
            )}

            {dialogType === "task" && (
              <Stack spacing={2}>
                <FormControl
                  required
                  fullWidth
                  error={Boolean(formErrors.project)}
                >
                  <InputLabel>Project</InputLabel>
                  <Select
                    label="Project"
                    value={taskForm.project}
                    onChange={(event) => {
                      discard.markDirty();
                      clearFieldError("project");
                      setTaskForm((current) => ({
                        ...current,
                        project: event.target.value,
                        milestone: "",
                      }));
                    }}
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={String(project.id)}>
                        {project.code}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.project && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={projectFieldHintSx}
                    >
                      {formErrors.project}
                    </Typography>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Milestone</InputLabel>
                  <Select
                    label="Milestone"
                    value={taskForm.milestone}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        milestone: event.target.value,
                      }))
                    }
                  >
                    <MenuItem value="">None</MenuItem>
                    {milestoneOptionsForTask.map((milestone) => (
                      <MenuItem key={milestone.id} value={String(milestone.id)}>
                        {milestone.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  required
                  label="Task Name"
                  value={taskForm.name}
                  onChange={(event) => {
                    discard.markDirty();
                    clearFieldError("name");
                    setTaskForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }));
                  }}
                  error={Boolean(formErrors.name)}
                  helperText={formErrors.name}
                  fullWidth
                />
                <TextField
                  label="Cost"
                  type="number"
                  value={taskForm.cost}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      cost: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Description"
                  value={taskForm.description}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              startIcon={
                dialogMode === "edit" ? (
                  <SaveOutlinedIcon />
                ) : (
                  <CheckOutlinedIcon />
                )
              }
              onClick={() => void saveDialog()}
              disabled={saving || !isDialogFormValid()}
            >
              {saving
                ? "Saving..."
                : dialogMode === "edit"
                  ? "Update"
                  : "Submit"}
            </Button>
          </DialogActions>
          {discard.dialog}
        </Dialog>

        <ConfirmDialog
          open={deleteTarget !== null}
          title="Delete Configuration"
          description={`Delete ${deleteTarget?.label ?? "this item"}?`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          confirmColor="error"
          confirmIcon={<DeleteOutlinedIcon />}
          confirmDisabled={deleting}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteRecord}
        />
      </Box>
    </Box>
  );
}
