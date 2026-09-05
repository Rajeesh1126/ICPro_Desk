import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import api from "../api/axios";
import { showNotification } from "../api/notificationService";
import ConfirmDialog from "../components/common/ConfirmDialog";
import {
  VirtualizedTable,
  type ColumnData,
} from "../components/common/TableView";
import {
  buttonLabelCompact,
  buttonLabelFull,
  contentGrid,
  contentGridItem,
  deleteIconSx,
  editIconSx,
  filterSurface,
  inlineCenterGapSx,
  pageHeaderActions,
  pageHeaderContent,
  pageHeader,
  page,
  pageContent,
  pageSubtitle,
  pageTitle,
  scrollableContent,
  wideFilterField,
} from "../styles/common";

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

type ConfigTableRow = Record<string, unknown> & {
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

const tableHeight = (rowCount: number, maxHeight = 360) =>
  `${Math.min(maxHeight, 112 + Math.max(rowCount, 1) * 43)}px`;

export default function ProjectConfiguration() {
  const [projects, setProjects] = useState<ProjectConfig[]>([]);
  const [milestones, setMilestones] = useState<MilestoneConfig[]>([]);
  const [tasks, setTasks] = useState<TaskConfig[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [dialogType, setDialogType] = useState<DialogType | null>(null);
  const [dialogMode, setDialogMode] = useState<DialogMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [projectForm, setProjectForm] = useState(emptyProjectForm);
  const [milestoneForm, setMilestoneForm] = useState(emptyMilestoneForm);
  const [taskForm, setTaskForm] = useState(emptyTaskForm);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: DialogType;
    id: number;
    label: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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

  const loadConfiguration = useCallback(async () => {
    setLoading(true);
    try {
      const [projectResponse, milestoneResponse, taskResponse] =
        await Promise.all([
          api.get<ProjectConfig[]>("/projects/"),
          api.get<MilestoneConfig[]>("/milestones/"),
          api.get<TaskConfig[]>("/tasks/"),
        ]);

      const nextProjects = Array.isArray(projectResponse.data)
        ? projectResponse.data
        : [];
      setProjects(nextProjects);
      setMilestones(
        Array.isArray(milestoneResponse.data) ? milestoneResponse.data : [],
      );
      setTasks(Array.isArray(taskResponse.data) ? taskResponse.data : []);

      setSelectedProjectId((current) => {
        if (current && nextProjects.some((project) => project.id === current)) {
          return current;
        }

        return nextProjects[0]?.id ?? "";
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadConfiguration();
  }, [loadConfiguration]);

  const openProjectDialog = (mode: DialogMode, project?: ProjectConfig) => {
    setDialogType("project");
    setDialogMode(mode);
    setEditingId(project?.id ?? null);
    setProjectForm({
      code: project?.code ?? "",
      description: project?.description ?? "",
    });
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
  };

  const closeDialog = () => {
    setDialogType(null);
    setEditingId(null);
  };

  const saveProject = async () => {
    const payload = {
      code: projectForm.code.trim(),
      description: projectForm.description.trim() || null,
    };

    if (!payload.code) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/projects/${editingId}/`, payload);
    } else {
      await api.post("/projects/", payload);
    }
  };

  const saveMilestone = async () => {
    const projectId = Number(milestoneForm.project);
    const payload = {
      project: projectId,
      category:
        milestoneForm.category === "" ? null : Number(milestoneForm.category),
      name: milestoneForm.name.trim(),
    };

    if (!payload.project || !payload.name) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/milestones/${editingId}/`, payload);
    } else {
      await api.post("/milestones/", payload);
    }
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

    if (!payload.project || !payload.name) return;

    if (dialogMode === "edit" && editingId) {
      await api.patch(`/tasks/${editingId}/`, payload);
    } else {
      await api.post("/tasks/", payload);
    }
  };

  const saveDialog = async () => {
    if (!dialogType) return;

    setSaving(true);
    try {
      if (dialogType === "project") await saveProject();
      if (dialogType === "milestone") await saveMilestone();
      if (dialogType === "task") await saveTask();

      showNotification({
        type: "success",
        message: "Project configuration saved successfully.",
      });
      closeDialog();
      await loadConfiguration();
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
      await loadConfiguration();
    } finally {
      setDeleting(false);
    }
  };

  const milestoneOptionsForTask = milestones.filter(
    (milestone) => milestone.project === Number(taskForm.project),
  );

  const actionColumn: ColumnData<ConfigTableRow> = {
    label: "Actions",
    width: { xs: '20%', sm: '20%' },
    render: (row) => (
      <Box
        sx={{
          ...inlineCenterGapSx,
          gap: 0.25,
          justifyContent: "flex-end",
          minWidth: 0,
          "& .MuiIconButton-root": {
            p: 0.5,
          },
        }}
      >
        <Tooltip title="Edit">
          <IconButton
            size="small"
            aria-label={`Edit ${row.name}`}
            onClick={row.onEdit}
          >
            <EditOutlinedIcon fontSize="small" sx={editIconSx} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton
            size="small"
            aria-label={`Delete ${row.name}`}
            onClick={row.onDelete}
          >
            <DeleteOutlinedIcon fontSize="small" sx={deleteIconSx} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const projectColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Code", dataKey: "name", width: { xs: '40%', sm: '40%' } },
    { label: "Description", dataKey: "description", width: { xs: '40%', sm: '40%' } },
    actionColumn,
  ];

  const milestoneColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name", width: { xs: '40%', sm: '40%' } },
    { label: "Category", dataKey: "category", width: { xs: '40%', sm: '40%' } },
    actionColumn,
  ];

  const taskColumns: ColumnData<ConfigTableRow>[] = [
    { label: "Name", dataKey: "name", width: { xs: '20%', sm: '15%' } },
    { label: "Milestone", dataKey: "milestone", width: { xs: '20%', sm: '20%' } },
    {
      label: "Cost",
      dataKey: "cost",
      width: { xs: '20%', sm: '10%' },
      numeric: true,
    },
    { label: "Description", dataKey: "description", width: "auto" },
    actionColumn,
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
      <Box component="main" sx={pageContent}>
        <Box sx={pageHeader}>
          <Box sx={pageHeaderContent}>
            <Typography variant="h5" sx={pageTitle}>Project Configuration</Typography>
            <Typography variant="body2" sx={pageSubtitle}>
              Configure projects, milestones, and tasks without assigning users.
            </Typography>
          </Box>
          <Stack
            direction={{ xs: "row-reverse", sm: "row" }}
            spacing={1}
            sx={pageHeaderActions}
          >
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              onClick={() => openProjectDialog("create")}
            >
              <Box component="span" sx={buttonLabelFull}>New Project</Box>
              <Box component="span" sx={buttonLabelCompact}>Project</Box>
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              disabled={!selectedProject}
              onClick={() => openMilestoneDialog("create")}
            >
              <Box component="span" sx={buttonLabelFull}>New Milestone</Box>
              <Box component="span" sx={buttonLabelCompact}>Milestone</Box>
            </Button>
            <Button
              variant="contained"
              startIcon={<AddOutlinedIcon />}
              disabled={!selectedProject}
              onClick={() => openTaskDialog("create")}
            >
              <Box component="span" sx={buttonLabelFull}>New Task</Box>
              <Box component="span" sx={buttonLabelCompact}>Task</Box>
            </Button>
          </Stack>
        </Box>

        <Box sx={scrollableContent}>
          <Paper
            elevation={0}
            sx={filterSurface}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
            >
              <FormControl
                size="small"
                sx={wideFilterField}
              >
                <InputLabel>Project</InputLabel>
                <Select
                  label="Project"
                  value={selectedProjectId}
                  onChange={(event) =>
                    setSelectedProjectId(event.target.value as number | "")
                  }
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
          </Paper>

          <Box sx={contentGrid}>
            <Box sx={contentGridItem}>
              <VirtualizedTable
                tableHead="Projects"
                height={tableHeight(projectRows.length)}
                // tableMinWidth={520}
                tableMinWidth="100%"
                columns={projectColumns}
                rows={projectRows}
              />
            </Box>

            <Box sx={contentGridItem}>
              <VirtualizedTable
                tableHead={
                  selectedProject
                    ? `Milestones - ${selectedProject.code}`
                    : "Milestones"
                }
                height={tableHeight(milestoneRows.length)}
                tableMinWidth="100%"
                columns={milestoneColumns}
                rows={milestoneRows}
              />
            </Box>

            <Box sx={contentGridItem}>
              <VirtualizedTable
                tableHead={
                  selectedProject ? `Tasks - ${selectedProject.code}` : "Tasks"
                }
                height={tableHeight(taskRows.length)}
                tableMinWidth={520}
                columns={taskColumns}
                rows={taskRows}
              />
            </Box>
          </Box>
        </Box>

        <Dialog
          open={dialogType !== null}
          onClose={closeDialog}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            {dialogMode === "edit" ? "Edit" : "Create"} {dialogType}
          </DialogTitle>
          <DialogContent>
            {dialogType === "project" && (
              <Stack spacing={2}>
                <TextField
                  label="Project Code"
                  value={projectForm.code}
                  onChange={(event) =>
                    setProjectForm((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  size="small"
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
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            )}

            {dialogType === "milestone" && (
              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    label="Project"
                    value={milestoneForm.project}
                    onChange={(event) =>
                      setMilestoneForm((current) => ({
                        ...current,
                        project: event.target.value,
                      }))
                    }
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={String(project.id)}>
                        {project.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Milestone Name"
                  value={milestoneForm.name}
                  onChange={(event) =>
                    setMilestoneForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  size="small"
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
                  size="small"
                  fullWidth
                />
              </Stack>
            )}

            {dialogType === "task" && (
              <Stack spacing={2}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Project</InputLabel>
                  <Select
                    label="Project"
                    value={taskForm.project}
                    onChange={(event) =>
                      setTaskForm((current) => ({
                        ...current,
                        project: event.target.value,
                        milestone: "",
                      }))
                    }
                  >
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={String(project.id)}>
                        {project.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" fullWidth>
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
                  label="Task Name"
                  value={taskForm.name}
                  onChange={(event) =>
                    setTaskForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  size="small"
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
                  size="small"
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
                  size="small"
                  fullWidth
                  multiline
                  minRows={3}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              startIcon={<CancelOutlinedIcon />}
              onClick={closeDialog}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveOutlinedIcon />}
              onClick={() => void saveDialog()}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>

        <ConfirmDialog
          open={deleteTarget !== null}
          title="Delete Configuration"
          description={`Delete ${deleteTarget?.label ?? "this item"}?`}
          confirmLabel={deleting ? "Deleting..." : "Delete"}
          confirmColor="error"
          confirmDisabled={deleting}
          titleIcon={<DeleteOutlinedIcon fontSize="small" />}
          onClose={() => setDeleteTarget(null)}
          onConfirm={deleteRecord}
        />
      </Box>
    </Box>
  );
}
